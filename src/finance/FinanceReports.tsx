// Finance reports with charts - Premium Design

import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { getCategoryInfo } from './types';

Chart.register(...registerables);

interface FinanceReportsProps {
  stats: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    expensesByCategory: Record<string, number>;
    incomeByCategory: Record<string, number>;
    dailyTotals: { day: number; income: number; expenses: number }[];
  };
}

// Glass card style
const glassCard = {
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
};

export function FinanceReports({ stats }: FinanceReportsProps) {
  const expenseChartRef = useRef<HTMLCanvasElement>(null);
  const incomeChartRef = useRef<HTMLCanvasElement>(null);
  const trendChartRef = useRef<HTMLCanvasElement>(null);
  const expenseChartInstance = useRef<Chart | null>(null);
  const incomeChartInstance = useRef<Chart | null>(null);
  const trendChartInstance = useRef<Chart | null>(null);

  // Expense pie chart
  useEffect(() => {
    if (!expenseChartRef.current) return;

    if (expenseChartInstance.current) {
      expenseChartInstance.current.destroy();
    }

    const ctx = expenseChartRef.current.getContext('2d');
    if (!ctx) return;

    const hasExpenses = Object.keys(stats.expensesByCategory).length > 0;

    const labels = hasExpenses
      ? Object.keys(stats.expensesByCategory).map(cat => {
          const info = getCategoryInfo(cat as any);
          return info ? `${info.emoji} ${info.label}` : cat;
        })
      : ['Sin gastos'];

    const data = hasExpenses
      ? Object.values(stats.expensesByCategory)
      : [1];

    const colors = hasExpenses
      ? [
          '#ef4444', '#f97316', '#f59e0b', '#eab308',
          '#84cc16', '#22c55e', '#14b8a6', '#06b6d4',
          '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
        ]
      : ['#e5e7eb'];

    expenseChartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors.slice(0, data.length),
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 8,
              usePointStyle: true,
              font: { size: 10 },
              color: '#64748b',
            },
          },
          title: {
            display: false,
          },
        },
      },
    });

    return () => {
      if (expenseChartInstance.current) {
        expenseChartInstance.current.destroy();
      }
    };
  }, [stats.expensesByCategory]);

  // Income pie chart
  useEffect(() => {
    if (!incomeChartRef.current) return;

    if (incomeChartInstance.current) {
      incomeChartInstance.current.destroy();
    }

    const ctx = incomeChartRef.current.getContext('2d');
    if (!ctx) return;

    const hasIncome = Object.keys(stats.incomeByCategory).length > 0;

    const labels = hasIncome
      ? Object.keys(stats.incomeByCategory).map(cat => {
          const info = getCategoryInfo(cat as any);
          return info ? `${info.emoji} ${info.label}` : cat;
        })
      : ['Sin ingresos'];

    const data = hasIncome
      ? Object.values(stats.incomeByCategory)
      : [1];

    const colors = hasIncome
      ? [
          '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
          '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6',
        ]
      : ['#e5e7eb'];

    incomeChartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors.slice(0, data.length),
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 8,
              usePointStyle: true,
              font: { size: 10 },
              color: '#64748b',
            },
          },
          title: {
            display: false,
          },
        },
      },
    });

    return () => {
      if (incomeChartInstance.current) {
        incomeChartInstance.current.destroy();
      }
    };
  }, [stats.incomeByCategory]);

  // Trend line chart
  useEffect(() => {
    if (!trendChartRef.current) return;

    if (trendChartInstance.current) {
      trendChartInstance.current.destroy();
    }

    const ctx = trendChartRef.current.getContext('2d');
    if (!ctx) return;

    const labels = stats.dailyTotals.length > 0
      ? stats.dailyTotals.map(d => `Dia ${d.day}`)
      : ['Sin datos'];

    const incomeData = stats.dailyTotals.length > 0
      ? stats.dailyTotals.map(d => d.income)
      : [0];

    const expenseData = stats.dailyTotals.length > 0
      ? stats.dailyTotals.map(d => d.expenses)
      : [0];

    trendChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Ingresos',
            data: incomeData,
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderRadius: 6,
            borderSkipped: false,
          },
          {
            label: 'Gastos',
            data: expenseData,
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 16,
              usePointStyle: true,
              font: { size: 11 },
              color: '#64748b',
            },
          },
          title: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
            ticks: {
              callback: (value) => `$${value}`,
              font: { size: 10 },
              color: '#94a3b8',
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: { size: 10 },
              color: '#94a3b8',
            },
          },
        },
      },
    });

    return () => {
      if (trendChartInstance.current) {
        trendChartInstance.current.destroy();
      }
    };
  }, [stats.dailyTotals]);

  const monthName = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <h2 style={{
        margin: '0 0 20px 0',
        fontSize: '20px',
        fontWeight: '700',
        color: '#1e293b',
        textTransform: 'capitalize',
      }}>
        Resumen de {monthName}
      </h2>

      {/* Summary cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '24px',
      }}>
        <div style={{
          padding: '16px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(34, 197, 94, 0.2)',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(34, 197, 94, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 10px',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5"/>
              <polyline points="5 12 12 5 19 12"/>
            </svg>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', fontWeight: '500' }}>
            Ingresos
          </div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#22c55e' }}>
            {formatMoney(stats.totalIncome)}
          </div>
        </div>

        <div style={{
          padding: '16px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(239, 68, 68, 0.2)',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 10px',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <polyline points="19 12 12 19 5 12"/>
            </svg>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', fontWeight: '500' }}>
            Gastos
          </div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#ef4444' }}>
            {formatMoney(stats.totalExpenses)}
          </div>
        </div>

        <div style={{
          padding: '16px',
          textAlign: 'center',
          background: stats.balance >= 0
            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)'
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
          borderRadius: '16px',
          border: stats.balance >= 0 ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: stats.balance >= 0 ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 10px',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stats.balance >= 0 ? '#3b82f6' : '#ef4444'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', fontWeight: '500' }}>
            Balance
          </div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: stats.balance >= 0 ? '#3b82f6' : '#ef4444' }}>
            {stats.balance >= 0 ? '+' : ''}{formatMoney(stats.balance)}
          </div>
        </div>
      </div>

      {/* Daily trend chart */}
      <div style={{
        ...glassCard,
        padding: '20px',
        marginBottom: '16px',
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '14px',
          fontWeight: '600',
          color: '#334155',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #0066FF 0%, #00AAFF 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </span>
          Movimientos Diarios
        </h3>
        <div style={{ height: '180px' }}>
          <canvas ref={trendChartRef} />
        </div>
      </div>

      {/* Pie charts side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={{
          ...glassCard,
          padding: '16px',
        }}>
          <h3 style={{
            margin: '0 0 12px 0',
            fontSize: '13px',
            fontWeight: '600',
            color: '#334155',
            textAlign: 'center',
          }}>
            Gastos por categoria
          </h3>
          <div style={{ height: '180px' }}>
            <canvas ref={expenseChartRef} />
          </div>
        </div>

        <div style={{
          ...glassCard,
          padding: '16px',
        }}>
          <h3 style={{
            margin: '0 0 12px 0',
            fontSize: '13px',
            fontWeight: '600',
            color: '#334155',
            textAlign: 'center',
          }}>
            Ingresos por categoria
          </h3>
          <div style={{ height: '180px' }}>
            <canvas ref={incomeChartRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
