import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { FinanceStore } from '../utils/store';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AnalyticsView({ transactions, theme, currency = '₹' }) {
  const isDark = theme !== 'light';
  const textColor = isDark ? '#F2F5F8' : '#0B1F3B';

  const breakdown = FinanceStore.getCategoryBreakdown(transactions, 'expense');
  const totalExpense = breakdown.reduce((sum, b) => sum + b.amount, 0);

  const donutLabels = breakdown.map(b => b.category);
  const donutAmounts = breakdown.map(b => b.amount);
  const colors = ['#2F5D8C', '#123A63', '#10b981', '#0ea5e9', '#f59e0b', '#ec4899', '#8b5cf6', '#C9D6E5'];

  const donutData = {
    labels: donutLabels,
    datasets: [{
      data: donutAmounts,
      backgroundColor: colors.slice(0, donutLabels.length),
      borderWidth: 0
    }]
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: textColor, font: { family: 'Inter', size: 12 } }
      }
    }
  };

  return (
    <div className="page-view active">
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Expense Distribution</h3>
          </div>
          <div className="chart-container">
            <Doughnut data={donutData} options={donutOptions} />
          </div>
        </div>

        <div className="section-card">
          <h3>Category Breakdown Summary</h3>
          <div className="table-responsive" style={{ marginTop: '16px' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Spent Amount</th>
                  <th>% Share</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map(item => (
                  <tr key={item.category}>
                    <td><strong>{item.category}</strong></td>
                    <td>{currency}{item.amount.toFixed(2)}</td>
                    <td>{totalExpense > 0 ? ((item.amount / totalExpense) * 100).toFixed(1) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
