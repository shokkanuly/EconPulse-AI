import { NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { messages, contextData } = await req.json();
    
    const client = getGeminiClient();
    
    if (!client) {
      // Mock response if API key is missing
      await new Promise(resolve => setTimeout(resolve, 1500));
      return NextResponse.json({
        message: "This is a mock response from the AI Economic Analyst because the GEMINI_API_KEY environment variable is not set. To see real AI analysis, please add your API key.\n\nBased on the mock dashboard data, inflation is currently elevated, which generally prompts central banks to maintain higher interest rates to cool down the economy."
      });
    }

    // Format the conversation history for Gemini
    // Using gemini-2.5-pro for high quality reasoning
    const prompt = `You are the EconPulse AI, an expert economic analyst. You help users understand macroeconomic indicators and their personal impact.
    
    Current Dashboard Data Context:
    ${JSON.stringify(contextData, null, 2)}
    
    User message: ${messages[messages.length - 1].content}
    
    Provide a clear, concise, and professional analysis. Reference the data provided in the context when applicable.`;

    const response = await client.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    return NextResponse.json({
      message: response.text
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate response. Please try again later." },
      { status: 500 }
    );
  }
}
