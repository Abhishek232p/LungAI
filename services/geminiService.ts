
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, CancerStage } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

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
      }
    }
  },
  required: ["stage", "confidence", "explanation", "report"]
};


export const analyzeXRayImage = async (base64Image: string, mimeType: string): Promise<AnalysisResult> => {
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

    const jsonText = response.text.trim();
    
    // Sometimes the API might still wrap the response in markdown, so we strip it.
    const cleanedJsonText = jsonText.replace(/^```json\s*|```\s*$/g, '');
    const parsedResult = JSON.parse(cleanedJsonText) as AnalysisResult;

    // Validate the stage value
    if (!Object.values(CancerStage).includes(parsedResult.stage)) {
        console.warn(`Received unknown stage: ${parsedResult.stage}. Defaulting to UNKNOWN.`);
        parsedResult.stage = CancerStage.UNKNOWN;
    }
    
    return parsedResult;
  } catch (error) {
    console.error("Error in Gemini API call:", error);
    if (error instanceof Error && error.message.includes('SAFETY')) {
        throw new Error('The analysis was blocked due to safety settings. This may happen with sensitive medical images. Please try a different image.');
    }
    throw new Error('Failed to parse AI response or communicate with the API.');
  }
};
