// Simple router to switch between Ink Playground and Finance App

import { useState, useEffect } from 'react';
import App from './App';
import { FinanceApp } from './finance';

type AppMode = 'ink' | 'finance';

export function AppRouter() {
  const [mode, setMode] = useState<AppMode>(() => {
    // Check URL hash for initial mode
    const hash = window.location.hash.slice(1);
    return hash === 'finance' ? 'finance' : 'ink';
  });

  // Update URL hash when mode changes
  useEffect(() => {
    window.location.hash = mode;
  }, [mode]);

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      setMode(hash === 'finance' ? 'finance' : 'ink');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Mode switcher */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        padding: '8px',
        backgroundColor: '#1f2937',
      }}>
        <button
          onClick={() => setMode('ink')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: mode === 'ink' ? '#6366f1' : '#374151',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: mode === 'ink' ? '600' : '400',
          }}
        >
          Ink Playground
        </button>
        <button
          onClick={() => setMode('finance')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: mode === 'finance' ? '#6366f1' : '#374151',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: mode === 'finance' ? '600' : '400',
          }}
        >
          Mis Finanzas
        </button>
      </div>

      {/* App content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {mode === 'ink' ? <App /> : <FinanceApp />}
      </div>
    </div>
  );
}
