import { GoogleGenerativeAI } from "@google/generative-ai";

// Types
export interface AIMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface AIResponse {
  message: string;
  suggestions?: string[];
  followUpQuestions?: string[];
  requiresAction?: boolean;
  metadata?: Record<string, any>;
}

export interface AIContext {
  conversationId?: string;
  userId?: string;
  briefId?: string;
  manufacturerId?: string;
  proposalId?: string;
  userType?: string;
  recentMessages?: AIMessage[];
}

// Initialize Gemini client (singleton pattern with closure)
let geminiInstance: any = null;

export const getGeminiClient = () => {
  if (geminiInstance) return geminiInstance;

  const apiKey = process.env.GEMINI_API_KEY!;
  console.log(apiKey, "from gemini ai");
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  geminiInstance = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 2048,
    },
  });

  return geminiInstance;
};

// Create system prompt based on context
export const createSystemPrompt = (context?: AIContext): string => {
  const userRole =
    context?.userType === "manufacturer" ? "Manufacturer" : "Brand";

  return `You are an expert AI assistant for a B2B manufacturing platform.
  
User Context:
- Role: ${userRole}
${context?.briefId ? `- Active Brief: ${context.briefId}` : ""}
${context?.proposalId ? `- Active Proposal: ${context.proposalId}` : ""}

Your Expertise:
1. BRIEF CREATION - Help write clear manufacturing requirements, suggest realistic budgets/timelines
2. MANUFACTURER MATCHING - Recommend manufacturers based on capabilities, location, ratings
3. PROPOSAL ANALYSIS - Review proposals, suggest negotiation points, identify red flags
4. MANUFACTURING ADVICE - Material selection, production processes, quality control
5. PLATFORM GUIDANCE - How to use platform features effectively

Response Guidelines:
- Be concise but thorough
- Use bullet points for lists
- Provide actionable next steps
- Ask clarifying questions when needed
- Format numbers and dates clearly
- End with relevant follow-up questions

Current Time: ${new Date().toISOString()}
`;
};

// Parse AI response for structured data
export const parseAIResponse = (text: string): AIResponse => {
  // Extract suggestions (lines with bullets)
  const suggestionRegex = /^[•\-]\s*(.+)$/gm;
  const suggestions = Array.from(text.matchAll(suggestionRegex))
    .map((match) => match[1].trim())
    .slice(0, 5); // Limit to 5 suggestions

  // Extract follow-up questions
  const questionRegex = /(.+\?)(?:\n|$)/g;
  const followUpQuestions = Array.from(text.matchAll(questionRegex))
    .map((match) => match[1].trim())
    .slice(0, 3); // Limit to 3 questions

  // Check if requires action
  const actionKeywords = [
    "submit",
    "create",
    "update",
    "contact",
    "send",
    "upload",
    "choose",
    "review",
  ];
  const requiresAction = actionKeywords.some((keyword) =>
    text.toLowerCase().includes(keyword)
  );

  // Clean up the message (remove suggestion/question markers for display)
  let cleanMessage = text
    .replace(suggestionRegex, "") // Remove bullet points
    .replace(questionRegex, "") // Remove questions
    .trim();

  return {
    message: cleanMessage || text,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
    followUpQuestions:
      followUpQuestions.length > 0 ? followUpQuestions : undefined,
    requiresAction,
  };
};

// Generate AI response (main function)
export const generateAIResponse = async (
  prompt: string,
  context?: AIContext
): Promise<AIResponse> => {
  try {
    // Use server-side API route instead of direct client-side call
    const response = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, context }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "API request failed");
    }

    const data = await response.json();

    // Parse the response
    const parsedResponse = parseAIResponse(data.response.message);

    // Log the interaction
    await logAIInteraction({
      userId: context?.userId,
      briefId: context?.briefId,
      proposalId: context?.proposalId,
      prompt,
      response: data.response.message,
      metadata: {
        source: "api-route",
        conversationId: context?.conversationId,
      },
    });

    return parsedResponse;
  } catch (error) {
    console.error("AI Generation Error:", error);

    // Fallback to mock response
    return {
      message:
        "I apologize, but I'm having trouble connecting to the AI service. Here are some general manufacturing tips: Always verify supplier certifications, request product samples, and establish clear communication channels.",
      suggestions: [
        "Check manufacturer ISO certifications",
        "Request references from past clients",
        "Define clear quality standards",
      ],
      requiresAction: true,
    };
  }
};

// Log AI interaction to database
export const logAIInteraction = async (data: {
  userId?: string;
  briefId?: string;
  proposalId?: string;
  prompt: string;
  response: string;
  metadata: Record<string, any>;
}) => {
  try {
    const response = await fetch("/api/ai/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.warn("Failed to log AI interaction to database");
    }
  } catch (error) {
    // Fail silently for logging errors
    console.error("AI logging error:", error);
  }
};

// Get suggested prompts based on context
export const getSuggestedPrompts = (context?: AIContext): string[] => {
  const basePrompts = [
    "How can I improve my brief to attract more manufacturers?",
    "What should I look for when reviewing proposals?",
    "How do I negotiate better terms with manufacturers?",
    "What are common manufacturing quality standards?",
    "How can I verify a manufacturer's capabilities?",
  ];

  if (context?.userType === "brand") {
    return [
      ...basePrompts,
      "Suggest manufacturers for [product type]",
      "What's a reasonable budget for [quantity] units?",
      "How to write effective manufacturing requirements?",
      "What questions should I ask manufacturers?",
    ];
  }

  if (context?.userType === "manufacturer") {
    return [
      ...basePrompts,
      "How to write a winning proposal?",
      "What pricing strategy should I use?",
      "How to stand out from competitors?",
      "What certifications should I highlight?",
    ];
  }

  return basePrompts;
};

// Extract relevant context from current page/app state
export const extractPageContext = (): Partial<AIContext> => {
  if (typeof window === "undefined") return {};

  const pathname = window.location.pathname;

  // Extract brief ID from URL
  const briefMatch = pathname.match(/\/briefs\/([^\/]+)/);
  const briefId = briefMatch ? briefMatch[1] : undefined;

  // Extract manufacturer ID from URL
  const manufacturerMatch = pathname.match(/\/manufacturers\/([^\/]+)/);
  const manufacturerId = manufacturerMatch ? manufacturerMatch[1] : undefined;

  return {
    briefId,
    manufacturerId,

    // Add more context extraction as needed
  };
};
