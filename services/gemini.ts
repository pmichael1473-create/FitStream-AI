import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, GroundingSource } from "../types";

export async function streamGeminiResponse(
  prompt: string,
  history: Message[],
  onChunk: (text: string, sources?: GroundingSource[]) => void
) {
  try {
    // Initialize Gemini API client inside the function to use the latest key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // We use googleSearch tool to allow the model to "research"
    const model = 'gemini-2.5-flash';

    const chat = ai.chats.create({
      model: model,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: `You are FitStream AI, an expert fitness coach and researcher. 
        
        GOALS:
        1. Provide accurate workout tips, form guides, and nutrition advice.
        2. RESEARCH VIDEOS: When users ask for exercises, actively search for and recommend YouTube videos.
        3. If you find a video, explicitly mention it in the text (e.g., "Here is a video demonstrating the form").
        
        FORMATTING:
        - Use clear Markdown.
        - Be concise and energetic.
        `,
      },
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }))
    });

    const resultStream = await chat.sendMessageStream({ message: prompt });

    for await (const chunk of resultStream) {
      const c = chunk as GenerateContentResponse;
      const text = c.text || '';
      
      let sources: GroundingSource[] | undefined = undefined;
      const groundingChunks = c.candidates?.[0]?.groundingMetadata?.groundingChunks;
      
      if (groundingChunks) {
        sources = groundingChunks
          .map((chunk: any) => {
            if (chunk.web) {
              return {
                uri: chunk.web.uri,
                title: chunk.web.title,
              };
            }
            return null;
          })
          .filter((source: any): source is GroundingSource => source !== null);
      }

      onChunk(text, sources);
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

// Function to generate video using Veo
export async function generateFitnessVideo(prompt: string): Promise<string> {
  try {
    // Re-initialize to ensure we pick up the latest API key if changed by the selection dialog
    const aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let operation = await aiClient.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await aiClient.operations.getVideosOperation({operation: operation});
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("No video URI returned");

    // Fetch the video content
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!response.ok) throw new Error("Failed to download video content");

    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error("Veo Generation Error:", error);
    throw error;
  }
}