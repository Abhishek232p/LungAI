
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, CancerStage } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

// NOTE: We intentionally do NOT throw at module load time when the key is
// missing. Throwing here crashed the whole app on Vercel whenever the
// environment variable was not configured. Instead we surface a clear,
// actionable error only when an analysis is actually attempted.
export const isAiConfigured = (): boolean => Boolean(API_KEY);

let client: GoogleGenAI | null = null;

const getClient = (): GoogleGenAI => {
  if (!API_KEY) {
    throw new Error(
      'Gemini API key is not configured. Set VITE_GEMINI_API_KEY in your .env.local file (and in Vercel → Project Settings → Environment Variables), then redeploy.'
    );
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: API_KEY });
  }
  return client;
};

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    stage: {
      type: Type.STRING,
      enum: [CancerStage.NORMAL, CancerStage.BEGINNING, CancerStage.INTERMEDIATE, CancerStage.FINAL],
      description: "The detected lung cancer stage."
    },
    confidence: {
      type: Type.NUMBER,
      description: "The confidence score of the prediction, from 0 to 100."
    },
    explanation: {
      type: Type.STRING,
      description: "A brief, technical explanation for the detected stage based on visual indicators in the X-ray."
    },
    report: {
      type: Type.OBJECT,
      properties: {
        symptoms: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          },
          description: "A list of possible symptoms associated with the detected stage."
        },
        nextSteps: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          },
          description: "A list of recommended next steps for the patient and their doctor."
        }
      },
      required: ["symptoms", "nextSteps"]
    }
  },
  required: ["stage", "confidence", "explanation", "report"]
};

const normalizeResult = (raw: any): AnalysisResult => {
  const validStages = Object.values(CancerStage) as string[];
  const stage: CancerStage =
    raw && typeof raw.stage === 'string' && validStages.includes(raw.stage)
      ? (raw.stage as CancerStage)
      : CancerStage.UNKNOWN;

  const rawConfidence = Number(raw?.confidence);
  let confidence = Number.isFinite(rawConfidence) ? rawConfidence : 0;
  // Be forgiving: some models return a 0-1 fraction instead of 0-100.
  if (confidence > 0 && confidence <= 1) confidence *= 100;
  confidence = Math.min(100, Math.max(0, confidence));

  const toStringArray = (value: unknown): string[] =>
    Array.isArray(value) ? value.filter((v) => typeof v === 'string') : [];

  return {
    stage,
    confidence,
    explanation:
      typeof raw?.explanation === 'string' && raw.explanation.trim()
        ? raw.explanation
        : 'The model did not provide an explanation for this analysis.',
    report: {
      symptoms: toStringArray(raw?.report?.symptoms),
      nextSteps: toStringArray(raw?.report?.nextSteps),
    },
  };
};

export const analyzeXRayImage = async (base64Image: string, mimeType: string): Promise<AnalysisResult> => {
  const ai = getClient();
  const model = "gemini-2.5-flash";
  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: mimeType,
    },
  };

  const systemInstruction = `You are a medical imaging AI assistant named LungAI. Your task is to analyze chest X-ray images to detect and classify potential signs of lung cancer into one of four stages: ${CancerStage.NORMAL}, ${CancerStage.BEGINNING}, ${CancerStage.INTERMEDIATE}, or ${CancerStage.FINAL}.

    - Analyze the provided chest X-ray image for any abnormalities like nodules, masses, or opacities.
    - Classify the image into one of the four stages based on the visual evidence.
    - Provide a confidence score for your classification.
    - Generate a brief, professional explanation for your findings.
    - Create a patient-friendly report outlining possible symptoms and recommended next steps.
    - IMPORTANT: Always respond in the requested JSON format. Do not add any markdown formatting like \`\`\`json. Your response must be pure JSON.
    - If the image is not a chest X-ray or is of very poor quality, classify the stage as '${CancerStage.NORMAL}' with a low confidence score and explain the issue in the explanation field.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [imagePart] },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2, // Lower temperature for more deterministic results in medical context
      },
    });

    const jsonText = (response.text ?? '').trim();

    if (!jsonText) {
      throw new Error('The model returned an empty response.');
    }

    // Sometimes the API might still wrap the response in markdown, so we strip it.
    const cleanedJsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    const parsedResult = normalizeResult(JSON.parse(cleanedJsonText));

    if (parsedResult.stage === CancerStage.UNKNOWN) {
      console.warn(`Received unknown stage from model: ${jsonText.slice(0, 200)}`);
    }

    return parsedResult;
  } catch (error) {
    console.error("Error in Gemini API call:", error);
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('SAFETY') || message.toLowerCase().includes('blocked')) {
      throw new Error('The analysis was blocked due to safety settings. This may happen with sensitive medical images. Please try a different image.');
    }
    if (message.includes('API key is not configured')) {
      throw error;
    }
    throw new Error('Failed to parse AI response or communicate with the API.');
  }
};
