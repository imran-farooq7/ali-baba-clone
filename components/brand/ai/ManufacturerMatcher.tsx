"use client";

import { useState } from "react";
import {
  Target,
  TrendingUp,
  Shield,
  Clock,
  BarChart,
  ChevronRight,
} from "lucide-react";

interface ManufacturerMatcherProps {
  briefId?: string;
  manufacturerIds: string[];
  manufacturerNames?: string[];
}

export default function ManufacturerMatcher({
  briefId,
  manufacturerIds,
  manufacturerNames = [],
}: ManufacturerMatcherProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeMatch = async () => {
    setIsAnalyzing(true);
    try {
      const manufacturers =
        manufacturerNames.length > 0
          ? manufacturerNames.join(", ")
          : `${manufacturerIds.length} manufacturers`;

      window.dispatchEvent(
        new CustomEvent("open-ai-chat", {
          detail: {
            message: `Compare and analyze these manufacturers for compatibility:\n\nManufacturers: ${manufacturers}\n\nPlease analyze their capabilities, pricing, lead times, and recommend the best match with reasoning.`,
          },
        })
      );
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzePricing = async () => {
    window.dispatchEvent(
      new CustomEvent("open-ai-chat", {
        detail: {
          message: `Analyze pricing strategies for the selected manufacturers. What should be a fair price range, and how should I negotiate?`,
        },
      })
    );
  };

  const checkCapabilities = async () => {
    window.dispatchEvent(
      new CustomEvent("open-ai-chat", {
        detail: {
          message: `What manufacturing capabilities and certifications should I verify for these suppliers? What red flags should I look for?`,
        },
      })
    );
  };

  const getNegotiationTips = async () => {
    window.dispatchEvent(
      new CustomEvent("open-ai-chat", {
        detail: {
          message: `Give me negotiation tips for working with these manufacturers. What terms should I focus on, and what concessions can I make?`,
        },
      })
    );
  };

  return (
    <div className="border rounded-xl bg-linear-to-br from-green-50 to-emerald-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-xl">
            <Target className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              AI Manufacturer Analyzer
            </h3>
            <p className="text-sm text-gray-600">
              AI-powered comparison and recommendations
            </p>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          {manufacturerIds.length} manufacturer
          {manufacturerIds.length !== 1 ? "s" : ""} selected
        </div>
      </div>

      {/* Analysis Options */}
      <div className="space-y-3 mb-6">
        <button
          onClick={analyzeMatch}
          disabled={isAnalyzing || manufacturerIds.length === 0}
          className="w-full flex items-center justify-between p-4 bg-white border rounded-xl hover:shadow-md transition-all duration-200 disabled:opacity-50"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">
                Comprehensive Analysis
              </div>
              <div className="text-sm text-gray-500">
                Compare all manufacturers side-by-side
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button
          onClick={analyzePricing}
          disabled={manufacturerIds.length === 0}
          className="w-full flex items-center justify-between p-4 bg-white border rounded-xl hover:shadow-md transition-all duration-200 disabled:opacity-50"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Pricing Analysis</div>
              <div className="text-sm text-gray-500">
                Evaluate costs and negotiation points
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button
          onClick={checkCapabilities}
          disabled={manufacturerIds.length === 0}
          className="w-full flex items-center justify-between p-4 bg-white border rounded-xl hover:shadow-md transition-all duration-200 disabled:opacity-50"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Shield className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Capability Check</div>
              <div className="text-sm text-gray-500">
                Verify skills and certifications
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button
          onClick={getNegotiationTips}
          disabled={manufacturerIds.length === 0}
          className="w-full flex items-center justify-between p-4 bg-white border rounded-xl hover:shadow-md transition-all duration-200 disabled:opacity-50"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">
                Negotiation Strategy
              </div>
              <div className="text-sm text-gray-500">
                Get tips for better terms
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-xl border mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {manufacturerIds.length}
          </div>
          <div className="text-sm text-gray-600">To Compare</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {manufacturerIds.length >= 2 ? "Ready" : "Add More"}
          </div>
          <div className="text-sm text-gray-600">For Analysis</div>
        </div>
      </div>

      {/* Direct Chat */}
      <div className="text-center">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("open-ai-chat"))}
          className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:opacity-90 font-medium"
        >
          <Target className="w-5 h-5" />
          Ask Specific Questions
        </button>
        <p className="text-xs text-gray-500 mt-3">
          AI can help with capability matching, risk assessment, and negotiation
          strategies
        </p>
      </div>
    </div>
  );
}
