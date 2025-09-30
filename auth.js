// ===== server/routes/auth.js =====
const express = require('express');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { generateTokens, verifyRefreshToken } = require('../utils/jwt');

const router = express.Router();

// Register new user
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().isLength({ min: 2, max: 50 }),
  body('lastName').trim().isLength({ min: 2, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, currency = 'USD' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      currency
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens({ userId: user.id });

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        currency: user.currency
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens({ userId: user.id });

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        currency: user.currency
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findByPk(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    // Generate new tokens
    const tokens = generateTokens({ userId: user.id });

    // Update refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json(tokens);
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(403).json({ message: 'Invalid refresh token' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findByPk(decoded.userId);
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.json({ message: 'Logged out successfully' });
  }
});

module.exports = router;

// ===== server/routes/user.js =====
const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      currency: user.currency,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
  body('currency').optional().isLength({ min: 3, max: 3 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, currency } = req.body;
    const user = req.user;

    // Update user
    await user.update({
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(currency && { currency })
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        currency: user.currency
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

// ===== server/routes/transactions.js =====
const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Transaction, Category } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Get all transactions with filtering and pagination
router.get('/', authenticateToken, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional().isIn(['income', 'expense']),
  query('categoryId').optional().isUUID(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 20,
      type,
      categoryId,
      startDate,
      endDate,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { userId: req.user.id };

    // Apply filters
    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (startDate && endDate) {
      where.date = {
        [Op.between]: [startDate, endDate]
      };
    }
    if (search) {
      where.description = {
        [Op.iLike]: `%${search}%`
      };
    }

    const { count, rows } = await Transaction.findAndCountAll({
      where,
      include: [{
        model: Category,
        as: 'category',
        attributes: ['name', 'color', 'icon']
      }],
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      transactions: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new transaction
router.post('/', authenticateToken, [
  body('amount').isFloat({ min: 0.01 }),
  body('description').trim().isLength({ min: 1, max: 255 }),
  body('type').isIn(['income', 'expense']),
  body('categoryId').isUUID(),
  body('date').optional().isISO8601(),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, description, type, categoryId, date, notes } = req.body;

    // Verify category belongs to user
    const category = await Category.findOne({
      where: { id: categoryId, userId: req.user.id }
    });

    if (!category) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const transaction = await Transaction.create({
      amount,
      description,
      type,
      categoryId,
      date: date || new Date(),
      notes,
      userId: req.user.id
    });

    const newTransaction = await Transaction.findByPk(transaction.id, {
      include: [{
        model: Category,
        as: 'category',
        attributes: ['name', 'color', 'icon']
      }]
    });

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction: newTransaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update transaction
router.put('/:id', authenticateToken, [
  body('amount').optional().isFloat({ min: 0.01 }),
  body('description').optional().trim().isLength({ min: 1, max: 255 }),
  body('type').optional().isIn(['income', 'expense']),
  body('categoryId').optional().isUUID(),
  body('date').optional().isISO8601(),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;

    const transaction = await Transaction.findOne({
      where: { id, userId: req.user.id }
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Verify category if provided
    if (updates.categoryId) {
      const category = await Category.findOne({
        where: { id: updates.categoryId, userId: req.user.id }
      });
      if (!category) {
        return res.status(400).json({ message: 'Invalid category' });
      }
    }

    await transaction.update(updates);

    const updatedTransaction = await Transaction.findByPk(id, {
      include: [{
        model: Category,
        as: 'category',
        attributes: ['name', 'color', 'icon']
      }]
    });

    res.json({
      message: 'Transaction updated successfully',
      transaction: updatedTransaction
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete transaction
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({
      where: { id, userId: req.user.id }
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    await transaction.destroy();

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

// ===== server/routes/categories.js =====
const express = require('express');
const { body, validationResult } = require('express-validator');
const { Category, Transaction } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all categories
router.get('/', authenticateToken, async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { userId: req.user.id },
      order: [['name', 'ASC']]
    });

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new category
router.post('/', authenticateToken, [
  body('name').trim().isLength({ min: 1, max: 100 }),
  body('type').isIn(['income', 'expense']),
  body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/),
  body('icon').optional().trim().isLength({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, type, color, icon } = req.body;

    const category = await Category.create({
      name,
      type,
      color: color || '#6B7280',
      icon: icon || 'folder',
      userId: req.user.id
    });

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update category
router.put('/:id', authenticateToken, [
  body('name').optional().trim().isLength({ min: 1, max: 100 }),
  body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/),
  body('icon').optional().trim().isLength({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;

    const category = await Category.findOne({
      where: { id, userId: req.user.id }
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.update(updates);

    res.json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete category
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({
      where: { id, userId: req.user.id }
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has transactions
    const transactionCount = await Transaction.count({
      where: { categoryId: id }
    });

    if (transactionCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with existing transactions'
      });
    }

    await category.destroy();

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

// ===== server/routes/reports.js =====
const express = require('express');
const { query, validationResult } = require('express-validator');
const { Transaction, Category } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Get financial summary
router.get('/summary', authenticateToken, [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('period').optional().isIn(['week', 'month', 'quarter', 'year'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let { startDate, endDate, period } = req.query;
    const userId = req.user.id;

    // Set default date range if not provided
    if (period && !startDate && !endDate) {
      const now = new Date();
      switch (period) {
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          endDate = new Date();
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1);
          endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31);
          break;
      }
    }

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    // Get total income and expenses
    const [income, expenses] = await Promise.all([
      Transaction.sum('amount', {
        where: { userId, type: 'income', ...dateFilter }
      }),
      Transaction.sum('amount', {
        where: { userId, type: 'expense', ...dateFilter }
      })
    ]);

    // Get transactions by category
    const categoryBreakdown = await Transaction.findAll({
      attributes: [
        'type',
        [Transaction.sequelize.fn('SUM', Transaction.sequelize.col('amount')), 'total']
      ],
      include: [{
        model: Category,
        as: 'category',
        attributes: ['name', 'color', 'icon']
      }],
      where: { userId, ...dateFilter },
      group: ['type', 'category.id', 'category.name', 'category.color', 'category.icon'],
      raw: true
    });

    // Get recent transactions
    const recentTransactions = await Transaction.findAll({
      where: { userId },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['name', 'color', 'icon']
      }],
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
      limit: 10
    });

    res.json({
      summary: {
        totalIncome: income || 0,
        totalExpenses: expenses || 0,
        netIncome: (income || 0) - (expenses || 0),
        period: { startDate, endDate }
      },
      categoryBreakdown,
      recentTransactions
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get monthly trends
router.get('/trends', authenticateToken, [
  query('months').optional().isInt({ min: 1, max: 12 })
], async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const userId = req.user.id;

    // Get data for the last N months
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const monthlyData = await Transaction.findAll({
      attributes: [
        [Transaction.sequelize.fn('DATE_TRUNC', 'month', Transaction.sequelize.col('date')), 'month'],
        'type',
        [Transaction.sequelize.fn('SUM', Transaction.sequelize.col('amount')), 'total']
      ],
      where: {
        userId,
        date: {
          [Op.gte]: startDate
        }
      },
      group: ['month', 'type'],
      order: [['month', 'ASC']],
      raw: true
    });

    res.json({ trends: monthlyData });
  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

// ===== server/config/seed.js =====
const { User, Category } = require('../models');

const defaultCategories = [
  // Income categories
  { name: 'Salary', type: 'income', color: '#10B981', icon: 'banknotes', isDefault: true },
  { name: 'Freelance', type: 'income', color: '#059669', icon: 'briefcase', isDefault: true },
  { name: 'Investments', type: 'income', color: '#047857', icon: 'chart-bar', isDefault: true },
  { name: 'Other Income', type: 'income', color: '#065F46', icon: 'plus-circle', isDefault: true },

  // Expense categories
  { name: 'Food & Dining', type: 'expense', color: '#EF4444', icon: 'cake', isDefault: true },
  { name: 'Transportation', type: 'expense', color: '#F97316', icon: 'truck', isDefault: true },
  { name: 'Shopping', type: 'expense', color: '#EAB308', icon: 'shopping-bag', isDefault: true },
  { name: 'Entertainment', type: 'expense', color: '#8B5CF6', icon: 'film', isDefault: true },
  { name: 'Bills & Utilities', type: 'expense', color: '#06B6D4', icon: 'bolt', isDefault: true },
  { name: 'Healthcare', type: 'expense', color: '#EC4899', icon: 'heart', isDefault: true },
  { name: 'Education', type: 'expense', color: '#3B82F6', icon: 'academic-cap', isDefault: true },
  { name: 'Other Expenses', type: 'expense', color: '#6B7280', icon: 'ellipsis-horizontal', isDefault: true }
];

const seedDefaultCategories = async (userId) => {
  try {
    const categoriesToCreate = defaultCategories.map(cat => ({
      ...cat,
      userId
    }));

    await Category.bulkCreate(categoriesToCreate);
    console.log(`✅ Default categories created for user ${userId}`);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
  }
};

module.exports = { seedDefaultCategories };
