/* ==========================================================================
   EXPENSE & INCOME TRACKER - CHARTS VISUALIZATION MODULE
   ========================================================================== */

export class FinanceCharts {
  constructor() {
    this.categoryChartInstance = null;
    this.cashFlowChartInstance = null;
  }

  // Render Expense Category Breakdown Donut Chart
  renderCategoryChart(canvasId, breakdownData) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.categoryChartInstance) {
      this.categoryChartInstance.destroy();
    }

    const labels = breakdownData.map(item => item.category);
    const amounts = breakdownData.map(item => item.amount);

    const colors = [
      '#3B82F6', '#1B2A41', '#94A3B8', '#60A5FA',
      '#2563EB', '#1E40AF', '#93C5FD', '#E2E8F0'
    ];

    // Check theme
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const textColor = isDark ? '#E2E8F0' : '#0A0F1E';

    this.categoryChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: amounts,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 0,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: textColor,
              padding: 16,
              font: { family: 'Inter', size: 12, weight: 500 },
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                return ` ${label}: $${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
              }
            }
          }
        }
      }
    });
  }

  // Render Cash Flow Monthly Bar & Line Chart
  renderCashFlowChart(canvasId, transactions) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.cashFlowChartInstance) {
      this.cashFlowChartInstance.destroy();
    }

    // Group transactions by month (last 6 months)
    const monthMap = {};
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7);
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      monthMap[key] = { label: monthLabel, income: 0, expense: 0 };
    }

    transactions.forEach(t => {
      const key = t.date.slice(0, 7);
      if (monthMap[key]) {
        if (t.type === 'income') monthMap[key].income += t.amount;
        else if (t.type === 'expense') monthMap[key].expense += t.amount;
      }
    });

    const labels = Object.values(monthMap).map(m => m.label);
    const incomeData = Object.values(monthMap).map(m => m.income);
    const expenseData = Object.values(monthMap).map(m => m.expense);

    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const textColor = isDark ? '#94A3B8' : '#1B2A41';
    const gridColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(0, 0, 0, 0.05)';

    this.cashFlowChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Income',
            data: incomeData,
            backgroundColor: '#10b981',
            borderRadius: 6,
            barPercentage: 0.6,
            categoryPercentage: 0.6
          },
          {
            label: 'Expense',
            data: expenseData,
            backgroundColor: '#f43f5e',
            borderRadius: 6,
            barPercentage: 0.6,
            categoryPercentage: 0.6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              color: textColor,
              font: { family: 'Inter', size: 12, weight: 600 },
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                return ` ${context.dataset.label}: $${context.parsed.y.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: textColor, font: { family: 'Inter', size: 12 } }
          },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              font: { family: 'Inter', size: 12 },
              callback: function(val) { return '$' + val; }
            }
          }
        }
      }
    });
  }
}
