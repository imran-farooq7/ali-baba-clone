import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, context } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is not configured on server");
      return NextResponse.json(
        {
          error: "AI service is not configured",
          message:
            "Please contact administrator. For now, here are some general tips: Ensure clear specifications, verify manufacturer credentials, and establish quality control measures.",
        },
        { status: 503 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    // Create system prompt
    const systemPrompt = `You are a manufacturing expert AI assistant. Help with briefs, manufacturer matching, and proposals.`;

    const fullPrompt = `${systemPrompt}\n\nUser: ${prompt}\n\nAssistant:`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      success: true,
      response: {
        message: text,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("AI API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate response",
        message: "Please try again later or rephrase your question.",
      },
      { status: 500 }
    );
  }
}
