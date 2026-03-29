// Manual transaction entry form - Premium Design

import { useState } from 'react';
import type { TransactionType, Category } from './types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, getDefaultCategory } from './types';

interface ManualTransactionFormProps {
  onSubmit: (
    type: TransactionType,
    title: string,
    amount: number,
    description: string,
    category: Category
  ) => void;
  onCancel: () => void;
}

export function ManualTransactionForm({ onSubmit, onCancel }: ManualTransactionFormProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>(getDefaultCategory('expense'));
  const [error, setError] = useState<string | null>(null);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(getDefaultCategory(newType));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('El titulo es requerido');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Ingresa un monto valido mayor a 0');
      return;
    }

    onSubmit(type, title.trim(), numAmount, description.trim(), category);
  };

  const accentColor = type === 'income' ? '#22c55e' : '#ef4444';
  const accentBg = type === 'income' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#fafafa',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 20px 16px',
        background: type === 'income'
          ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
          : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        color: 'white',
        position: 'relative',
      }}>
        {/* Decorative circle */}
        <div style={{
          position: 'absolute',
          top: '-30%',
          right: '-10%',
          width: '50%',
          height: '150%',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          <div>
            <p style={{ margin: 0, fontSize: '13px', opacity: 0.85, fontWeight: '500' }}>
              Nueva transaccion
            </p>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: '700' }}>
              {type === 'income' ? 'Ingreso' : 'Gasto'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        {/* Type selector */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '10px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Tipo de movimiento
          </label>
          <div style={{
            display: 'flex',
            gap: '10px',
            background: '#f1f5f9',
            padding: '4px',
            borderRadius: '14px',
          }}>
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: 'none',
                borderRadius: '10px',
                backgroundColor: type === 'expense' ? 'white' : 'transparent',
                color: type === 'expense' ? '#ef4444' : '#64748b',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                boxShadow: type === 'expense' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              ↓ Gasto
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: 'none',
                borderRadius: '10px',
                backgroundColor: type === 'income' ? 'white' : 'transparent',
                color: type === 'income' ? '#22c55e' : '#64748b',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                boxShadow: type === 'income' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              ↑ Ingreso
            </button>
          </div>
        </div>

        {/* Amount */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '10px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Monto
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'white',
            borderRadius: '14px',
            border: '2px solid #e2e8f0',
            padding: '4px 16px',
            transition: 'border-color 0.2s',
          }}>
            <span style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#94a3b8',
              marginRight: '4px',
            }}>$</span>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              style={{
                flex: 1,
                padding: '14px 0',
                border: 'none',
                fontSize: '28px',
                fontWeight: '700',
                color: '#1e293b',
                background: 'transparent',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '10px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Descripcion
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ej: Almuerzo, Salario..."
            style={{
              width: '100%',
              padding: '14px 16px',
              border: '2px solid #e2e8f0',
              borderRadius: '14px',
              fontSize: '16px',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'border-color 0.2s',
              background: 'white',
            }}
            onFocus={(e) => e.target.style.borderColor = accentColor}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>

        {/* Category */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '10px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Categoria
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
          }}>
            {categories.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '14px 8px',
                  border: category === cat.value ? `2px solid ${accentColor}` : '2px solid #e2e8f0',
                  borderRadius: '14px',
                  backgroundColor: category === cat.value ? accentBg : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '24px', marginBottom: '6px' }}>{cat.emoji}</span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '500',
                  color: category === cat.value ? accentColor : '#64748b',
                }}>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notes (optional) */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '10px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Notas <span style={{ fontWeight: '400', textTransform: 'none' }}>(opcional)</span>
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Agrega detalles adicionales..."
            rows={2}
            style={{
              width: '100%',
              padding: '14px 16px',
              border: '2px solid #e2e8f0',
              borderRadius: '14px',
              fontSize: '15px',
              resize: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.2s',
              background: 'white',
            }}
            onFocus={(e) => e.target.style.borderColor = accentColor}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '14px 16px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#dc2626',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '16px',
            border: 'none',
            borderRadius: '14px',
            background: type === 'income'
              ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
              : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: type === 'income'
              ? '0 8px 24px rgba(34, 197, 94, 0.4)'
              : '0 8px 24px rgba(239, 68, 68, 0.4)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Guardar {type === 'income' ? 'Ingreso' : 'Gasto'}
        </button>
      </form>
    </div>
  );
}
