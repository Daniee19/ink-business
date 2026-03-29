// Vision-based handwriting text recognition service
// Uses OpenRouter Vision API to recognize handwritten text from canvas images

export interface TextRecognitionResult {
  text: string;
  confidence: number;
}

class VisionTextRecognitionService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Recognize handwritten text from a canvas element using OpenRouter
   */
  async recognizeFromCanvas(canvas: HTMLCanvasElement): Promise<TextRecognitionResult> {
    // Convert canvas to base64 image
    const imageDataUrl = canvas.toDataURL('image/png');

    console.log('[VisionTextRecognition] Sending request to OpenRouter...');

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
                text: `Look at this image of handwritten text and tell me exactly what is written.

IMPORTANT RULES:
- Return ONLY the text you see, nothing else
- If it's a number like "150" or "25.50", return just that number
- If it's a word or phrase, return just that text
- Do NOT add quotes, explanations, or any other text
- If you cannot read anything, respond with just: EMPTY`
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
        max_tokens: 50,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      let errorText = '';
      try { errorText = await response.text(); } catch { /* ignore */ }
      console.error('[VisionTextRecognition] API Error:', response.status, errorText);
      throw new Error(`Vision API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('[VisionTextRecognition] Response:', result);

    const text = result.choices?.[0]?.message?.content?.trim() || '';
    console.log('[VisionTextRecognition] Recognized text:', text);

    if (text === 'EMPTY' || text === 'UNRECOGNIZED' || text === '') {
      return { text: '', confidence: 0 };
    }

    return { text, confidence: 0.9 };
  }
}

// Singleton instance
let instance: VisionTextRecognitionService | null = null;

export function getGeminiTextRecognition(): VisionTextRecognitionService | null {
  if (!instance) {
    // Use OpenRouter API key (more reliable, better rate limits)
    const apiKey = import.meta.env.INK_OPENROUTER_API_KEY as string | undefined;
    if (apiKey) {
      instance = new VisionTextRecognitionService(apiKey);
    }
  }
  return instance;
}

/**
 * Check if vision text recognition is available
 */
export function isGeminiTextRecognitionAvailable(): boolean {
  return !!import.meta.env.INK_OPENROUTER_API_KEY;
}
