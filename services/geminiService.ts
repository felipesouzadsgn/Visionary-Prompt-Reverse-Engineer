import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PromptAnalysis } from "../types";

// Define the schema for the prompt engineering output
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    subject: {
      type: Type.STRING,
      description: "The core subject matter of the image. Be specific about character, object, or scene details.",
    },
    medium: {
      type: Type.STRING,
      description: "The artistic medium or style (e.g., '35mm Film Photography', 'Oil Painting', '3D Octane Render', 'Cyberpunk Digital Art').",
    },
    lighting: {
      type: Type.STRING,
      description: "Lighting conditions (e.g., 'Golden hour', 'Cinematic volumetric lighting', 'Neon noir', 'Soft studio lighting').",
    },
    camera: {
      type: Type.STRING,
      description: "Camera angle and lens details (e.g., 'Wide-angle lens', 'Macro shot', 'Drone view', 'Bokeh depth of field').",
    },
    palette: {
      type: Type.STRING,
      description: "Color palette description (e.g., 'Vibrant neon', 'Monochromatic noir', 'Pastel dreamscape', 'Earthy tones').",
    },
    vibe: {
      type: Type.STRING,
      description: "The mood or atmosphere (e.g., 'Ethereal', 'Dystopian', 'Minimalist', 'Whimsical').",
    },
    techParams: {
      type: Type.STRING,
      description: "Midjourney/DALL-E technical parameters (e.g., '--ar 16:9 --v 6.0 --stylize 250 --chaos 10'). Inference strictly based on image aspect ratio and complexity.",
    },
  },
  required: ["subject", "medium", "lighting", "camera", "palette", "vibe", "techParams"],
};

export const analyzeImage = async (base64Image: string, mimeType: string): Promise<PromptAnalysis> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using gemini-2.5-flash for efficient multimodal reasoning
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: `Act as a world-class Prompt Engineer and Art Director. 
            Reverse-engineer this image into a structured professional prompt used for high-end AI image generation (Midjourney v6, DALL-E 3).
            Analyze every visual aspect meticulously.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are an expert at deconstructing images into their generative components. Be concise, professional, and evocative in your descriptions.",
        temperature: 0.4, // Lower temperature for more analytical/precise output
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as PromptAnalysis;
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === "string") {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};
