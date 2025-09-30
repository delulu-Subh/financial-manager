import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, AreaChart, Area, CartesianGrid, ResponsiveContainer } from 'recharts';

// Dynamic data generation based on time range
const generateDataForPeriod = (period) => {
  const now = new Date();
  const data = [];
  
  const configs = {
    '7d': {
      points: 7,
      baseValue: 5,
      variation: 8,
      labels: (i) => new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' })
    },
    '30d': {
      points: 30,
      baseValue: 8,
      variation: 12,
      labels: (i) => {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }
    },
    '90d': {
      points: 13,
      baseValue: 25,
      variation: 20,
      labels: (i) => `W${13 - i}`
    },
    '1y': {
      points: 12,
      baseValue: 15,
      variation: 15,
      labels: (i) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[11 - i];
      }
    }
  };

  const config = configs[period];
  
  for (let i = config.points - 1; i >= 0; i--) {
    data.push({
      month: config.labels(i),
      value: Math.max(1, Math.round(config.baseValue + (Math.random() - 0.5) * config.variation))
    });
  }
  
  return data;
};

const generateIncomeDataForPeriod = (period) => {
  const now = new Date();
  const data = [];
  
  const configs = {
    '7d': {
      points: 7,
      baseIncome: 500,
      variation: 300,
      labels: (i) => new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' })
    },
    '30d': {
      points: 30,
      baseIncome: 800,
      variation: 500,
      labels: (i) => {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }
    },
    '90d': {
      points: 13,
      baseIncome: 5000,
      variation: 3000,
      labels: (i) => `W${13 - i}`
    },
    '1y': {
      points: 12,
      baseIncome: 25000,
      variation: 15000,
      labels: (i) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[11 - i];
      }
    }
  };

  const config = configs[period];
  
  for (let i = config.points - 1; i >= 0; i--) {
    const income = Math.max(100, Math.round(config.baseIncome + (Math.random() - 0.5) * config.variation));
    data.push({
      month: config.labels(i),
      value: income,
      primary: Math.round(income * 0.7),
      secondary: Math.round(income * 0.3)
    });
  }
  
  return data;
};

const generateKPIsForPeriod = (period) => {
  const multipliers = {
    '7d': { income: 3500, clients: 2, projects: 1 },
    '30d': { income: 15000, clients: 8, projects: 5 },
    '90d': { income: 45000, clients: 25, projects: 18 },
    '1y': { income: 250000, clients: 120, projects: 85 }
  };

  const mult = multipliers[period];
  const income = mult.income + Math.round((Math.random() - 0.5) * mult.income * 0.3);
  const clients = mult.clients + Math.round((Math.random() - 0.5) * mult.clients * 0.4);
  const projects = mult.projects + Math.round((Math.random() - 0.5) * mult.projects * 0.3);
  const successRate = 25 + Math.round(Math.random() * 25);

  return {
    totalIncome: Math.max(1000, income),
    successRate: Math.max(10, Math.min(90, successRate)),
    newClients: Math.max(1, clients),
    completedProjects: Math.max(1, projects)
  };
};

const generateFunnelData = (period) => {
  const base = period === '7d' ? 50 : period === '30d' ? 200 : period === '90d' ? 600 : 2400;
  const inquiries = base + Math.round(Math.random() * base * 0.3);
  const booked = Math.round(inquiries * 0.36);
  const completed = Math.round(booked * 0.85);
  const revenue = completed * (period === '7d' ? 500 : period === '30d' ? 2000 : period === '90d' ? 5000 : 25000);
  
  return [
    { stage: 'Inquiries', value: inquiries, percentage: 100 },
    { stage: 'Booked', value: booked, percentage: Math.round((booked / inquiries) * 100) },
    { stage: 'Completed', value: completed, percentage: Math.round((completed / inquiries) * 100) },
    { stage: 'Revenue', value: revenue, percentage: Math.round((completed / inquiries) * 100) }
  ];
};

const sourceData = [
  { name: 'Web', value: 60 },
  { name: 'Email', value: 30 },
  { name: 'Instagram', value: 22 },
  { name: 'TikTok', value: 8 },
  { name: 'Pinterest', value: 5 }
];

const PowerBIDashboard = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [monthlyData, setMonthlyData] = useState([]);
  const [incomeMonthly, setIncomeMonthly] = useState([]);
  const [incomeSourceMonthly, setIncomeSourceMonthly] = useState([]);
  const [kpis, setKpis] = useState({});
  const [funnelData, setFunnelData] = useState([]);

  useEffect(() => {
    setMonthlyData(generateDataForPeriod(timeRange));
    setIncomeMonthly(generateIncomeDataForPeriod(timeRange));
    setIncomeSourceMonthly(generateIncomeDataForPeriod(timeRange));
    setKpis(generateKPIsForPeriod(timeRange));
    setFunnelData(generateFunnelData(timeRange));
  }, [timeRange]);

  const TimeRangeSelector = () => {
    const ranges = [
      { value: '7d', label: '7 Days' },
      { value: '30d', label: '30 Days' },
      { value: '90d', label: '90 Days' },
      { value: '1y', label: '1 Year' }
    ];

    return (
      <div className="flex rounded-lg bg-gray-100 p-1">
        {ranges.map(range => (
          <button
            key={range.value}
            onClick={() => setTimeRange(range.value)}
            className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
              timeRange === range.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <TimeRangeSelector />
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded text-sm w-64"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button className="px-3 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50">
            Filter
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-gray-100 rounded mr-3 flex items-center justify-center">💰</div>
            <span className="text-sm text-gray-500">Total Income</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">${kpis.totalIncome?.toLocaleString()}.00</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-gray-100 rounded mr-3 flex items-center justify-center">📊</div>
            <span className="text-sm text-gray-500">Inquiry Success Rate</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{kpis.successRate}%</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-gray-100 rounded mr-3 flex items-center justify-center">👥</div>
            <span className="text-sm text-gray-500">Number of New Clients</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{kpis.newClients}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-gray-100 rounded mr-3 flex items-center justify-center">✅</div>
            <span className="text-sm text-gray-500">Number of Completed Projects</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{kpis.completedProjects}</div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm text-gray-500 font-medium mb-4">Inquiry Breakdown</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="relative">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Booked', value: 36.2, fill: '#8B5CF6' },
                      { name: 'Flopped', value: 63.8, fill: '#E5E7EB' }
                    ]}
                    cx={100}
                    cy={100}
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <div className="text-sm text-gray-600">Booked</div>
                <div className="text-lg font-semibold text-gray-900">36.2%</div>
              </div>
            </div>
          </div>
          <div className="flex justify-between text-sm mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
              <span>Booked 36.2%</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
              <span>Flopped 63.8%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm text-gray-500 font-medium mb-4">Inquiries per Month</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm text-gray-500 font-medium mb-4">Inquiry Source Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm text-gray-500 font-medium mb-4">Income per Quarter</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="relative">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Q1', value: 13.1, fill: '#3B82F6' },
                      { name: 'Q2', value: 28.6, fill: '#8B5CF6' },
                      { name: 'Q3', value: 28, fill: '#EC4899' },
                      { name: 'Q4', value: 30.3, fill: '#1F2937' }
                    ]}
                    cx={100}
                    cy={100}
                    innerRadius={50}
                    outerRadius={90}
                    dataKey="value"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs mt-4">
            <div><span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1"></span>Q1 13.1%</div>
            <div><span className="inline-block w-2 h-2 bg-purple-500 rounded-full mr-1"></span>Q2 28.6%</div>
            <div><span className="inline-block w-2 h-2 bg-pink-500 rounded-full mr-1"></span>Q3 28%</div>
            <div><span className="inline-block w-2 h-2 bg-gray-800 rounded-full mr-1"></span>Q4 30.3%</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm text-gray-500 font-medium mb-4">Income Source per Month</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeSourceMonthly}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="primary" stackId="a" fill="#1F2937" radius={[0, 0, 0, 0]} />
                <Bar dataKey="secondary" stackId="a" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Advanced Analytics Row */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm text-gray-500 font-medium mb-4">Income Growth Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={incomeMonthly}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Income']} />
                <Area type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm text-gray-500 font-medium mb-4">Sales Funnel Pipeline</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="w-full space-y-2">
              {funnelData.map((stage, index) => (
                <div key={index} className="relative">
                  <div 
                    className="h-12 flex items-center justify-between px-4 text-white font-medium text-sm transition-all"
                    style={{
                      backgroundColor: `rgba(139, 92, 246, ${1 - index * 0.2})`,
                      width: `${100 - index * 15}%`,
                      margin: '0 auto'
                    }}
                  >
                    <span>{stage.stage}</span>
                    <span>{stage.value.toLocaleString()} ({stage.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PowerBIDashboard;
