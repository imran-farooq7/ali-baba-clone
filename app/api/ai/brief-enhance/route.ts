import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/prisma/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { briefId, currentBrief } = body;

    if (!briefId || !currentBrief) {
      return NextResponse.json(
        { error: "Brief ID and brief data are required" },
        { status: 400 }
      );
    }

    // Get Gemini API key from environment
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("GEMINI_API_KEY not configured, using mock response");
      const mockEnhancement = getMockEnhancement(currentBrief);
      // Return just the enhanced description as text
      return new NextResponse(mockEnhancement.enhancedDescription, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 2048,
      },
    });

    // Create enhancement prompt - updated to ask for just enhanced description
    const prompt = createEnhancementPrompt(currentBrief);

    // Generate AI response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse AI response to get just the enhanced description
    const enhancedDescription = parseEnhancementResponse(text, currentBrief);

    // Save to database if needed
    await saveEnhancementToDB(
      briefId,
      enhancedDescription,
      currentBrief.description
    );

    // Return just the enhanced description as plain text
    return new NextResponse(enhancedDescription, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Brief enhancement error:", error);

    // Fallback to mock response on error
  }

  // Updated prompt to ask for just enhanced description
  function createEnhancementPrompt(brief: any): string {
    return `
You are a manufacturing expert AI assistant. Enhance this manufacturing brief description to make it more attractive to manufacturers and increase response rates.

IMPORTANT: Return ONLY the enhanced description text. Do not include any other information, JSON formatting, or additional content.

CURRENT BRIEF:
Title: ${brief.title}
Category: ${brief.category}
Quantity: ${brief.quantity}
Budget: $${brief.budget}
Timeline: ${brief.timelineDays} days
Description: ${brief.description}
${
  brief.requirements
    ? `Requirements: ${JSON.stringify(brief.requirements)}`
    : ""
}
${brief.location ? `Location Preference: ${brief.location}` : ""}

Enhance the description by:
1. Making it more professional and compelling
2. Adding specific technical details if implied
3. Clarifying requirements and expectations
4. Using industry-standard terminology
5. Highlighting key benefits for manufacturers

Return ONLY the enhanced description text:
`;
  }

  // Updated parse function to extract just the enhanced description
  function parseEnhancementResponse(text: string, originalBrief: any): string {
    try {
      // Clean the response text
      let cleanedText = text.trim();

      // Remove any markdown formatting, JSON, or code blocks
      cleanedText = cleanedText.replace(/```json\n?|\n?```|```/g, "");
      cleanedText = cleanedText.replace(/"/g, "");

      // Try to extract JSON if present
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.enhancedDescription) {
            return parsed.enhancedDescription.trim();
          }
        } catch (error) {
          // If JSON parsing fails, continue with text extraction
        }
      }

      // If the response starts with "enhancedDescription" or similar, extract value
      const enhancedMatch = cleanedText.match(
        /enhancedDescription[:\s]+(.+?)(?=\n\n|\n\s*\n|$)/
      );
      if (enhancedMatch) {
        return enhancedMatch[1].trim();
      }

      // If text has clear sections, take the first substantial paragraph
      const paragraphs = cleanedText.split(/\n\s*\n/);
      for (const paragraph of paragraphs) {
        const trimmed = paragraph.trim();
        if (
          trimmed.length > 50 &&
          !trimmed.toLowerCase().includes("suggestion") &&
          !trimmed.toLowerCase().includes("keyword") &&
          !trimmed.toLowerCase().includes("missing") &&
          !trimmed.toLowerCase().includes("realistic")
        ) {
          return trimmed;
        }
      }

      // Fallback: return the cleaned text or original description
      return cleanedText.length > 100 ? cleanedText : originalBrief.description;
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      return (
        originalBrief.description ||
        getMockEnhancement(originalBrief).enhancedDescription
      );
    }
  }

  // Mock enhancement for development
  function getMockEnhancement(brief: any) {
    return {
      enhancedDescription: `${brief.description} This brief could be enhanced by adding more specific technical requirements, quality control standards, and packaging specifications. Consider including material specifications and tolerance levels for better manufacturer matching. The ${brief.quantity} units should be produced within the ${brief.timelineDays}-day timeline while maintaining quality standards appropriate for the $${brief.budget} budget.`,
    };
  }

  // Save enhancement to database
  async function saveEnhancementToDB(
    briefId: string,
    enhancedDescription: string,
    originalDescription: string
  ) {
    const user = await getCurrentUser();
    try {
      await prisma.aiAssistantLog.create({
        data: {
          userId: user?.id!,
          briefId,
          prompt: `Enhance brief description: ${originalDescription}`,
          response: enhancedDescription,
          metadata: {
            type: "brief_enhancement",
            briefId,
            timestamp: new Date().toISOString(),
            model: "gemini-2.5-flash",
          },
        },
      });
    } catch (error) {
      console.error("Failed to save enhancement to DB:", error);
      // Don't fail the request if logging fails
    }
  }
}
