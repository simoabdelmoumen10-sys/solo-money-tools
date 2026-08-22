import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { CashFlowChart3D } from './CashFlowChart3D';
import { money, DBState } from '../utils/db';

interface DashboardProps {
  db: DBState;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function Dashboard({ db }: DashboardProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const ym = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    
    let outstanding = 0, paidThisMonth = 0, expensesTotal = 0;
    
    db.invoices.forEach(inv => {
      if (inv.status !== 'paid' && inv.status !== 'draft') outstanding += inv.amount;
      if (inv.status === 'paid' && inv.date.slice(0, 7) === ym) paidThisMonth += inv.amount;
    });
    
    db.expenses.forEach(e => { expensesTotal += e.amount; });
    
    return { outstanding, paidThisMonth, expensesTotal, net: paidThisMonth - expensesTotal };
  }, [db.invoices, db.expenses]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'));
    }
    return months.map(m => ({
      month: m,
      paid: db.invoices
        .filter(inv => inv.status === 'paid' && inv.date.slice(0, 7) === m)
        .reduce((s, inv) => s + inv.amount, 0)
    }));
  }, [db.invoices]);

  const maxPaid = Math.max(...monthlyData.map(d => d.paid), 1);

  return (
    <div>
      <div className="grid3">
        <motion.div className="card" variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
          <div className="label">Outstanding</div>
          <div className="value" style={{ color: 'var(--warn)' }}>{money(stats.outstanding)}</div>
        </motion.div>
        <motion.div className="card" variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.15 }}>
          <div className="label">Paid this month</div>
          <div className="value" style={{ color: 'var(--up)' }}>{money(stats.paidThisMonth)}</div>
        </motion.div>
        <motion.div className="card" variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
          <div className="label">Net</div>
          <div className="value" style={{ color: stats.net >= 0 ? 'var(--up)' : 'var(--down)' }}>{money(stats.net)}</div>
        </motion.div>
      </div>

      <div className="grid3">
        <motion.div className="card" variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.25 }}>
          <div className="label">Invoices</div>
          <div className="value">{db.invoices.length}</div>
        </motion.div>
        <motion.div className="card" variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
          <div className="label">Clients</div>
          <div className="value">{db.clients.length}</div>
        </motion.div>
        <motion.div className="card" variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.35 }}>
          <div className="label">Expenses</div>
          <div className="value">{db.expenses.length}</div>
        </motion.div>
      </div>

      <motion.div className="card" style={{ marginTop: '12px' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="label">Cash flow — last 6 months</div>
        <div className="canvas-container">
          <Canvas 
            camera={{ position: [0, 0, 30], fov: 30 }} 
            style={{ width: '100%', height: '100%' }}
            gl={{ antialias: true, alpha: true }}
          >
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 10, 10]} intensity={1} />
            <CashFlowChart3D data={monthlyData} maxValue={maxPaid} />
          </Canvas>
        </div>
      </motion.div>
    </div>
  );
}