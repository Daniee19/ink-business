// App Router with Splash Screen - Finance App as main

import { useState, useEffect } from 'react';
import { FinanceApp } from './finance';
import bannerImage from './assets/p1.jpeg';

export function AppRouter() {
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out after 2 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2000);

    // Hide splash after fade animation (2.5s total)
    const hideTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (showSplash) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, rgba(0, 102, 255, 0.95) 0%, rgba(0, 153, 255, 0.9) 50%, rgba(0, 204, 255, 0.85) 100%)`,
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.5s ease-out',
        zIndex: 9999,
      }}>
        {/* Background image */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${bannerImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.15,
          zIndex: 0,
        }} />

        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          animation: 'pulse 2s ease-in-out infinite',
        }}>
          {/* Logo icon */}
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '30px',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          }}>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>

          {/* Company name */}
          <h1 style={{
            margin: 0,
            fontSize: '42px',
            fontWeight: '800',
            color: 'white',
            letterSpacing: '-1px',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
          }}>
            Ink Business
          </h1>

          {/* Tagline */}
          <p style={{
            margin: '12px 0 0 0',
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: '500',
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}>
            Control financiero inteligente
          </p>

          {/* Loading indicator */}
          <div style={{
            marginTop: '40px',
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
          }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite both`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Animations */}
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
          }
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
            40% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return <FinanceApp />;
}
