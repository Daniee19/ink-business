// Ink-based transaction capture component
// Detects arrow direction and captures title, amount, description through handwriting

import { useState, useRef, useCallback, useEffect } from 'react';
import type { Stroke, StrokeInput } from '../types/brush';
import type { TransactionType, Category } from './types';
import { getDefaultCategory, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from './types';
import { detectArrow, type ArrowDirection } from './arrowDetection';
import { getRecognitionService } from '../recognition/RecognitionService';
import { getGeminiTextRecognition, isGeminiTextRecognitionAvailable } from './GeminiTextRecognition';

interface InkTransactionCaptureProps {
  onTransactionComplete: (
    type: TransactionType,
    title: string,
    amount: number,
    description: string,
    category: Category
  ) => void;
  onCancel: () => void;
}

type CapturePhase = 'arrow' | 'title' | 'amount' | 'description' | 'category';

interface CapturedData {
  type: TransactionType | null;
  title: string;
  amount: string;
  description: string;
  category: Category | null;
}

export function InkTransactionCapture({ onTransactionComplete, onCancel }: InkTransactionCaptureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<CapturePhase>('arrow');
  const [currentStrokes, setCurrentStrokes] = useState<Stroke[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [captured, setCaptured] = useState<CapturedData>({
    type: null,
    title: '',
    amount: '',
    description: '',
    category: null,
  });
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStrokeRef = useRef<StrokeInput[]>([]);
  const recognitionTimeout = useRef<number | null>(null);

  // Clear canvas and redraw strokes
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw guide lines based on phase
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    if (phase === 'arrow') {
      // Draw arrow hint
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, canvas.height * 0.3);
      ctx.lineTo(canvas.width / 2, canvas.height * 0.7);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    // Draw all strokes
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const stroke of currentStrokes) {
      if (stroke.inputs.inputs.length < 2) continue;

      ctx.beginPath();
      const firstPoint = stroke.inputs.inputs[0];
      ctx.moveTo(firstPoint.x, firstPoint.y);

      for (let i = 1; i < stroke.inputs.inputs.length; i++) {
        const point = stroke.inputs.inputs[i];
        ctx.lineTo(point.x, point.y);
      }
      ctx.stroke();
    }
  }, [currentStrokes, phase]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Handle pointer events
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.setPointerCapture(e.pointerId);
    setIsDrawing(true);

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    currentStrokeRef.current = [{
      x,
      y,
      timeMillis: Date.now(),
      pressure: e.pressure || 0.5,
    }];
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    currentStrokeRef.current.push({
      x,
      y,
      timeMillis: Date.now(),
      pressure: e.pressure || 0.5,
    });

    // Draw current stroke in real-time
    const ctx = canvas.getContext('2d');
    if (ctx && currentStrokeRef.current.length >= 2) {
      const points = currentStrokeRef.current;
      const lastTwo = points.slice(-2);

      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(lastTwo[0].x, lastTwo[0].y);
      ctx.lineTo(lastTwo[1].x, lastTwo[1].y);
      ctx.stroke();
    }
  }, [isDrawing]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.releasePointerCapture(e.pointerId);
    }
    setIsDrawing(false);

    if (currentStrokeRef.current.length < 3) return;

    const newStroke: Stroke = {
      inputs: { inputs: [...currentStrokeRef.current] },
      brush: {
        color: 0xFF1a1a1a,
        size: 3,
        stockBrush: 'marker',
      },
    };

    setCurrentStrokes(prev => [...prev, newStroke]);
    currentStrokeRef.current = [];

    // Schedule recognition after a delay
    if (recognitionTimeout.current) {
      clearTimeout(recognitionTimeout.current);
    }

    recognitionTimeout.current = window.setTimeout(() => {
      processCurrentPhase([...currentStrokes, newStroke]);
    }, 800);
  }, [currentStrokes]);

  // Try to recognize text - use Gemini directly (more reliable)
  const recognizeText = useCallback(async (): Promise<string | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    // Use Gemini directly since primary service is unreliable
    if (isGeminiTextRecognitionAvailable()) {
      const gemini = getGeminiTextRecognition();
      if (gemini) {
        const geminiResult = await gemini.recognizeFromCanvas(canvas);
        if (geminiResult.text) {
          return geminiResult.text;
        }
        throw new Error('No se pudo reconocer el texto. Intenta escribir mas claro.');
      }
    }

    // Fallback to primary service if Gemini not available
    const service = getRecognitionService();
    const result = await service.recognizeGoogle(currentStrokes);
    if (result.rawText) {
      return result.rawText.trim();
    }

    return null;
  }, [currentStrokes]);

  // Process strokes based on current phase
  const processCurrentPhase = useCallback(async (strokes: Stroke[]) => {
    if (strokes.length === 0) return;

    setError(null);

    if (phase === 'arrow') {
      const result = detectArrow(strokes);
      if (result.direction) {
        const transactionType: TransactionType = result.direction === 'up' ? 'income' : 'expense';
        setCaptured(prev => ({ ...prev, type: transactionType }));
        setCurrentStrokes([]);
        setPhase('title');
      }
    } else if (phase === 'title' || phase === 'amount' || phase === 'description') {
      setIsRecognizing(true);
      try {
        const text = await recognizeText();

        if (text) {
          if (phase === 'title') {
            setCaptured(prev => ({ ...prev, title: text }));
            setCurrentStrokes([]);
            setPhase('amount');
          } else if (phase === 'amount') {
            // Extract number from text
            const numMatch = text.match(/[\d,.]+/);
            if (numMatch) {
              setCaptured(prev => ({ ...prev, amount: numMatch[0].replace(',', '.') }));
              setCurrentStrokes([]);
              setPhase('description');
            } else {
              setError('No se pudo detectar un monto. Intenta de nuevo.');
            }
          } else if (phase === 'description') {
            setCaptured(prev => ({ ...prev, description: text }));
            setCurrentStrokes([]);
            setPhase('category');
          }
        }
      } catch (err) {
        setError(`Error de reconocimiento: ${err instanceof Error ? err.message : 'Unknown'}`);
      } finally {
        setIsRecognizing(false);
      }
    }
  }, [phase, recognizeText]);

  // Handle category selection
  const handleCategorySelect = useCallback((category: Category) => {
    if (!captured.type) return;

    const amount = parseFloat(captured.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Monto invalido');
      return;
    }

    onTransactionComplete(
      captured.type,
      captured.title || 'Sin titulo',
      amount,
      captured.description || '',
      category
    );
  }, [captured, onTransactionComplete]);

  // Clear current strokes
  const handleClear = useCallback(() => {
    setCurrentStrokes([]);
    if (recognitionTimeout.current) {
      clearTimeout(recognitionTimeout.current);
    }
  }, []);

  // Get phase instructions
  const getPhaseInstructions = () => {
    switch (phase) {
      case 'arrow':
        return 'Dibuja una flecha hacia ARRIBA para ingreso o hacia ABAJO para gasto';
      case 'title':
        return `${captured.type === 'income' ? 'INGRESO' : 'GASTO'} - Escribe el titulo`;
      case 'amount':
        return 'Escribe el monto (numero)';
      case 'description':
        return 'Escribe una descripcion breve (opcional)';
      case 'category':
        return 'Selecciona una categoria';
    }
  };

  const categories = captured.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#fafafa',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        backgroundColor: captured.type === 'income' ? '#22c55e' : captured.type === 'expense' ? '#ef4444' : '#6366f1',
        color: 'white',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>
            {phase === 'arrow' ? 'Nueva Transaccion' : captured.type === 'income' ? 'Nuevo Ingreso' : 'Nuevo Gasto'}
          </h2>
          <button
            onClick={onCancel}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
            }}
          >
            X
          </button>
        </div>
        <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
          {getPhaseInstructions()}
        </p>
      </div>

      {/* Progress indicator */}
      <div style={{ display: 'flex', padding: '8px 16px', gap: '4px' }}>
        {['arrow', 'title', 'amount', 'description', 'category'].map((p, i) => (
          <div
            key={p}
            style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              backgroundColor: i <= ['arrow', 'title', 'amount', 'description', 'category'].indexOf(phase)
                ? (captured.type === 'income' ? '#22c55e' : captured.type === 'expense' ? '#ef4444' : '#6366f1')
                : '#e5e7eb',
            }}
          />
        ))}
      </div>

      {/* Captured data display */}
      {(captured.title || captured.amount) && (
        <div style={{ padding: '12px 16px', backgroundColor: '#f3f4f6' }}>
          {captured.title && <div><strong>Titulo:</strong> {captured.title}</div>}
          {captured.amount && <div><strong>Monto:</strong> ${captured.amount}</div>}
          {captured.description && <div><strong>Descripcion:</strong> {captured.description}</div>}
        </div>
      )}

      {/* Canvas or Category selection */}
      {phase !== 'category' ? (
        <div style={{ flex: 1, position: 'relative' }}>
          <canvas
            ref={canvasRef}
            width={400}
            height={300}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            style={{
              width: '100%',
              height: '100%',
              touchAction: 'none',
              cursor: 'crosshair',
              backgroundColor: 'white',
            }}
          />
          {isRecognizing && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
            }}>
              Reconociendo...
            </div>
          )}
          {/* Error toast - floating overlay */}
          {error && (
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              right: '12px',
              padding: '12px 16px',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              fontSize: '14px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 10,
            }}>
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  fontSize: '18px',
                  cursor: 'pointer',
                  padding: '0 0 0 12px',
                }}
              >
                x
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => handleCategorySelect(cat.value)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '28px' }}>{cat.emoji}</span>
                <span style={{ fontSize: '12px', marginTop: '4px' }}>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {phase !== 'category' && (
        <div style={{ padding: '16px', display: 'flex', gap: '12px' }}>
          <button
            onClick={handleClear}
            style={{
              flex: 1,
              padding: '12px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Borrar
          </button>
          {phase !== 'arrow' && (
            <button
              onClick={() => {
                if (phase === 'description') {
                  setCaptured(prev => ({ ...prev, description: '' }));
                  setCurrentStrokes([]);
                  setPhase('category');
                }
              }}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: phase === 'description' ? '#6366f1' : '#e5e7eb',
                color: phase === 'description' ? 'white' : '#9ca3af',
                cursor: phase === 'description' ? 'pointer' : 'not-allowed',
                fontSize: '14px',
              }}
              disabled={phase !== 'description'}
            >
              Omitir
            </button>
          )}
        </div>
      )}
    </div>
  );
}
