import React from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { ArrowRight } from 'lucide-react';
import { FinanceStore } from '../utils/store';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DashboardView({ transactions, theme, onSwitchView }) {
  const isDark = theme !== 'light';
  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

  // Prepare Donut Chart Data
  const breakdown = FinanceStore.getCategoryBreakdown(transactions, 'expense');
  const donutLabels = breakdown.map(b => b.category);
  const donutAmounts = breakdown.map(b => b.amount);
  const colors = ['#6366f1', '#10b981', '#0ea5e9', '#f59e0b', '#ec4899', '#8b5cf6', '#f43f5e', '#64748b'];

  const donutData = {
    labels: donutLabels,
    datasets: [{
      data: donutAmounts,
      backgroundColor: colors.slice(0, donutLabels.length),
      borderWidth: 0,
      hoverOffset: 6
    }]
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor,
          font: { family: 'Inter', size: 11, weight: 500 },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      }
    }
  };

  // Prepare Monthly Cash Flow Data
  const monthMap = {};
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    const label = d.toLocaleString('default', { month: 'short' });
    monthMap[key] = { label, income: 0, expense: 0 };
  }

  transactions.forEach(t => {
    const key = t.date.slice(0, 7);
    if (monthMap[key]) {
      if (t.type === 'income') monthMap[key].income += t.amount;
      else if (t.type === 'expense') monthMap[key].expense += t.amount;
    }
  });

  const barLabels = Object.values(monthMap).map(m => m.label);
  const barIncome = Object.values(monthMap).map(m => m.income);
  const barExpense = Object.values(monthMap).map(m => m.expense);

  const barData = {
    labels: barLabels,
    datasets: [
      {
        label: 'Income',
        data: barIncome,
        backgroundColor: '#10b981',
        borderRadius: 6
      },
      {
        label: 'Expense',
        data: barExpense,
        backgroundColor: '#f43f5e',
        borderRadius: 6
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: textColor,
          font: { family: 'Inter', size: 12, weight: 600 },
          usePointStyle: true
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: textColor } },
      y: { grid: { color: gridColor }, ticks: { color: textColor, callback: v => '₹' + v } }
    }
  };

  const recent = transactions.slice(0, 5);

  return (
    <div className="page-view active">
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Cash Flow Trend (Monthly)</h3>
          </div>
          <div className="chart-container">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Expense Breakdown</h3>
          </div>
          <div className="chart-container">
            <Doughnut data={donutData} options={donutOptions} />
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h3>Recent Transactions</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => onSwitchView('transactions')}>
            <span>View All</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Payment Method</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                recent.map(t => (
                  <tr key={t.id}>
                    <td>{t.date}</td>
                    <td><strong>{t.description || 'Transaction'}</strong></td>
                    <td><span className="category-tag">{t.category}</span></td>
                    <td>{t.paymentMethod || 'Cash'}</td>
                    <td className={t.type === 'income' ? 'amount-income' : 'amount-expense'}>
                      {t.type === 'income' ? '+' : '-'}₹{t.amount.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
