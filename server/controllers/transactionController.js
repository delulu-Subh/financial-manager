import Transaction from "../models/Transaction.js";

export const getTransactions = async (req, res) => {
  const transactions = await Transaction.find();
  res.json(transactions);
};

export const addTransaction = async (req, res) => {
  const transaction = new Transaction(req.body);
  const saved = await transaction.save();
  res.json(saved);
};
