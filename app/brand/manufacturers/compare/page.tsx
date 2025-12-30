"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Manufacturer } from "@/lib/types";
import ManufacturerSelector from "@/components/brand/ManufacturerSelector";
import ComparisonTable from "@/components/brand/ComparisonTable";

// Using your exact Manufacturer type

// Extended type with additional fields for comparison
export type ManufacturerForComparison = Manufacturer & {
  leadTime: string; // Added for comparison
  responseTime: string;
  sustainabilityScore: number;
  qualityScore: number;
  pricingTier: "budget" | "standard" | "premium";
};

export default function ComparePage() {
  const [selectedManufacturers, setSelectedManufacturers] = useState<
    ManufacturerForComparison[]
  >([]);
  const [availableManufacturers, setAvailableManufacturers] = useState<
    ManufacturerForComparison[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [maxSelections, setMaxSelections] = useState(4);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    loadManufacturers();
  }, []);

  const loadManufacturers = async () => {
    try {
      setIsLoading(true);

      // Get manufacturer IDs from URL
      const ids = searchParams.get("ids")?.split(",") || [];

      if (ids.length > 0) {
        const manufacturers = await getManufacturersForComparison(ids);
        setSelectedManufacturers(manufacturers);
      }

      // Load available manufacturers
      const allManufacturers = await fetchAvailableManufacturers();
      setAvailableManufacturers(allManufacturers);
    } catch (error) {
      console.error("Failed to load manufacturers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getManufacturersForComparison = async (
    ids: string[]
  ): Promise<ManufacturerForComparison[]> => {
    const response = await fetch(`/api/manufacturers?ids=${ids.join(",")}`);
    if (!response.ok) throw new Error("Failed to fetch manufacturers");
    const data = await response.json();

    // Enhance with comparison-specific fields
    return data.map((manufacturer: Manufacturer) => ({
      ...manufacturer,
      leadTime: generateLeadTime(manufacturer),
      responseTime: generateResponseTime(manufacturer.rating),
      sustainabilityScore: generateSustainabilityScore(manufacturer),
      qualityScore: generateQualityScore(manufacturer),
      pricingTier: generatePricingTier(manufacturer),
    }));
  };

  const fetchAvailableManufacturers = async (): Promise<
    ManufacturerForComparison[]
  > => {
    const response = await fetch("/api/manufacturers?limit=50&verified=true");
    if (!response.ok) throw new Error("Failed to fetch manufacturers");
    const data = await response.json();

    return data.map((manufacturer: Manufacturer) => ({
      ...manufacturer,
      leadTime: generateLeadTime(manufacturer),
      responseTime: generateResponseTime(manufacturer.rating),
      sustainabilityScore: generateSustainabilityScore(manufacturer),
      qualityScore: generateQualityScore(manufacturer),
      pricingTier: generatePricingTier(manufacturer),
    }));
  };

  // Helper functions to generate comparison data
  const generateLeadTime = (manufacturer: Manufacturer): string => {
    const base = manufacturer.productionCapacity
      ? Math.max(
          7,
          Math.min(90, 1000000 / (manufacturer.productionCapacity || 1))
        )
      : 30;
    const variation =
      manufacturer.rating > 4 ? -7 : manufacturer.rating > 3 ? 0 : 14;
    return `${Math.round(base + variation)} days`;
  };

  const generateResponseTime = (rating: number): string => {
    if (rating >= 4.5) return "< 2 hours";
    if (rating >= 4) return "< 4 hours";
    if (rating >= 3.5) return "< 8 hours";
    return "< 24 hours";
  };

  const generateSustainabilityScore = (manufacturer: Manufacturer): number => {
    let score = 50;
    if (manufacturer.certifications?.includes("ISO 14001")) score += 20;
    if (
      manufacturer.certifications?.some(
        (c) => c.includes("Green") || c.includes("Sustainable")
      )
    )
      score += 15;
    if (manufacturer.industries?.includes("Renewable Energy")) score += 10;
    if (manufacturer.verified) score += 5;
    return Math.min(100, score);
  };

  const generateQualityScore = (manufacturer: Manufacturer): number => {
    let score = Math.round(manufacturer.rating * 15); // 5*15 = 75 max from rating
    if (manufacturer.certifications?.includes("ISO 9001")) score += 20;
    if (manufacturer.matchScore > 80) score += 5;
    return Math.min(100, score);
  };

  const generatePricingTier = (
    manufacturer: Manufacturer
  ): "budget" | "standard" | "premium" => {
    if (manufacturer.rating >= 4.5 && manufacturer.verified) return "premium";
    if (manufacturer.rating >= 3.5) return "standard";
    return "budget";
  };

  const handleAddManufacturer = (manufacturer: ManufacturerForComparison) => {
    if (selectedManufacturers.length >= maxSelections) {
      alert(`Maximum ${maxSelections} manufacturers can be compared at once`);
      return;
    }

    if (!selectedManufacturers.some((m) => m.id === manufacturer.id)) {
      const updated = [...selectedManufacturers, manufacturer];
      setSelectedManufacturers(updated);
      updateURL(updated);
    }
  };

  const handleRemoveManufacturer = (id: string) => {
    const updated = selectedManufacturers.filter((m) => m.id !== id);
    setSelectedManufacturers(updated);
    updateURL(updated);
  };

  const handleClearAll = () => {
    setSelectedManufacturers([]);
    router.push("/manufacturers/compare");
  };

  const updateURL = (manufacturers: ManufacturerForComparison[]) => {
    const ids = manufacturers.map((m) => m.id).join(",");
    const params = new URLSearchParams();
    if (ids) params.set("ids", ids);
    router.push(`/manufacturers/compare?${params.toString()}`);
  };

  const handleSaveComparison = () => {
    const comparisonData = {
      manufacturerIds: selectedManufacturers.map((m) => m.id),
      manufacturerNames: selectedManufacturers.map((m) => m.name),
      timestamp: new Date().toISOString(),
      summary: generateComparisonSummary(),
    };

    localStorage.setItem("savedComparison", JSON.stringify(comparisonData));

    // Also save to user's profile via API
    fetch("/api/user/comparisons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(comparisonData),
    });

    alert("Comparison saved to your profile!");
  };

  const generateComparisonSummary = () => {
    if (selectedManufacturers.length === 0) return "";

    const bestRating = Math.max(...selectedManufacturers.map((m) => m.rating));
    const bestManufacturer = selectedManufacturers.find(
      (m) => m.rating === bestRating
    );

    return `Comparing ${selectedManufacturers.length} manufacturers. ${
      bestManufacturer?.company
    } has the highest rating (${bestRating.toFixed(1)}/5).`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Compare Manufacturers
              </h1>
              <p className="text-gray-600 mt-2">
                Compare capabilities, pricing, and performance side-by-side
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveComparison}
                disabled={selectedManufacturers.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save Comparison
              </button>
              <button
                onClick={handleClearAll}
                disabled={selectedManufacturers.length === 0}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Selection Section */}
        <div className="mb-8">
          <ManufacturerSelector
            manufacturers={availableManufacturers}
            selectedManufacturers={selectedManufacturers}
            onAdd={handleAddManufacturer}
            onRemove={handleRemoveManufacturer}
            maxSelections={maxSelections}
          />
        </div>

        {/* Main Comparison Table */}
        {selectedManufacturers.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border">
            <ComparisonTable manufacturers={selectedManufacturers} />

            {/* Quick Stats */}
            <div className="border-t p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Stats
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedManufacturers.filter((m) => m.verified).length}/
                    {selectedManufacturers.length}
                  </div>
                  <div className="text-sm text-gray-600">Verified</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.max(
                      ...selectedManufacturers.map((m) => m.rating)
                    ).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Best Rating</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedManufacturers.reduce(
                      (acc, m) => acc + (m.capabilities?.length || 0),
                      0
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    Total Capabilities
                  </div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-amber-600">
                    {selectedManufacturers.filter((m) => m.isBookmarked).length}
                  </div>
                  <div className="text-sm text-gray-600">Bookmarked</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border shadow-sm">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Manufacturers Selected
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Select manufacturers from the list above to start comparing
              capabilities, pricing, and performance metrics.
            </p>
          </div>
        )}

        {/* AI Recommendation Section */}
        {selectedManufacturers.length >= 2 && (
          <div className="mt-8">
            <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-blue-600"
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
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    AI-Powered Recommendations
                  </h3>
                  <p className="text-sm text-gray-600">
                    Get personalized suggestions based on your specific
                    requirements
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => {
                    // Trigger AI analysis for best match
                    console.log("Trigger AI match analysis");
                  }}
                  className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow text-left"
                >
                  <div className="font-medium text-gray-900 mb-2">
                    Best Overall Match
                  </div>
                  <p className="text-sm text-gray-600">
                    AI will analyze all factors to find your perfect
                    manufacturer
                  </p>
                </button>

                <button
                  onClick={() => {
                    // Trigger cost-benefit analysis
                    console.log("Trigger cost-benefit analysis");
                  }}
                  className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow text-left"
                >
                  <div className="font-medium text-gray-900 mb-2">
                    Cost-Benefit Analysis
                  </div>
                  <p className="text-sm text-gray-600">
                    Compare value vs. pricing for each manufacturer
                  </p>
                </button>
              </div>

              <button
                onClick={() => {
                  // Full AI analysis
                  console.log(
                    "Full AI analysis for:",
                    selectedManufacturers.map((m) => m.id)
                  );
                }}
                className="w-full md:w-auto px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                Generate Complete AI Analysis
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
