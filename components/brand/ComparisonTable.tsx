"use client";

import { useState, useMemo } from "react";
import Image from "next/image";

interface Manufacturer {
  id: string;
  name: string;
  email: string;
  company: string;
  avatar: string | null;
  description: string | null;
  capabilities: string[];
  certifications: string[];
  minOrderQuantity: number | null;
  maxOrderQuantity: number | null;
  productionCapacity: number | null;
  locations: string[];
  industries: string[];
  verified: boolean;
  rating: number;
  matchScore: number;
  isBookmarked: boolean;
  createdAt: Date;
  updatedAt: Date;
  leadTime: string;
  responseTime: string;
  sustainabilityScore: number;
  qualityScore: number;
  pricingTier: "budget" | "standard" | "premium";
  [key: string]: any;
}

interface ComparisonTableProps {
  manufacturers: Manufacturer[];
}

export default function ComparisonTable({
  manufacturers,
}: ComparisonTableProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "capabilities" | "pricing" | "quality"
  >("overview");
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  // Define comparison criteria based on active tab
  const comparisonCriteria = useMemo(() => {
    const baseCriteria = {
      overview: [
        {
          key: "rating",
          label: "Rating",
          format: (value: number) => `${value.toFixed(1)}/5`,
          type: "number",
        },
        {
          key: "matchScore",
          label: "Match Score",
          format: (value: number) => `${value}%`,
          type: "number",
        },
        {
          key: "verified",
          label: "Verification",
          format: (value: boolean) => (value ? "Verified ✓" : "Not verified"),
          type: "boolean",
        },
        {
          key: "productionCapacity",
          label: "Production Capacity",
          format: (value: number | null) =>
            value ? `${value.toLocaleString()} units/month` : "Not specified",
          type: "number",
        },
        {
          key: "locations",
          label: "Locations",
          format: (value: string[]) =>
            value.length > 2 ? `${value.length} locations` : value.join(", "),
          type: "array",
        },
      ],
      capabilities: [
        {
          key: "capabilities",
          label: "Capabilities",
          format: (value: string[]) => `${value.length} capabilities`,
          type: "array",
        },
        {
          key: "certifications",
          label: "Certifications",
          format: (value: string[]) => `${value.length} certifications`,
          type: "array",
        },
        {
          key: "industries",
          label: "Industries Served",
          format: (value: string[]) => value.join(", "),
          type: "array",
        },
        {
          key: "minOrderQuantity",
          label: "Minimum Order",
          format: (value: number | null) =>
            value ? value.toLocaleString() + " units" : "Flexible",
          type: "number",
        },
        {
          key: "maxOrderQuantity",
          label: "Maximum Order",
          format: (value: number | null) =>
            value ? value.toLocaleString() + " units" : "Unlimited",
          type: "number",
        },
      ],
      pricing: [
        {
          key: "pricingTier",
          label: "Pricing Tier",
          format: (value: string) =>
            value.charAt(0).toUpperCase() + value.slice(1),
          type: "string",
        },
        {
          key: "leadTime",
          label: "Lead Time",
          format: (value: string) => value,
          type: "string",
        },
        {
          key: "responseTime",
          label: "Response Time",
          format: (value: string) => value,
          type: "string",
        },
        {
          key: "minOrderQuantity",
          label: "MOQ Value",
          format: (value: number | null) =>
            value ? `$${(value * 10).toLocaleString()}` : "Contact for quote",
          type: "number",
        },
      ],
      quality: [
        {
          key: "qualityScore",
          label: "Quality Score",
          format: (value: number) => `${value}/100`,
          type: "number",
        },
        {
          key: "sustainabilityScore",
          label: "Sustainability Score",
          format: (value: number) => `${value}/100`,
          type: "number",
        },
        {
          key: "rating",
          label: "Customer Rating",
          format: (value: number) => `${value.toFixed(1)}/5`,
          type: "number",
        },
        {
          key: "verified",
          label: "Verified Status",
          format: (value: boolean) =>
            value ? "Fully verified" : "Basic listing",
          type: "boolean",
        },
      ],
    };

    return baseCriteria[activeTab];
  }, [activeTab]);

  // Find best and worst for each criterion
  const getComparisonHighlights = useMemo(() => {
    const highlights: Record<string, { best: string[]; worst: string[] }> = {};

    comparisonCriteria.forEach((criterion) => {
      const values = manufacturers.map((m) => {
        const value = m[criterion.key];

        if (criterion.type === "array") {
          return Array.isArray(value) ? value.length : 0;
        } else if (criterion.type === "number") {
          return typeof value === "number" ? value : 0;
        } else if (criterion.type === "boolean") {
          return value ? 1 : 0;
        } else if (criterion.key === "pricingTier") {
          // Convert pricing tier to numeric value for comparison
          const tierValue = { budget: 1, standard: 2, premium: 3 };
          return tierValue[value as "budget" | "standard" | "premium"] || 0;
        }
        return 0;
      });

      const max = Math.max(...values);
      const min = Math.min(...values);

      highlights[criterion.key] = {
        best: manufacturers
          .filter((m, index) => values[index] === max)
          .map((m) => m.id),
        worst: manufacturers
          .filter((m, index) => values[index] === min)
          .map((m) => m.id),
      };
    });

    return highlights;
  }, [manufacturers, comparisonCriteria]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getPricingColor = (tier: string) => {
    switch (tier) {
      case "budget":
        return "text-green-600 bg-green-50";
      case "standard":
        return "text-blue-600 bg-blue-50";
      case "premium":
        return "text-purple-600 bg-purple-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="overflow-x-auto">
      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-1 px-6">
          {[
            { id: "overview", label: "Overview" },
            { id: "capabilities", label: "Capabilities" },
            { id: "pricing", label: "Pricing & Lead Time" },
            { id: "quality", label: "Quality & Sustainability" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-white border-t border-l border-r border-gray-200 text-blue-600 font-semibold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Comparison Table */}
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-64 sticky left-0 bg-gray-50 z-10">
              Comparison Criteria
            </th>
            {manufacturers.map((manufacturer) => (
              <th
                key={manufacturer.id}
                className="px-6 py-4 text-left min-w-64"
              >
                <div className="flex items-center gap-3">
                  {manufacturer.avatar ? (
                    <div className="relative w-10 h-10">
                      <Image
                        src={manufacturer.avatar}
                        alt={manufacturer.company}
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-linear-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold">
                        {manufacturer.company.charAt(0)}
                      </span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {manufacturer.company}
                      </span>
                      {manufacturer.verified && (
                        <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="flex items-center mt-1">
                      <span className="text-yellow-400 text-sm">★</span>
                      <span className="text-sm font-medium ml-1">
                        {manufacturer.rating.toFixed(1)}
                      </span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-sm font-medium text-green-600">
                        {manufacturer.matchScore}%
                      </span>
                    </div>
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {comparisonCriteria.map((criterion, index) => {
            const highlights = getComparisonHighlights[criterion.key];
            const isExpanded = expandedSections[criterion.key];
            const isArrayType = criterion.type === "array";

            return (
              <tr key={criterion.key} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 sticky left-0 bg-white z-10 border-r">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        {criterion.label}
                      </span>
                      {isArrayType && (
                        <button
                          onClick={() => toggleSection(criterion.key)}
                          className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                        >
                          {isExpanded ? "Show less" : "Show all"}
                        </button>
                      )}
                    </div>

                    {/* Criteria indicator */}
                    <div className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                      {criterion.type}
                    </div>
                  </div>
                </td>

                {manufacturers.map((manufacturer) => {
                  const value = manufacturer[criterion.key];
                  const isBest = highlights?.best.includes(manufacturer.id);
                  const isWorst =
                    highlights?.worst.includes(manufacturer.id) && !isBest;

                  return (
                    <td
                      key={`${manufacturer.id}-${criterion.key}`}
                      className="px-6 py-4"
                    >
                      <div
                        className={`relative ${isBest ? "bg-green-50" : ""} ${
                          isWorst ? "bg-red-50" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">
                            {isArrayType && !isExpanded
                              ? criterion.format(value as never)
                              : criterion.format(value as never)}
                          </span>

                          {/* Badges for best/worst */}
                          {isBest && (
                            <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium">
                              Best
                            </span>
                          )}
                          {isWorst && (
                            <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full font-medium">
                              Lowest
                            </span>
                          )}

                          {/* Special styling for pricing tier */}
                          {criterion.key === "pricingTier" && (
                            <span
                              className={`ml-2 px-2 py-1 text-xs rounded-full font-medium ${getPricingColor(
                                value as string
                              )}`}
                            >
                              {value as string}
                            </span>
                          )}
                        </div>

                        {/* Expanded view for arrays */}
                        {isArrayType && isExpanded && Array.isArray(value) && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex flex-wrap gap-1.5">
                              {value.map((item: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Visual indicator for numeric values */}
                        {criterion.type === "number" &&
                          typeof value === "number" && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                <span>0</span>
                                <span>100</span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    criterion.key === "rating"
                                      ? "bg-yellow-500"
                                      : criterion.key === "matchScore"
                                      ? "bg-green-500"
                                      : criterion.key === "qualityScore"
                                      ? "bg-purple-500"
                                      : "bg-blue-500"
                                  }`}
                                  style={{ width: `${Math.min(100, value)}%` }}
                                />
                              </div>
                            </div>
                          )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Recommendation Section */}
      <div className="border-t bg-linear-to-r from-blue-50 to-indigo-50">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                AI Recommendation
              </h3>
              <p className="text-sm text-gray-600">
                Based on the selected criteria, here's our smart recommendation:
              </p>
            </div>

            <button
              onClick={() => {
                // Generate detailed AI analysis
                console.log(
                  "Generate AI recommendation for:",
                  manufacturers.map((m) => m.id)
                );
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Get Detailed Analysis
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: "Best for Quality",
                description: "Highest quality scores and certifications",
                getBest: () =>
                  manufacturers.reduce((best, current) =>
                    current.qualityScore + current.rating * 20 >
                    best.qualityScore + best.rating * 20
                      ? current
                      : best
                  ),
              },
              {
                title: "Best for Budget",
                description: "Best value for money",
                getBest: () =>
                  manufacturers.reduce((best, current) => {
                    const tierValue = { budget: 3, standard: 2, premium: 1 };
                    return tierValue[current.pricingTier] >
                      tierValue[best.pricingTier]
                      ? current
                      : best;
                  }),
              },
              {
                title: "Best for Speed",
                description: "Fastest production and delivery",
                getBest: () =>
                  manufacturers.reduce((best, current) => {
                    const leadTimeA = parseInt(current.leadTime);
                    const leadTimeB = parseInt(best.leadTime);
                    return leadTimeA < leadTimeB ? current : best;
                  }),
              },
            ].map((category, idx) => {
              const bestManufacturer = category.getBest();

              return (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-xl border shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900">
                      {category.title}
                    </span>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
                      Recommended
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    {bestManufacturer.avatar ? (
                      <div className="relative w-10 h-10">
                        <Image
                          src={bestManufacturer.avatar}
                          alt={bestManufacturer.company}
                          fill
                          className="rounded-lg object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-linear-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-bold">
                          {bestManufacturer.company.charAt(0)}
                        </span>
                      </div>
                    )}

                    <div>
                      <div className="font-medium text-gray-900">
                        {bestManufacturer.company}
                      </div>
                      <div className="text-sm text-gray-600">
                        {bestManufacturer.locations[0]}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">
                    {category.description}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="font-medium ml-1">
                        {bestManufacturer.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="text-green-600 font-medium">
                      {bestManufacturer.matchScore}% match
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
