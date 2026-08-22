import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DBState, Invoice, money, esc, uid } from '../utils/db';

interface InvoicesProps {
  db: DBState;
  refresh: () => void;
  updateDB: (updater: (prev: DBState) => DBState) => void;
}

export function Invoices({ db, refresh, updateDB }: InvoicesProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const blankForm = {
    clientId: '',
    number: `INV-${String(db.nextInv).padStart(3, '0')}`,
    description: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    status: 'sent' as 'draft' | 'sent' | 'paid'
  };
  const [form, setForm] = useState(blankForm);

  useEffect(() => {
    if (showForm && !editingId) setForm(blankForm);
  }, [showForm, editingId]);

  useEffect(() => {
    if (editingId) {
      const inv = db.invoices.find(i => i.id === editingId);
      if (inv) setForm({
        clientId: inv.clientId,
        number: inv.number,
        description: inv.description,
        amount: String(inv.amount),
        date: inv.date,
        status: inv.status
      });
    }
  }, [editingId]);

  const clients = db.clients.filter(c => c.status === 'active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!form.clientId || !form.description.trim() || isNaN(amount) || amount <= 0) {
      alert('Client, description and a positive amount required.');
      return;
    }
    if (editingId) {
      updateDB(prev => ({
        ...prev,
        invoices: prev.invoices.map(i => i.id === editingId ? {
          ...i, clientId: form.clientId, number: form.number,
          description: form.description.trim(), amount, date: form.date, status: form.status
        } : i)
      }));
    } else {
      const newInv: Invoice = {
        id: uid(), clientId: form.clientId, number: form.number,
        description: form.description.trim(), amount, date: form.date, status: form.status
      };
      updateDB(prev => ({ ...prev, invoices: [...prev.invoices, newInv], nextInv: prev.nextInv + 1 }));
    }
    closeForm();
  };

  const closeForm = () => { setShowForm(false); setEditingId(null); };

  const handleDelete = (id: string) => {
    if (confirm('Delete this invoice?')) {
      updateDB(prev => ({ ...prev, invoices: prev.invoices.filter(i => i.id !== id) }));
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  };

  return (
    <div>
      <div className="toolbar">
        <h2>Invoices</h2>
        <motion.button className="btn primary" onClick={() => setShowForm(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          + New invoice
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div className="form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
            <form onSubmit={handleSubmit}>
              <div className="grid2">
                <div>
                  <label>Client</label>
                  <select value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} required>
                    <option value="">— select client —</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{esc(c.name)}</option>)}
                  </select>
                </div>
                <div>
                  <label>Invoice #</label>
                  <input type="text" value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} required />
                </div>
              </div>
              <div className="grid2">
                <div>
                  <label>Description</label>
                  <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Website design — landing page" required />
                </div>
                <div>
                  <label>Amount (USD)</label>
                  <input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="500.00" required />
                </div>
              </div>
              <div className="grid2">
                <div>
                  <label>Date</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div>
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as 'draft' | 'sent' | 'paid' })}>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>
              <div className="actions">
                <motion.button type="submit" className="btn primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  {editingId ? 'Update invoice' : 'Save invoice'}
                </motion.button>
                <motion.button type="button" className="btn" onClick={closeForm} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <AnimatePresence>
          {db.invoices.length === 0 ? (
            <motion.div className="item" initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="empty">
              <span className="meta">No invoices yet. Create your first.</span>
            </motion.div>
          ) : (
            db.invoices.slice().reverse().map((inv, idx) => {
              const client = db.clients.find(c => c.id === inv.clientId);
              return (
                <motion.div key={inv.id} className="item" variants={itemVariants} initial="hidden" animate="visible" exit="exit" transition={{ delay: idx * 0.03 }}>
                  <div>
                    <div className="name">{esc(inv.number)} — {esc(inv.description)}</div>
                    <div className="meta">{client ? esc(client.name) : 'Unknown client'} · {esc(inv.date)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <motion.span className={`tag ${inv.status}`} initial={{ scale: 0.8 }} animate={{ scale: 1 }}>{esc(inv.status)}</motion.span>
                    <span className="amt">{money(inv.amount)}</span>
                    <motion.button className="small-btn" onClick={() => handleDelete(inv.id)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} aria-label="Delete invoice">✕</motion.button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}