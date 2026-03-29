// Transaction list component - Premium Design

import type { Transaction } from './types';
import { getCategoryInfo } from './types';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export function TransactionList({ transactions, onDelete }: TransactionListProps) {
  // Sort by date, most recent first
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Group by date
  const groupedByDate = sortedTransactions.reduce((acc, txn) => {
    const date = txn.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(txn);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.getTime() === today.getTime()) {
      return 'Hoy';
    } else if (date.getTime() === yesterday.getTime()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
      });
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (transactions.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
        }}>
          <span style={{ fontSize: '36px' }}>📝</span>
        </div>
        <h4 style={{
          margin: '0 0 8px 0',
          fontSize: '18px',
          fontWeight: '600',
          color: '#334155',
        }}>
          Sin movimientos
        </h4>
        <p style={{
          margin: 0,
          fontSize: '14px',
          color: '#94a3b8',
          maxWidth: '240px',
          lineHeight: '1.5',
        }}>
          Agrega tu primer ingreso o gasto tocando el boton +
        </p>
      </div>
    );
  }

  return (
    <div>
      {Object.entries(groupedByDate).map(([date, txns]) => (
        <div key={date} style={{ marginBottom: '24px' }}>
          <h4 style={{
            margin: '0 0 12px 4px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#64748b',
            textTransform: 'capitalize',
            letterSpacing: '0.3px',
          }}>
            {formatDate(date)}
          </h4>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}>
            {txns.map(txn => {
              const categoryInfo = getCategoryInfo(txn.category);
              const isIncome = txn.type === 'income';

              return (
                <div
                  key={txn.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    border: '1px solid rgba(0, 0, 0, 0.04)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'default',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                  }}
                >
                  {/* Category icon */}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: isIncome
                      ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(74, 222, 128, 0.15) 100%)'
                      : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(248, 113, 113, 0.15) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    flexShrink: 0,
                  }}>
                    {categoryInfo?.emoji || (isIncome ? '💰' : '💸')}
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, marginLeft: '14px', minWidth: 0 }}>
                    <div style={{
                      fontWeight: '600',
                      fontSize: '15px',
                      color: '#1e293b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginBottom: '4px',
                    }}>
                      {txn.title}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      color: '#94a3b8',
                    }}>
                      <span>{categoryInfo?.label || txn.category}</span>
                      {txn.source === 'ink' && (
                        <>
                          <span style={{ opacity: 0.5 }}>•</span>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px',
                            background: 'rgba(102, 126, 234, 0.1)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            color: '#667eea',
                            fontWeight: '500',
                          }}>
                            ✏️ Ink
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Amount */}
                  <div style={{
                    fontWeight: '700',
                    fontSize: '16px',
                    color: isIncome ? '#22c55e' : '#ef4444',
                    marginLeft: '12px',
                    whiteSpace: 'nowrap',
                  }}>
                    {isIncome ? '+' : '-'}{formatMoney(txn.amount)}
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(txn.id);
                    }}
                    style={{
                      marginLeft: '8px',
                      padding: '8px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      transition: 'background 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    title="Eliminar"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
