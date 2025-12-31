"use client";

import { useState } from "react";
import {
  Sparkles,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  MessageSquare,
  TrendingUp,
  Target,
} from "lucide-react";

interface BriefAIAssistantProps {
  briefId: string;
  briefData: any;
}

export default function BriefAIAssistant({
  briefId,
  briefData,
}: BriefAIAssistantProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const analyzeBrief = async () => {
    setIsAnalyzing(true);
    try {
      // Open main chat with analysis request
      window.dispatchEvent(
        new CustomEvent("open-ai-chat", {
          detail: {
            message: `Analyze this brief and suggest improvements:\n\nTitle: ${briefData.title}\nCategory: ${briefData.category}\nBudget: $${briefData.budget}\nQuantity: ${briefData.quantity}\nDescription: ${briefData.description}`,
          },
        })
      );
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateContent = async () => {
    setIsGenerating(true);
    try {
      window.dispatchEvent(
        new CustomEvent("open-ai-chat", {
          detail: {
            message: `Help me generate better content for my brief about ${briefData.category}. I need a more compelling description and requirements.`,
          },
        })
      );
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const findManufacturers = async () => {
    window.dispatchEvent(
      new CustomEvent("open-ai-chat", {
        detail: {
          message: `Find suitable manufacturers for this brief:\n\nCategory: ${
            briefData.category
          }\nLocation: ${briefData.location || "Any"}\nRequirements: ${
            briefData.requirements?.join(", ") || "Standard manufacturing"
          }`,
        },
      })
    );
  };

  const reviewProposals = async () => {
    window.dispatchEvent(
      new CustomEvent("open-ai-chat", {
        detail: {
          message: `Help me review and compare proposals for brief ${briefId}. What should I look for in pricing, timelines, and terms?`,
        },
      })
    );
  };

  return (
    <div className="border rounded-xl bg-linear-to-br from-blue-50 to-indigo-50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-xl">
          <Target className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">
            AI Brief Assistant
          </h3>
          <p className="text-sm text-gray-600">
            Get AI-powered insights for your manufacturing brief
          </p>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={analyzeBrief}
          disabled={isAnalyzing}
          className="flex flex-col items-center p-4 bg-white border rounded-xl hover:shadow-md transition-all duration-200 disabled:opacity-50"
        >
          <div className="p-3 bg-blue-100 rounded-lg mb-3">
            <AlertCircle className="w-5 h-5 text-blue-600" />
          </div>
          <span className="font-medium text-gray-900 text-sm">
            Analyze Brief
          </span>
          <span className="text-xs text-gray-500 mt-1">
            Get improvement suggestions
          </span>
        </button>

        <button
          onClick={generateContent}
          disabled={isGenerating}
          className="flex flex-col items-center p-4 bg-white border rounded-xl hover:shadow-md transition-all duration-200 disabled:opacity-50"
        >
          <div className="p-3 bg-purple-100 rounded-lg mb-3">
            <Lightbulb className="w-5 h-5 text-purple-600" />
          </div>
          <span className="font-medium text-gray-900 text-sm">
            Generate Content
          </span>
          <span className="text-xs text-gray-500 mt-1">
            AI-written descriptions
          </span>
        </button>

        <button
          onClick={findManufacturers}
          className="flex flex-col items-center p-4 bg-white border rounded-xl hover:shadow-md transition-all duration-200"
        >
          <div className="p-3 bg-green-100 rounded-lg mb-3">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <span className="font-medium text-gray-900 text-sm">
            Find Manufacturers
          </span>
          <span className="text-xs text-gray-500 mt-1">
            Match with best suppliers
          </span>
        </button>

        <button
          onClick={reviewProposals}
          className="flex flex-col items-center p-4 bg-white border rounded-xl hover:shadow-md transition-all duration-200"
        >
          <div className="p-3 bg-amber-100 rounded-lg mb-3">
            <CheckCircle className="w-5 h-5 text-amber-600" />
          </div>
          <span className="font-medium text-gray-900 text-sm">
            Review Proposals
          </span>
          <span className="text-xs text-gray-500 mt-1">
            Analyze offers & terms
          </span>
        </button>
      </div>

      {/* Chat Integration */}
      <div className="pt-4 border-t">
        <p className="text-sm text-gray-600 mb-3">
          Need specific help? Ask the AI assistant directly:
        </p>
        <div className="flex gap-2">
          <button
            onClick={() =>
              window.dispatchEvent(new CustomEvent("open-ai-chat"))
            }
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <MessageSquare className="w-4 h-4" />
            Open AI Assistant
          </button>
          <button
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent("open-ai-chat", {
                  detail: {
                    message: `What's a realistic budget for ${briefData.quantity} units of ${briefData.category}?`,
                  },
                })
              );
            }}
            className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Ask Budget
          </button>
        </div>
      </div>
    </div>
  );
}
