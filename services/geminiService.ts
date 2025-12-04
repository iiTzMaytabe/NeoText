import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const transcribeDrawing = async (base64Image: string): Promise<string> => {
  try {
    // Remove the data URL prefix (e.g., "data:image/png;base64,") to get just the base64 string
    const base64Data = base64Image.split(',')[1];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Data
            }
          },
          {
            text: "Transcribe the handwritten English text in this image. Return ONLY the transcribed text. If no text is visible or legible, return '[[NO TEXT DETECTED]]'. Do not provide explanations."
          }
        ]
      },
      config: {
        temperature: 0.1, // Low temperature for more deterministic recognition
      }
    });

    const text = response.text;
    if (!text) return "";
    
    return text.trim();
  } catch (error) {
    console.error("Error transcribing drawing:", error);
    throw error;
  }
};