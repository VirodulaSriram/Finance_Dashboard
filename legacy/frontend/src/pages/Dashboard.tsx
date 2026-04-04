import { useEffect, useMemo } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { useAuthStore } from '../store/useAuthStore';
import { ArrowDownRight, ArrowUpRight, DollarSign, Lightbulb } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658'];

const Dashboard = () => {
  const { transactions, fetchTransactions, loading, insights, insightsLoading, generateInsights } = useFinanceStore();
  const { user } = useAuthStore();
  const currency = user?.currencyCode || 'USD';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const { totalIncome, totalExpense, balance } = useMemo(() => {
    return transactions.reduce(
      (acc, curr) => {
        if (curr.type === 'Income') {
          acc.totalIncome += curr.amount;
          acc.balance += curr.amount;
        } else {
          acc.totalExpense += curr.amount;
          acc.balance -= curr.amount;
        }
        return acc;
      },
      { totalIncome: 0, totalExpense: 0, balance: 0 }
    );
  }, [transactions]);

  // Data for charts
  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'Expense');
    const categories: Record<string, number> = {};
    expenses.forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const trendData = useMemo(() => {
    // Sort transactions by date and calculate running balance
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let currentBalance = 0;
    return sorted.map(t => {
      currentBalance += t.type === 'Income' ? t.amount : -t.amount;
      return {
        date: t.date,
        balance: currentBalance
      };
    });
  }, [transactions]);

  if (loading && transactions.length === 0) {
    return <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>;
  }

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h2 className="h4 fw-bold mb-0">Overview</h2>
      </div>

      {/* Summary Cards */}
      <div className="row g-4">
        <div className="col-md-4">
          <div className="card card-stats h-100">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3 text-muted">
                <div className="icon-box bg-gradient-primary me-3">
                  <DollarSign size={24} />
                </div>
                <h6 className="card-title text-uppercase mb-0">Total Balance</h6>
              </div>
              <h3 className="card-text fw-bold mb-0">{formatCurrency(balance)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card card-stats h-100">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3 text-muted">
                <div className="icon-box bg-gradient-success me-3">
                  <ArrowUpRight size={24} />
                </div>
                <h6 className="card-title text-uppercase mb-0">Total Income</h6>
              </div>
              <h3 className="card-text fw-bold text-success mb-0">{formatCurrency(totalIncome)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card card-stats h-100">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3 text-muted">
                <div className="icon-box bg-gradient-warning me-3">
                  <ArrowDownRight size={24} />
                </div>
                <h6 className="card-title text-uppercase mb-0">Total Expenses</h6>
              </div>
              <h3 className="card-text fw-bold text-danger mb-0">{formatCurrency(totalExpense)}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mt-2">
        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3">
          <div className="d-flex align-items-center gap-2">
            <Lightbulb className="text-warning" size={20} />
            <h5 className="mb-0 fw-bold">AI Financial Insights</h5>
          </div>
          <button 
            className="btn btn-sm btn-outline-light" 
            onClick={generateInsights}
            disabled={insightsLoading}
          >
            {insightsLoading ? 'Analyzing...' : 'Generate New Insights'}
          </button>
        </div>
        <div className="card-body p-4 bg-body">
          {insightsLoading ? (
            <div className="d-flex align-items-center gap-3 text-muted">
              <div className="spinner-grow spinner-grow-sm text-warning" role="status"></div>
              <span>Gemini is analyzing your spending patterns...</span>
            </div>
          ) : insights ? (
            <div className="mb-0 text-body" style={{ whiteSpace: 'pre-wrap' }}>
              {insights}
            </div>
          ) : (
            <p className="text-muted mb-0">Click the button above to get personalized financial advice using AI.</p>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="row g-4 mt-2">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100 rounded-4">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-4">Balance Trend</h5>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="date" tick={{fontSize: 12}} />
                    <YAxis tick={{fontSize: 12}} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="balance" stroke="#667eea" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100 rounded-4">
            <div className="card-body d-flex flex-column">
              <h5 className="card-title fw-bold mb-4">Expenses Breakdown</h5>
              <div className="flex-grow-1" style={{ minHeight: '300px' }}>
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => formatCurrency(value)} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                    No expense data
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
