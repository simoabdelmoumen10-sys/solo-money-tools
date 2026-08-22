import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dashboard } from './components/Dashboard';
import { Invoices } from './components/Invoices';
import { Clients } from './components/Clients';
import { Expenses } from './components/Expenses';
import { useDB } from './hooks/useDB';

type View = 'dashboard' | 'invoices' | 'clients' | 'expenses';

const navItems: { id: View; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'clients', label: 'Clients' },
  { id: 'expenses', label: 'Expenses' }
];

export function App() {
  const { db, refresh, updateDB } = useDB();
  const [view, setView] = useState<View>('dashboard');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header className="masthead">
        <div className="wordmark">FREELANCER<b>_KIT</b></div>
        <nav className="nav" role="navigation" aria-label="Main navigation">
          {navItems.map((item, i) => (
            <motion.button
              key={item.id}
              className={`nav-btn ${view === item.id ? 'active' : ''}`}
              onClick={() => setView(item.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {item.label}
            </motion.button>
          ))}
        </nav>
      </header>

      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'dashboard' && <Dashboard db={db} />}
            {view === 'invoices' && <Invoices db={db} refresh={refresh} updateDB={updateDB} />}
            {view === 'clients' && <Clients db={db} refresh={refresh} updateDB={updateDB} />}
            {view === 'expenses' && <Expenses db={db} refresh={refresh} updateDB={updateDB} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer>Freelancer Toolkit · free · data stays on your device</footer>
    </div>
  );
}

export default App;