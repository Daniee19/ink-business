// Main Finance App component - Premium Glassmorphism Design

import { useState, useCallback, useRef } from 'react';
import { useFinanceData } from './useFinanceData';
import { InkTransactionCapture } from './InkTransactionCapture';
import { ManualTransactionForm } from './ManualTransactionForm';
import { TransactionList } from './TransactionList';
import { FinanceReports } from './FinanceReports';
import { getDocumentOCR, isDocumentOCRAvailable } from './DocumentOCR';
import type { DocumentOCRResult } from './DocumentOCR';
import type { TransactionType, Category } from './types';
import bannerImage from '../assets/p1.jpeg';

type View = 'home' | 'transactions' | 'reports';
type Modal = 'none' | 'ink' | 'manual' | 'scan-result';

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
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<DocumentOCRResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Handle document scan
  const handleScanDocument = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileSelected = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanResult(null);

    try {
      const ocr = getDocumentOCR();
      if (!ocr) {
        throw new Error('OCR service not available');
      }

      const result = await ocr.extractFromImage(file);
      setScanResult(result);
      setActiveModal('scan-result');
    } catch (error) {
      console.error('Document scan error:', error);
      setScanResult({
        success: false,
        type: 'expense',
        amount: 0,
        title: 'Error al escanear',
        description: 'No se pudo procesar el documento',
        category: 'other',
        confidence: 0,
      });
      setActiveModal('scan-result');
    } finally {
      setIsScanning(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, []);

  const handleConfirmScan = useCallback(() => {
    if (scanResult && scanResult.success && scanResult.amount > 0) {
      createTransaction(
        scanResult.type,
        scanResult.title,
        scanResult.amount,
        scanResult.description,
        scanResult.category,
        'manual' // Could add 'scan' as a new source
      );
    }
    setScanResult(null);
    setActiveModal('none');
  }, [scanResult, createTransaction]);

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
          {activeModal === 'scan-result' && scanResult && (
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>
                  Documento Escaneado
                </h2>
                <button
                  onClick={() => { setScanResult(null); setActiveModal('none'); }}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#f1f5f9',
                    border: 'none',
                    fontSize: '18px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  X
                </button>
              </div>

              {scanResult.success ? (
                <>
                  {/* Type indicator */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    background: scanResult.type === 'income' ? '#dcfce7' : '#fee2e2',
                    borderRadius: '16px',
                    marginBottom: '20px',
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: scanResult.type === 'income' ? '#16a34a' : '#dc2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        {scanResult.type === 'income' ? (
                          <>
                            <line x1="12" y1="19" x2="12" y2="5"/>
                            <polyline points="5 12 12 5 19 12"/>
                          </>
                        ) : (
                          <>
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <polyline points="19 12 12 19 5 12"/>
                          </>
                        )}
                      </svg>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                        {scanResult.type === 'income' ? 'Ingreso detectado' : 'Gasto detectado'}
                      </p>
                      <p style={{
                        margin: '4px 0 0 0',
                        fontSize: '28px',
                        fontWeight: '700',
                        color: scanResult.type === 'income' ? '#16a34a' : '#dc2626',
                      }}>
                        {formatMoney(scanResult.amount)}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
                        Concepto
                      </label>
                      <p style={{ margin: '6px 0 0 0', fontSize: '16px', color: '#1e293b', fontWeight: '500' }}>
                        {scanResult.title}
                      </p>
                    </div>
                    {scanResult.description && (
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
                          Detalles
                        </label>
                        <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: '#475569' }}>
                          {scanResult.description}
                        </p>
                      </div>
                    )}
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
                        Confianza
                      </label>
                      <div style={{
                        marginTop: '8px',
                        height: '8px',
                        background: '#e2e8f0',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${scanResult.confidence * 100}%`,
                          background: scanResult.confidence > 0.7 ? '#16a34a' : scanResult.confidence > 0.4 ? '#f59e0b' : '#dc2626',
                          borderRadius: '4px',
                        }} />
                      </div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                        {Math.round(scanResult.confidence * 100)}% de precision
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <button
                      onClick={() => { setScanResult(null); setActiveModal('none'); }}
                      style={{
                        flex: 1,
                        padding: '16px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '14px',
                        background: 'white',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        color: '#64748b',
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmScan}
                      style={{
                        flex: 1,
                        padding: '16px',
                        border: 'none',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #0066FF 0%, #00AAFF 100%)',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '0 8px 24px rgba(0, 102, 255, 0.35)',
                      }}
                    >
                      Confirmar
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: '#fee2e2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                  }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                  </div>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#1e293b' }}>
                    No se pudo procesar
                  </h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                    Intenta con una imagen mas clara del documento
                  </p>
                  <button
                    onClick={() => { setScanResult(null); setActiveModal('none'); }}
                    style={{
                      marginTop: '24px',
                      padding: '14px 32px',
                      border: 'none',
                      borderRadius: '12px',
                      background: '#f1f5f9',
                      color: '#475569',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Cerrar
                  </button>
                </div>
              )}
            </div>
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
      maxWidth: '480px',
      margin: '0 auto',
      position: 'relative',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden',
      boxShadow: '0 0 60px rgba(0,0,0,0.15)',
    }}>
      {/* Banner background image */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '280px',
        backgroundImage: `url(${bannerImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: 0,
      }} />
      {/* Overlay gradient for readability */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '280px',
        background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.85) 0%, rgba(0, 153, 255, 0.80) 50%, rgba(0, 204, 255, 0.75) 100%)',
        zIndex: 1,
      }} />

      {/* Header */}
      <header style={{
        padding: '16px 20px 12px',
        position: 'relative',
        zIndex: 2,
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
              Ink Business
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
      <div style={{ padding: '8px 20px 20px', position: 'relative', zIndex: 2 }}>
        <div style={{
          ...glassCardDark,
          padding: '24px',
          textAlign: 'center',
        }}>
          <p style={{
            margin: 0,
            fontSize: '13px',
            color: 'rgba(255,255,255,0.85)',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
          }}>
            Balance de {monthName}
          </p>
          <h2 style={{
            margin: '12px 0 0 0',
            fontSize: '48px',
            fontWeight: '800',
            color: 'white',
            letterSpacing: '-1px',
            textShadow: '0 2px 10px rgba(0,0,0,0.2)',
          }}>
            {formatMoney(stats.balance)}
          </h2>

          {/* Income / Expense row */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '20px',
          }}>
            <div style={{
              flex: 1,
              background: '#16a34a',
              borderRadius: '16px',
              padding: '16px',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '8px',
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5"/>
                    <polyline points="5 12 12 5 19 12"/>
                  </svg>
                </div>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>Ingresos</span>
              </div>
              <p style={{
                margin: 0,
                fontSize: '22px',
                fontWeight: '700',
                color: 'white',
              }}>
                {formatMoney(stats.totalIncome)}
              </p>
            </div>

            <div style={{
              flex: 1,
              background: '#dc2626',
              borderRadius: '16px',
              padding: '16px',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '8px',
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <polyline points="19 12 12 19 5 12"/>
                  </svg>
                </div>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>Gastos</span>
              </div>
              <p style={{
                margin: 0,
                fontSize: '22px',
                fontWeight: '700',
                color: 'white',
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
        zIndex: 2,
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
                {/* Hidden file input for document scanning */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelected}
                  style={{ display: 'none' }}
                />

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setActiveModal('ink')}
                    style={{
                      flex: 1,
                      padding: '16px 12px',
                      border: 'none',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #0066FF 0%, #00AAFF 100%)',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 6px 20px rgba(0, 102, 255, 0.35)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 10px 24px rgba(0, 102, 255, 0.45)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 102, 255, 0.35)';
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                      <path d="M2 2l7.586 7.586"/>
                      <circle cx="11" cy="11" r="2"/>
                    </svg>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: '700', fontSize: '14px', display: 'block' }}>Escribir</span>
                      <span style={{ fontSize: '10px', opacity: 0.9 }}>Tinta</span>
                    </div>
                  </button>

                  <button
                    onClick={handleScanDocument}
                    disabled={isScanning || !isDocumentOCRAvailable()}
                    style={{
                      flex: 1,
                      padding: '16px 12px',
                      border: 'none',
                      borderRadius: '16px',
                      background: isScanning
                        ? 'linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%)'
                        : 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                      color: 'white',
                      cursor: isScanning ? 'wait' : 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 6px 20px rgba(139, 92, 246, 0.35)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      opacity: !isDocumentOCRAvailable() ? 0.5 : 1,
                    }}
                    onMouseOver={(e) => {
                      if (!isScanning) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 10px 24px rgba(139, 92, 246, 0.45)';
                      }
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.35)';
                    }}
                  >
                    {isScanning ? (
                      <div style={{
                        width: '24px',
                        height: '24px',
                        border: '3px solid rgba(255,255,255,0.3)',
                        borderTop: '3px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }} />
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <path d="M21 15l-5-5L5 21"/>
                      </svg>
                    )}
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: '700', fontSize: '14px', display: 'block' }}>
                        {isScanning ? 'Escaneando...' : 'Escanear'}
                      </span>
                      <span style={{ fontSize: '10px', opacity: 0.9 }}>OCR</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveModal('manual')}
                    style={{
                      flex: 1,
                      padding: '16px 12px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '16px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'transform 0.2s, border-color 0.2s',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.borderColor = '#0066FF';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>📝</span>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: '600', fontSize: '14px', color: '#334155', display: 'block' }}>Manual</span>
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>Formulario</span>
                    </div>
                  </button>
                </div>

                {/* CSS for spin animation */}
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
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
                      color: '#0066FF',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      transition: 'background 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0, 102, 255, 0.1)'}
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
          padding: '12px 16px 20px',
          backgroundColor: 'white',
          borderTop: '1px solid #f1f5f9',
          flexShrink: 0,
          position: 'relative',
          marginTop: '-20px',
          paddingTop: '28px',
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={currentView === 'home' ? '#0066FF' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span style={{
              fontSize: '10px',
              fontWeight: currentView === 'home' ? '600' : '500',
              color: currentView === 'home' ? '#0066FF' : '#94a3b8',
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={currentView === 'transactions' ? '#0066FF' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              color: currentView === 'transactions' ? '#0066FF' : '#94a3b8',
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
              background: 'linear-gradient(135deg, #0066FF 0%, #00AAFF 100%)',
              color: 'white',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 102, 255, 0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '-28px',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 102, 255, 0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 102, 255, 0.4)';
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={currentView === 'reports' ? '#0066FF' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            <span style={{
              fontSize: '10px',
              fontWeight: currentView === 'reports' ? '600' : '500',
              color: currentView === 'reports' ? '#0066FF' : '#94a3b8',
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
