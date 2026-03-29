// Document OCR Service for receipts, invoices, and financial documents
// Uses OpenRouter Vision API to extract transaction data from images

import type { TransactionType, Category } from './types';

export interface DocumentOCRResult {
  success: boolean;
  type: TransactionType;
  amount: number;
  title: string;
  description: string;
  category: Category;
  confidence: number;
  rawText?: string;
}

class DocumentOCRService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Extract transaction data from a document image
   */
  async extractFromImage(imageFile: File): Promise<DocumentOCRResult> {
    // Convert file to base64
    const base64 = await this.fileToBase64(imageFile);
    const imageDataUrl = `data:${imageFile.type};base64,${base64}`;

    console.log('[DocumentOCR] Processing document image...');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analiza esta imagen de un documento financiero (recibo, factura, ticket, comprobante de pago, etc.) y extrae la informacion de la transaccion.

RESPONDE UNICAMENTE en formato JSON con esta estructura exacta:
{
  "type": "expense" o "income",
  "amount": numero (solo el valor numerico, sin simbolos de moneda),
  "title": "descripcion corta del concepto principal",
  "description": "detalles adicionales como nombre del comercio, fecha, etc.",
  "category": "una de estas categorias: food, transport, entertainment, shopping, bills, health, education, other, salary, freelance, investment, gift, refund, bonus",
  "confidence": numero entre 0 y 1 indicando que tan seguro estas,
  "rawText": "texto completo extraido del documento"
}

REGLAS:
- Si es un recibo de compra, ticket de restaurante, factura de servicio = "expense"
- Si es un comprobante de deposito, pago recibido, factura emitida = "income"
- El amount debe ser el TOTAL a pagar (busca "Total", "Importe", "Monto")
- Si no puedes leer el documento claramente, usa confidence bajo
- Si no encuentras un monto, usa amount: 0 y confidence: 0
- Para category, analiza el tipo de comercio o servicio`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageDataUrl
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      let errorText = '';
      try { errorText = await response.text(); } catch { /* ignore */ }
      console.error('[DocumentOCR] API Error:', response.status, errorText);
      throw new Error(`OCR API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('[DocumentOCR] Response:', result);

    const content = result.choices?.[0]?.message?.content?.trim() || '';
    console.log('[DocumentOCR] Content:', content);

    try {
      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }

      const data = JSON.parse(jsonStr);

      return {
        success: true,
        type: data.type === 'income' ? 'income' : 'expense',
        amount: parseFloat(data.amount) || 0,
        title: data.title || 'Documento escaneado',
        description: data.description || '',
        category: this.validateCategory(data.category, data.type),
        confidence: parseFloat(data.confidence) || 0.5,
        rawText: data.rawText,
      };
    } catch (parseError) {
      console.error('[DocumentOCR] Parse error:', parseError);
      return {
        success: false,
        type: 'expense',
        amount: 0,
        title: 'Error al procesar documento',
        description: 'No se pudo extraer informacion del documento',
        category: 'other',
        confidence: 0,
      };
    }
  }

  private validateCategory(category: string, type: string): Category {
    const expenseCategories = ['food', 'transport', 'entertainment', 'shopping', 'bills', 'health', 'education', 'other'];
    const incomeCategories = ['salary', 'freelance', 'investment', 'gift', 'refund', 'bonus', 'other'];

    const validCategories = type === 'income' ? incomeCategories : expenseCategories;

    if (validCategories.includes(category)) {
      return category as Category;
    }

    return 'other';
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

// Singleton instance
let instance: DocumentOCRService | null = null;

export function getDocumentOCR(): DocumentOCRService | null {
  if (!instance) {
    const apiKey = import.meta.env.INK_OPENROUTER_API_KEY as string | undefined;
    if (apiKey) {
      instance = new DocumentOCRService(apiKey);
    }
  }
  return instance;
}

export function isDocumentOCRAvailable(): boolean {
  return !!import.meta.env.INK_OPENROUTER_API_KEY;
}
