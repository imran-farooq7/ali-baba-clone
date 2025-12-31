import { prisma } from "@/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, briefId, proposalId, prompt, response, metadata } = body;

    // Log to database using your AiAssistantLog model
    const logEntry = await prisma.aiAssistantLog.create({
      data: {
        userId: userId || "anonymous",
        briefId: briefId || null,
        proposalId: proposalId || null,
        prompt: prompt.substring(0, 5000), // Limit length
        response: response.substring(0, 10000), // Limit length
        metadata: metadata || {},
        model: "gemini-2.5-flash",
        createdAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      logId: logEntry.id,
    });
  } catch (error) {
    console.error("AI Logging Error:", error);
    // Don't fail the main request if logging fails
    return NextResponse.json({
      success: false,
      error: "Logging failed but main request succeeded",
    });
  }
}
