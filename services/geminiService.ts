import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PromptAnalysis } from "../types";

// Define the schema for the prompt engineering output
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    subject: {
      type: Type.STRING,
      description: "The core subject matter. Focus on hyper-detailed textures, facial features, or material properties.",
    },
    medium: {
      type: Type.STRING,
      description: "The medium. Prioritize realism keywords (e.g., 'Award-winning Photography', 'Shot on Sony A7R IV', 'Unreal Engine 5 Render', '8k resolution', 'Hyper-realistic').",
    },
    lighting: {
      type: Type.STRING,
      description: "Physically correct lighting (e.g., 'Global Illumination', 'Ray Tracing', 'Cinematic Lighting', 'Volumetric God Rays').",
    },
    camera: {
      type: Type.STRING,
      description: "Camera specifics for realism (e.g., 'f/1.8 aperture', '85mm portrait lens', 'Motion blur', 'Depth of Field', 'ISO 100').",
    },
    palette: {
      type: Type.STRING,
      description: "Color palette description (e.g., 'Kodak Portra 400', 'Bleach Bypass', 'True-to-life colors').",
    },
    vibe: {
      type: Type.STRING,
      description: "Atmosphere focusing on presence and immersion (e.g., 'Immersive', 'Atmospheric', 'Tangible', 'Cinematic').",
    },
    techParams: {
      type: Type.STRING,
      description: "High-end parameters. ALWAYS suggest quality boosters (e.g., '--ar 16:9 --v 6.0 --style raw --s 750 --q 2' or 'Quality: High, Detail: Maximum').",
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
            text: `Act as an Elite Prompt Engineer specializing in Photorealism and High-Fidelity Synthesis. 
            Reverse-engineer this image into a structured professional prompt designed to generate ULTRA-REALISTIC images (Midjourney v6, DALL-E 3).
            
            Focus intensely on:
            1. Texture (skin pores, fabric weave, surface imperfections).
            2. Optical Properties (reflection, refraction, subsurface scattering).
            3. Photography Equipment (Camera sensor, lens choice).
            
            Ensure the output prompt creates an indistinguishable-from-reality masterpiece.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are a specialist in Hyper-Realistic AI Image Generation. Your vocabulary must be precise, evocative, and technical to ensure maximum visual fidelity.",
        temperature: 0.3, // Low temperature for consistent, high-quality technical descriptions
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