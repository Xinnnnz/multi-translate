import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google Gen AI
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Translation API endpoint
app.post('/api/translate', async (req, res) => {
  try {
    const { text, sourceLang = 'auto', targetLangs = ['en', 'sv'], tone = 'natural', domain = 'general' } = req.body;

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ error: 'Source text is required' });
    }

    if (!Array.isArray(targetLangs) || targetLangs.length === 0) {
      return res.status(400).json({ error: 'At least one target language is required' });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please set it in Settings > Secrets.',
      });
    }

    const prompt = `Translate the following text accurately, fluently, and naturally into the requested target languages:
Source Language specified: ${sourceLang === 'auto' ? 'Auto-detect' : sourceLang}
Target Languages requested: ${targetLangs.join(', ')}
Tone/Style requested: ${tone} (e.g. natural, casual, formal, technical, literary)
Domain context: ${domain}

Source text to translate:
"""
${text.trim()}
"""

Requirements:
1. Translate genuinely and accurately into EACH target language requested. NEVER echo or repeat the source text unchanged unless the term is universally untranslated (like an acronym/brand name).
2. For languages with non-Latin scripts (especially Chinese 'zh', Japanese 'ja', Korean 'ko', Russian 'ru', Arabic 'ar', etc.), provide accurate Romanization (e.g., Pinyin with tone marks for Chinese like 'nǐ hǎo', Romaji for Japanese).
3. If source language was 'auto', detect and state the source language name and code.
4. Extract 1 to 4 key vocabulary terms or technical words with their specific translations and brief part-of-speech or notes.
5. Provide 1 to 3 natural alternative expressions if relevant.
6. Provide a concise linguistic note if there are interesting grammar nuances, idioms, or cultural distinctions.`;

    // Helper for retry with exponential backoff on 503/429
    const callWithRetry = async <T>(fn: () => Promise<T>, maxRetries = 2, delayMs = 600): Promise<T> => {
      let lastError: any;
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await fn();
        } catch (err: any) {
          lastError = err;
          const msg = String(err?.message || '');
          const isTransient = msg.includes('503') || msg.includes('429') || err?.status === 503 || err?.status === 429;
          if (isTransient && attempt < maxRetries) {
            await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
            continue;
          }
          throw err;
        }
      }
      throw lastError;
    };

    const modelsToTry = [
      'gemini-3.5-flash-lite',
      'gemini-3.5-flash',
      'gemini-3.1-flash-lite',
      'gemini-3.8-flash',
    ];

    const generateWithFallback = async () => {
      const config = {
        systemInstruction:
          'You are a professional linguistic translator and polyglot AI assistant. You excel at multi-language translations (including Swedish, English, Chinese, and many more). Always produce natural, idiomatic, context-aware translations. Never simply repeat the original word when a real translation exists.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedSourceLang: {
              type: Type.STRING,
              description: "Detected source language name and ISO code (e.g. 'Swedish (sv)')",
            },
            results: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  targetLang: {
                    type: Type.STRING,
                    description: "Target language code (e.g. 'sv', 'en', 'zh')",
                  },
                  targetLangName: {
                    type: Type.STRING,
                    description: "Target language full name in English (e.g. 'Swedish', 'English', 'Chinese')",
                  },
                  translatedText: {
                    type: Type.STRING,
                    description: "The complete, polished and accurate translation in the target language",
                  },
                  romanization: {
                    type: Type.STRING,
                    description: "Romanization / Pinyin / Phonetic guide if applicable",
                  },
                  alternatives: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Alternative ways to translate or express this phrase",
                  },
                  vocabulary: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        original: { type: Type.STRING },
                        translated: { type: Type.STRING },
                        partOfSpeech: { type: Type.STRING },
                        note: { type: Type.STRING },
                      },
                      required: ['original', 'translated'],
                    },
                    description: "Key vocabulary or technical terms breakdown",
                  },
                  linguisticNote: {
                    type: Type.STRING,
                    description: "Brief nuance or grammar explanation",
                  },
                },
                required: ['targetLang', 'targetLangName', 'translatedText'],
              },
            },
          },
          required: ['results'],
        },
      };

      let lastErr: any;
      for (const model of modelsToTry) {
        try {
          return await callWithRetry(() =>
            ai.models.generateContent({
              model,
              contents: prompt,
              config,
            })
          );
        } catch (err: any) {
          lastErr = err;
          console.warn(`Model ${model} attempt failed:`, err?.message);
        }
      }
      throw lastErr;
    };

    const response = await generateWithFallback();

    const outputText = response.text;
    if (!outputText) {
      throw new Error('No translation response returned from Gemini API.');
    }

    const parsedData = JSON.parse(outputText);
    return res.json(parsedData);
  } catch (error: any) {
    console.error('Translation error:', error);
    const rawMsg = String(error?.message || '');
    let cleanMessage = 'Failed to process translation with Gemini API.';

    if (rawMsg.includes('503') || rawMsg.includes('high demand') || rawMsg.includes('UNAVAILABLE')) {
      cleanMessage = 'The AI model is experiencing a momentary demand spike. Please try again in a few moments.';
    } else if (rawMsg.includes('429') || rawMsg.includes('RESOURCE_EXHAUSTED')) {
      cleanMessage = 'Rate limit reached. Please wait a few seconds before translating again.';
    } else {
      try {
        const parsed = JSON.parse(rawMsg);
        if (parsed?.error?.message) {
          cleanMessage = parsed.error.message;
        }
      } catch {
        cleanMessage = rawMsg || cleanMessage;
      }
    }

    return res.status(500).json({ error: cleanMessage });
  }
});

// Single term / dictionary lookup endpoint for deep dive
app.post('/api/explain-term', async (req, res) => {
  try {
    const { term, contextSentence, targetLang } = req.body;
    if (!term) {
      return res.status(400).json({ error: 'Term is required' });
    }

    const prompt = `Provide an in-depth linguistic breakdown for the word or phrase "${term}"${contextSentence ? ` in context of: "${contextSentence}"` : ''} into language "${targetLang}".
Include:
- Definition & nuances
- Example sentence with translation
- Etymology or grammatical characteristics
- Common collocations`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert bilingual lexicographer.',
        },
      });
    } catch {
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert bilingual lexicographer.',
        },
      });
    }

    return res.json({ explanation: response.text });
  } catch (error: any) {
    console.error('Explain term error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to explain term.' });
  }
});

// Dev server with Vite middleware vs Production static serving
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`MultiTranslate server listening on http://0.0.0.0:${PORT}`);
});
