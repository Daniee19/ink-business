// Main Finance App component - Premium Glassmorphism Design

import { useState, useCallback } from 'react';
import { useFinanceData } from './useFinanceData';
import { InkTransactionCapture } from './InkTransactionCapture';
import { ManualTransactionForm } from './ManualTransactionForm';
import { TransactionList } from './TransactionList';
import { FinanceReports } from './FinanceReports';
import type { TransactionType, Category } from './types';

type View = 'home' | 'transactions' | 'reports';
type Modal = 'none' | 'ink' | 'manual';

// Glassmorphism styles
const glassCard = {
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
};

const glassCardDark = {
  background: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
};

export function FinanceApp() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [activeModal, setActiveModal] = useState<Modal>('none');
  const { createTransaction, removeTransaction, getStats } = useFinanceData();

  const stats = getStats();

  const handleCreateTransaction = useCallback((
    type: TransactionType,
    title: string,
    amount: number,
    description: string,
    category: Category,
    source: 'manual' | 'ink' = 'manual'
  ) => {
    createTransaction(type, title, amount, description, category, source);
    setActiveModal('none');
  }, [createTransaction]);

  const handleInkTransaction = useCallback((
    type: TransactionType,
    title: string,
    amount: number,
    description: string,
    category: Category
  ) => {
    handleCreateTransaction(type, title, amount, description, category, 'ink');
  }, [handleCreateTransaction]);

  const handleManualTransaction = useCallback((
    type: TransactionType,
    title: string,
    amount: number,
    description: string,
    category: Category
  ) => {
    handleCreateTransaction(type, title, amount, description, category, 'manual');
  }, [handleCreateTransaction]);

  // Format currency
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Render modal content
  const renderModal = () => {
    if (activeModal === 'none') return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '420px',
          maxHeight: '85vh',
          backgroundColor: '#fafafa',
          borderRadius: '28px 28px 0 0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.3s ease-out',
        }}>
          {activeModal === 'ink' && (
            <InkTransactionCapture
              onTransactionComplete={handleInkTransaction}
              onCancel={() => setActiveModal('none')}
            />
          )}
          {activeModal === 'manual' && (
            <ManualTransactionForm
              onSubmit={handleManualTransaction}
              onCancel={() => setActiveModal('none')}
            />
          )}
        </div>
      </div>
    );
  };

  const monthName = new Date().toLocaleDateString('es-ES', { month: 'long' });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden',
    }}>
      {/* Animated background shapes */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        right: '-20%',
        width: '60%',
        height: '60%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '-10%',
        width: '40%',
        height: '40%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <header style={{
        padding: '16px 20px 12px',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: 'rgba(255,255,255,0.7)',
              fontWeight: '500',
            }}>
              Bienvenido
            </p>
            <h1 style={{
              margin: '4px 0 0 0',
              fontSize: '24px',
              fontWeight: '700',
              color: 'white',
              letterSpacing: '-0.5px',
            }}>
              Mis Finanzas
            </h1>
          </div>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
          }}>
            👤
          </div>
        </div>
      </header>

      {/* Balance Card */}
      <div style={{ padding: '8px 20px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{
          ...glassCardDark,
          padding: '24px',
        }}>
          <p style={{
            margin: 0,
            fontSize: '13px',
            color: 'rgba(255,255,255,0.7)',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Balance de {monthName}
          </p>
          <h2 style={{
            margin: '8px 0 0 0',
            fontSize: '42px',
            fontWeight: '700',
            color: 'white',
            letterSpacing: '-1px',
          }}>
            {formatMoney(stats.balance)}
          </h2>

          {/* Income / Expense row */}
          <div style={{
            display: 'flex',
            gap: '16px',
            marginTop: '20px',
          }}>
            <div style={{
              flex: 1,
              background: 'rgba(34, 197, 94, 0.2)',
              borderRadius: '16px',
              padding: '14px 16px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px',
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(34, 197, 94, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                }}>
                  ↑
                </div>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Ingresos</span>
              </div>
              <p style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '700',
                color: '#4ade80',
              }}>
                {formatMoney(stats.totalIncome)}
              </p>
            </div>

            <div style={{
              flex: 1,
              background: 'rgba(239, 68, 68, 0.2)',
              borderRadius: '16px',
              padding: '14px 16px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px',
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                }}>
                  ↓
                </div>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Gastos</span>
              </div>
              <p style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '700',
                color: '#f87171',
              }}>
                {formatMoney(stats.totalExpenses)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div style={{
        flex: 1,
        background: '#f8fafc',
        borderRadius: '32px 32px 0 0',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Content scroll area */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '100px' }}>
          {currentView === 'home' && (
            <>
              {/* Quick actions */}
              <div style={{ padding: '24px 20px 16px' }}>
                <h3 style={{
                  margin: '0 0 16px 0',
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1e293b',
                  letterSpacing: '-0.3px',
                }}>
                  Acciones rapidas
                </h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => setActiveModal('ink')}
                    style={{
                      flex: 1,
                      padding: '20px 16px',
                      border: 'none',
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '10px',
                      boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 12px 28px rgba(102, 126, 234, 0.5)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)';
                    }}
                  >
                    <span style={{ fontSize: '28px' }}>✏️</span>
                    <div>
                      <span style={{ fontWeight: '600', fontSize: '15px', display: 'block' }}>Escribir</span>
                      <span style={{ fontSize: '11px', opacity: 0.85 }}>Dibuja una flecha</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveModal('manual')}
                    style={{
                      flex: 1,
                      padding: '20px 16px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '20px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'transform 0.2s, border-color 0.2s',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.borderColor = '#667eea';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    <span style={{ fontSize: '28px' }}>📝</span>
                    <div>
                      <span style={{ fontWeight: '600', fontSize: '15px', color: '#334155', display: 'block' }}>Manual</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>Formulario</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recent transactions */}
              <div style={{ padding: '8px 20px 20px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#1e293b',
                    letterSpacing: '-0.3px',
                  }}>
                    Ultimas transacciones
                  </h3>
                  <button
                    onClick={() => setCurrentView('transactions')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#667eea',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      transition: 'background 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                  >
                    Ver todas →
                  </button>
                </div>
                <TransactionList
                  transactions={stats.monthlyTransactions.slice(0, 5)}
                  onDelete={removeTransaction}
                />
              </div>
            </>
          )}

          {currentView === 'transactions' && (
            <div style={{ padding: '24px 20px' }}>
              <h3 style={{
                margin: '0 0 16px 0',
                fontSize: '18px',
                fontWeight: '700',
                color: '#1e293b',
              }}>
                Todas las transacciones
              </h3>
              <TransactionList
                transactions={stats.allTransactions}
                onDelete={removeTransaction}
              />
            </div>
          )}

          {currentView === 'reports' && (
            <FinanceReports stats={stats} />
          )}
        </div>

        {/* Bottom navigation */}
        <nav style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '8px 16px 16px',
          backgroundColor: 'white',
          borderTop: '1px solid #f1f5f9',
          flexShrink: 0,
        }}>
          {/* Home */}
          <button
            onClick={() => setCurrentView('home')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: '12px',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={currentView === 'home' ? '#667eea' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span style={{
              fontSize: '10px',
              fontWeight: currentView === 'home' ? '600' : '500',
              color: currentView === 'home' ? '#667eea' : '#94a3b8',
            }}>Inicio</span>
          </button>

          {/* Transactions */}
          <button
            onClick={() => setCurrentView('transactions')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: '12px',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={currentView === 'transactions' ? '#667eea' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            <span style={{
              fontSize: '10px',
              fontWeight: currentView === 'transactions' ? '600' : '500',
              color: currentView === 'transactions' ? '#667eea' : '#94a3b8',
            }}>Movimientos</span>
          </button>

          {/* FAB - Add */}
          <button
            onClick={() => setActiveModal('ink')}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              border: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '-28px',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.4)';
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>

          {/* Reports */}
          <button
            onClick={() => setCurrentView('reports')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: '12px',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={currentView === 'reports' ? '#667eea' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            <span style={{
              fontSize: '10px',
              fontWeight: currentView === 'reports' ? '600' : '500',
              color: currentView === 'reports' ? '#667eea' : '#94a3b8',
            }}>Reportes</span>
          </button>

          {/* Manual entry */}
          <button
            onClick={() => setActiveModal('manual')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: '12px',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <span style={{
              fontSize: '10px',
              fontWeight: '500',
              color: '#94a3b8',
            }}>Manual</span>
          </button>
        </nav>
      </div>

      {/* Modals */}
      {renderModal()}

      {/* Global styles for animations */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
