import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DBState, Expense, money, esc, uid } from '../utils/db';

interface ExpensesProps {
  db: DBState;
  refresh: () => void;
  updateDB: (updater: (prev: DBState) => DBState) => void;
}

const CATEGORIES = ['Software', 'Hardware', 'Travel', 'Marketing', 'Education', 'Office', 'Other'];

export function Expenses({ db, refresh, updateDB }: ExpensesProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    category: 'Software'
  });

  useEffect(() => {
    if (showForm && !editingId) setForm({ description: '', amount: '', date: new Date().toISOString().slice(0, 10), category: 'Software' });
  }, [showForm, editingId]);

  useEffect(() => {
    if (editingId) {
      const e = db.expenses.find(e => e.id === editingId);
      if (e) setForm({ description: e.description, amount: String(e.amount), date: e.date, category: e.category });
    }
  }, [editingId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!form.description.trim() || isNaN(amount) || amount <= 0) {
      alert('Description and a positive amount required.');
      return;
    }
    if (editingId) {
      updateDB(prev => ({ ...prev, expenses: prev.expenses.map(ex => ex.id === editingId ? {
        ...ex, description: form.description.trim(), amount, date: form.date, category: form.category
      } : ex) }));
    } else {
      updateDB(prev => ({ ...prev, expenses: [...prev.expenses, { id: uid(), description: form.description.trim(), amount, date: form.date, category: form.category }] }));
    }
    setShowForm(false); setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this expense?')) updateDB(prev => ({ ...prev, expenses: prev.expenses.filter(e => e.id !== id) }));
  };

  const monthlyTotals = useMemo(() => {
    const map = new Map<string, number>();
    db.expenses.forEach(e => {
      const m = e.date.slice(0, 7);
      map.set(m, (map.get(m) || 0) + e.amount);
    });
    return Array.from(map.entries()).sort().map(([month, total]) => ({ month, total }));
  }, [db.expenses]);

  const itemVariants = { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 20 } };

  return (
    <div>
      <div className="toolbar">
        <h2>Expenses</h2>
        <motion.button className="btn primary" onClick={() => setShowForm(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          + Add expense
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div className="form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
            <form onSubmit={handleSubmit}>
              <div className="grid2">
                <div>
                  <label>Description</label>
                  <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Figma subscription" required />
                </div>
                <div>
                  <label>Amount (USD)</label>
                  <input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="24.00" required />
                </div>
              </div>
              <div className="grid2">
                <div>
                  <label>Date</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div>
                  <label>Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="actions">
                <motion.button type="submit" className="btn primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  {editingId ? 'Update expense' : 'Add expense'}
                </motion.button>
                <motion.button type="button" className="btn" onClick={() => { setShowForm(false); setEditingId(null); }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {monthlyTotals.length > 0 && (
        <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '12px' }}>
          <div className="label">Monthly totals</div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
            {monthlyTotals.map(m => (
              <div key={m.month} style={{ fontFamily: 'var(--mono)', fontSize: '14px', color: 'var(--down)' }}>
                {m.month.slice(2).replace('-', '/')}: {money(m.total)}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div>
        <AnimatePresence>
          {db.expenses.length === 0 ? (
            <motion.div className="item" initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="empty">
              <span className="meta">No expenses yet. Add your first.</span>
            </motion.div>
          ) : (
            db.expenses.slice().reverse().map((e, idx) => (
              <motion.div key={e.id} className="item" variants={itemVariants} initial="hidden" animate="visible" exit="exit" transition={{ delay: idx * 0.03 }}>
                <div>
                  <div className="name">{esc(e.description)}</div>
                  <div className="meta">{esc(e.date)} · {esc(e.category)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="amt" style={{ color: 'var(--down)' }}>{money(e.amount)}</span>
                  <motion.button className="small-btn" onClick={() => { setEditingId(e.id); setShowForm(true); }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>Edit</motion.button>
                  <motion.button className="small-btn" onClick={() => handleDelete(e.id)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>✕</motion.button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}