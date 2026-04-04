import React, { useEffect, useState, useMemo } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { useAuthStore } from '../store/useAuthStore';
import { Plus, Search, Trash2 } from 'lucide-react';
import type { TransactionType } from '../types';

const TransactionsList = () => {
  const { transactions, fetchTransactions, loading, addTransaction, deleteTransaction } = useFinanceStore();
  const { user } = useAuthStore();
  const role = user?.role || 'Viewer';
  const currency = user?.currencyCode || 'USD';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'All'>('All');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: 'Groceries',
    type: 'Expense' as TransactionType
  });
  const [otherLabel, setOtherLabel] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchSearch = t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType === 'All' || t.type === filterType;
      return matchSearch && matchType;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, filterType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If 'Other' is selected, use the custom label; otherwise use the selected category
    const finalCategory = formData.category === 'Other' ? (otherLabel || 'Other') : formData.category;

    await addTransaction({
      ...formData,
      category: finalCategory,
      amount: Number(formData.amount),
    });
    setShowModal(false);
    setFormData({ title: '', date: new Date().toISOString().split('T')[0], amount: '', category: 'Groceries', type: 'Expense' });
    setOtherLabel('');
  };

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h2 className="h4 fw-bold mb-1">Transactions</h2>
          <p className="text-muted mb-0 small">Manage and track your financial history.</p>
        </div>
        
        {role === 'Admin' && (
          <button 
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={() => setShowModal(true)}
          >
            <Plus size={18} /> Add Transaction
          </button>
        )}
      </div>

      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body p-4">
          
          {/* Filters */}
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0">
                  <Search size={18} className="text-muted" />
                </span>
                <input 
                  type="text" 
                  className="form-control border-start-0 ps-0" 
                  placeholder="Search by category..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select 
                className="form-select" 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value as TransactionType | 'All')}
              >
                <option value="All">All Types</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading && transactions.length === 0 ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-5 text-muted">
              No transactions found.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="rounded-start">Date</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Amount</th>
                    {role === 'Admin' && <th className="text-end rounded-end">Actions</th>}
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {filteredTransactions.map(tx => (
                    <tr key={tx.id}>
                      <td className="text-muted">{new Date(tx.date).toLocaleDateString()}</td>
                      <td className="fw-medium">{tx.title}</td>
                      <td className="text-muted small">{tx.category}</td>
                      <td>
                        <span className={`badge rounded-pill bg-opacity-10 px-3 py-2 text-dark ${tx.type === 'Income' ? 'bg-success text-success' : 'bg-danger text-danger'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className={`fw-bold ${tx.type === 'Income' ? 'text-success' : ''}`}>
                        {tx.type === 'Income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                      {role === 'Admin' && (
                        <td className="text-end">
                          <button 
                            className="btn btn-sm btn-light text-danger border-0 hover-danger p-2"
                            onClick={() => deleteTransaction(tx.id)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-light border-0">
                <h5 className="modal-title fw-bold">Add Transaction</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body p-4 bg-body">
                <form onSubmit={handleSubmit} id="transactionForm">
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">Title</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Weekly Grocery, Netflix Bill"
                      required 
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">Date</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      required 
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <div className="row mb-3">
                    <div className="col-6">
                      <label className="form-label text-muted small fw-bold">Type</label>
                      <select 
                        className="form-select" 
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value as TransactionType})}
                      >
                        <option value="Expense">Expense</option>
                        <option value="Income">Income</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label text-muted small fw-bold">Amount ({currency})</label>
                      <div className="input-group">
                        <span className="input-group-text px-2 bg-light border-end-0 text-muted small">{currency}</span>
                        <input 
                          type="number" 
                          className="form-control border-start-0 ps-0" 
                          required 
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.amount}
                          onChange={e => setFormData({...formData, amount: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label text-muted small fw-bold">Category</label>
                    <select 
                      className="form-select"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      {formData.type === 'Expense' ? (
                        <>
                          <option value="Groceries">Groceries</option>
                          <option value="Utilities">Utilities</option>
                          <option value="Rent">Rent</option>
                          <option value="EMI">EMI</option>
                          <option value="Investments">Investments</option>
                          <option value="Traveling">Traveling</option>
                          <option value="Savings">Savings</option>
                          <option value="Entertainment">Entertainment</option>
                          <option value="Other">Other</option>
                        </>
                      ) : (
                        <>
                          <option value="Salary">Salary</option>
                          <option value="Investment">Investment</option>
                          <option value="Other">Other</option>
                        </>
                      )}
                    </select>
                  </div>

                  {formData.category === 'Other' && (
                    <div className="mb-4 animate-fade-in">
                      <label className="form-label text-muted small fw-bold">Custom Category Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. Gym, Insurance, etc."
                        required 
                        value={otherLabel}
                        onChange={e => setOtherLabel(e.target.value)}
                      />
                    </div>
                  )}
                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary px-4 fw-medium">Save</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsList;
