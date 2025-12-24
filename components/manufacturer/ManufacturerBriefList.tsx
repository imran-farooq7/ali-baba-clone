// components/manufacturer/ManufacturerBriefList.tsx
"use client";

import { BriefStatus } from "@/app/generated/prisma/enums";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  Package,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Brief {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  quantity: number;
  status: BriefStatus;
  createdAt: Date;
  updatedAt: Date;
  location?: string | null;
  brand: {
    id: string;
    name: string;
    company: string | null;
  };
  eligibilityScore?: number | null;
  proposals?: Array<{
    id: string;
    status: string;
  }>;
  _count?: {
    proposals: number;
  };
}

interface ManufacturerBriefListProps {
  briefs: Brief[];
  manufacturerId: string;
}

export default function ManufacturerBriefList({
  briefs,
  manufacturerId,
}: ManufacturerBriefListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBudget, setSelectedBudget] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "newest" | "budget-high" | "budget-low" | "deadline"
  >("newest");

  // Filter briefs

  // Get unique categories
  const categories = Array.from(new Set(briefs.map((b) => b.category)));

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Check if manufacturer has already submitted a proposal
  const hasSubmittedProposal = (brief: Brief) => {
    return brief.proposals?.some(
      (p) => p.status === "pending" || p.status === "submitted"
    );
  };

  // Calculate eligibility (simplified - would use AI in production)
  const calculateEligibility = (brief: Brief) => {
    if (brief.eligibilityScore) return brief.eligibilityScore;

    // Mock eligibility based on category match
    const categoriesMatch = ["electronics", "manufacturing", "assembly"];
    return categoriesMatch.includes(brief.category.toLowerCase()) ? 85 : 45;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Available Briefs
            </h2>
            <p className="text-sm text-gray-500">
              {briefs.filter((b) => b.status === "PUBLISHED").length} active
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Budgets</option>
              <option value="under-10k">Under $10k</option>
              <option value="10k-50k">$10k - $50k</option>
              <option value="over-50k">Over $50k</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="newest">Newest First</option>
              <option value="budget-high">Highest Budget</option>
              <option value="budget-low">Lowest Budget</option>
              <option value="deadline">Nearest Deadline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Briefs grid */}
      {briefs.length === 0 ? (
        <div className="p-12 text-center">
          <Target className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-sm font-medium text-gray-900">
            No briefs found
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {selectedCategory !== "all" || selectedBudget !== "all"
              ? "Try adjusting your filters"
              : "No briefs available at the moment"}
          </p>
        </div>
      ) : (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {briefs.map((brief) => {
              const eligibilityScore = calculateEligibility(brief);
              const alreadySubmitted = hasSubmittedProposal(brief);

              return (
                <div
                  key={brief.id}
                  className="border border-gray-200 rounded-lg p-6 hover:border-green-300 hover:shadow-md transition-all"
                >
                  {/* Brief header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">
                        {brief.title}
                      </h3>
                      <p className="text-sm text-gray-500">{brief.category}</p>
                    </div>
                    {alreadySubmitted ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        <CheckCircle className="h-3 w-3" />
                        Applied
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        <Clock className="h-3 w-3" />
                        Open
                      </span>
                    )}
                  </div>

                  {/* Brief details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="font-medium">
                        {formatCurrency(brief.budget)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Package className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{brief.quantity.toLocaleString()} units</span>
                    </div>
                    {brief.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{brief.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Brand info */}
                  <div className="border-t border-gray-100 pt-4 mb-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {brief.brand.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {brief.brand.company}
                        </p>
                        <p className="text-xs text-gray-500">
                          Posted{" "}
                          {formatDistanceToNow(new Date(brief.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Eligibility & actions */}
                  <div className="space-y-4">
                    {/* Eligibility score */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Your Match Score</span>
                        <span
                          className={`font-medium ${
                            eligibilityScore > 75
                              ? "text-green-600"
                              : eligibilityScore > 50
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {eligibilityScore}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            eligibilityScore > 75
                              ? "bg-green-500"
                              : eligibilityScore > 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${eligibilityScore}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <Link
                        href={`/manufacturer/briefs/${brief.id}`}
                        className="flex-1 bg-green-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-green-700 text-center"
                      >
                        {alreadySubmitted ? "View Proposal" : "Submit Proposal"}
                      </Link>
                      <button
                        onClick={() => {
                          /* Save for later */
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        title="Save for later"
                      >
                        <Clock className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
