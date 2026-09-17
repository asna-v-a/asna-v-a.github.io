/**
 * Interactive Charts for Asna V A's Portfolio
 * Powered by Chart.js
 * BI / Analytics Aesthetic with high contrast and clean styling.
 */

document.addEventListener("DOMContentLoaded", () => {
  initRealEstateChart();
  initRfmChart();
});

function initRealEstateChart() {
  const ctx = document.getElementById("dubaiRealEstateChart");
  if (!ctx) return;

  // District Comparison: Liquidity Index vs Avg Price / SqFt
  // Highlighting JVC's #1 liquidity despite mid-tier pricing!
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['JVC', 'Business Bay', 'Dubai Marina', 'Dubai Hills', 'Downtown', 'Palm Jumeirah'],
      datasets: [
        {
          label: 'Liquidity Score (0–100)',
          data: [94, 82, 76, 68, 54, 42],
          backgroundColor: 'rgba(6, 182, 212, 0.85)',
          borderColor: '#06b6d4',
          borderWidth: 1,
          borderRadius: 4,
          yAxisID: 'y'
        },
        {
          label: 'Avg Price/SqFt (AED)',
          data: [1120, 1850, 2100, 2350, 2900, 3650],
          type: 'line',
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderWidth: 2,
          pointBackgroundColor: '#3b82f6',
          pointRadius: 4,
          pointHoverRadius: 6,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#94a3b8',
            font: { family: "'JetBrains Mono', monospace", size: 11 },
            boxWidth: 12
          }
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#f8fafc',
          bodyColor: '#cbd5e1',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          padding: 10,
          bodyFont: { family: "'JetBrains Mono', monospace", size: 11 }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94a3b8', font: { family: "'Inter', sans-serif", size: 11 } }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Liquidity Score',
            color: '#06b6d4',
            font: { family: "'JetBrains Mono', monospace", size: 10 }
          },
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94a3b8', font: { family: "'JetBrains Mono', monospace", size: 10 } },
          min: 0,
          max: 100
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Price/SqFt (AED)',
            color: '#3b82f6',
            font: { family: "'JetBrains Mono', monospace", size: 10 }
          },
          grid: { drawOnChartArea: false },
          ticks: { color: '#94a3b8', font: { family: "'JetBrains Mono', monospace", size: 10 } },
          min: 0,
          max: 4000
        }
      }
    }
  });
}

function initRfmChart() {
  const ctx = document.getElementById("rfmSegmentChart");
  if (!ctx) return;

  // RFM Customer Segments & Revenue Contribution
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: [
        'Champions (18%)', 
        'Loyal Customers (24%)', 
        'At-Risk High Value (5%)', 
        'Potential Loyalists (21%)', 
        'Hibernating (19%)', 
        'Lost (13%)'
      ],
      datasets: [{
        data: [42, 21, 14, 11, 8, 4], // Revenue Share %
        backgroundColor: [
          '#10b981', // Champions - Emerald
          '#3b82f6', // Loyal - Blue
          '#f59e0b', // At-Risk High Value - Amber (Highlighted!)
          '#06b6d4', // Potential - Cyan
          '#64748b', // Hibernating - Slate
          '#ef4444'  // Lost - Red
        ],
        borderColor: '#1e293b',
        borderWidth: 2,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#cbd5e1',
            font: { family: "'Inter', sans-serif", size: 11 },
            boxWidth: 12,
            padding: 8
          }
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#f8fafc',
          bodyColor: '#cbd5e1',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              return ` Revenue Share: ${context.raw}%`;
            }
          }
        }
      },
      cutout: '65%'
    }
  });
}
