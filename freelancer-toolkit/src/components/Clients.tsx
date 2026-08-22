import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DBState, money, esc, uid } from '../utils/db';

interface ClientsProps {
  db: DBState;
  refresh: () => void;
  updateDB: (updater: (prev: DBState) => DBState) => void;
}

export function Clients({ db, refresh, updateDB }: ClientsProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', rate: '', status: 'active' as 'active' | 'past' });

  useEffect(() => {
    if (showForm && !editingId) setForm({ name: '', email: '', rate: '', status: 'active' });
  }, [showForm, editingId]);

  useEffect(() => {
    if (editingId) {
      const c = db.clients.find(c => c.id === editingId);
      if (c) setForm({ name: c.name, email: c.email, rate: String(c.rate), status: c.status });
    }
  }, [editingId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rate = parseFloat(form.rate);
    if (!form.name.trim() || isNaN(rate) || rate < 0) {
      alert('Name and a non-negative rate are required.');
      return;
    }
    if (editingId) {
      updateDB(prev => ({ ...prev, clients: prev.clients.map(c => c.id === editingId ? {
        ...c, name: form.name.trim(), email: form.email.trim(), rate, status: form.status
      } : c) }));
    } else {
      updateDB(prev => ({ ...prev, clients: [...prev.clients, { id: uid(), name: form.name.trim(), email: form.email.trim(), rate, status: form.status }] }));
    }
    setShowForm(false); setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this client?')) updateDB(prev => ({ ...prev, clients: prev.clients.filter(c => c.id !== id) }));
  };

  const itemVariants = { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 20 } };

  return (
    <div>
      <div className="toolbar">
        <h2>Clients</h2>
        <motion.button className="btn primary" onClick={() => setShowForm(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          + Add client
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div className="form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
            <form onSubmit={handleSubmit}>
              <div className="grid2">
                <div>
                  <label>Name</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Acme Corp" required />
                </div>
                <div>
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="contact@acme.com" />
                </div>
              </div>
              <div className="grid2">
                <div>
                  <label>Hourly rate (USD)</label>
                  <input type="number" min="0" step="1" value={form.rate} onChange={e => setForm({ ...form, rate: e.target.value })} placeholder="150" required />
                </div>
                <div>
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as 'active' | 'past' })}>
                    <option value="active">Active</option>
                    <option value="past">Past</option>
                  </select>
                </div>
              </div>
              <div className="actions">
                <motion.button type="submit" className="btn primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  {editingId ? 'Update client' : 'Add client'}
                </motion.button>
                <motion.button type="button" className="btn" onClick={() => { setShowForm(false); setEditingId(null); }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <AnimatePresence>
          {db.clients.length === 0 ? (
            <motion.div className="item" initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="empty">
              <span className="meta">No clients yet. Add your first.</span>
            </motion.div>
          ) : (
            db.clients.map((c, idx) => (
              <motion.div key={c.id} className="item" variants={itemVariants} initial="hidden" animate="visible" exit="exit" transition={{ delay: idx * 0.03 }}>
                <div>
                  <div className="name">{esc(c.name)}</div>
                  <div className="meta">{esc(c.email)} · ${c.rate}/hr</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <motion.span className={`tag ${c.status}`} initial={{ scale: 0.8 }} animate={{ scale: 1 }}>{esc(c.status)}</motion.span>
                  <motion.button className="small-btn" onClick={() => { setEditingId(c.id); setShowForm(true); }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>Edit</motion.button>
                  <motion.button className="small-btn" onClick={() => handleDelete(c.id)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>✕</motion.button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}