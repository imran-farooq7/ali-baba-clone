"use client";

import { useState, useEffect } from "react";
import ComparisonTable from "@/components/manufacturers/ComparisonTable";
import ManufacturerSelector from "@/components/manufacturers/ManufacturerSelector";
import { useSearchParams, useRouter } from "next/navigation";
import { getManufacturersForComparison } from "@/lib/api/manufacturers";
import { Manufacturer } from "@/lib/types";

export default function ComparePage() {
  const [selectedManufacturers, setSelectedManufacturers] = useState<
    Manufacturer[]
  >([]);
  const [availableManufacturers, setAvailableManufacturers] = useState<
    Manufacturer[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [maxSelections, setMaxSelections] = useState(4); // Limit to 4 for better UI
  const searchParams = useSearchParams();
  const router = useRouter();

  // Load manufacturers from URL or saved selections
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

      // Load available manufacturers for selection
      const allManufacturers = await fetchAvailableManufacturers();
      setAvailableManufacturers(allManufacturers);
    } catch (error) {
      console.error("Failed to load manufacturers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableManufacturers = async (): Promise<Manufacturer[]> => {
    const response = await fetch("/api/manufacturers?limit=50");
    if (!response.ok) throw new Error("Failed to fetch manufacturers");
    return response.json();
  };

  const handleAddManufacturer = (manufacturer: Manufacturer) => {
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

  const updateURL = (manufacturers: Manufacturer[]) => {
    const ids = manufacturers.map((m) => m.id).join(",");
    const params = new URLSearchParams();
    if (ids) params.set("ids", ids);
    router.push(`/manufacturers/compare?${params.toString()}`);
  };

  const handleSaveComparison = () => {
    const comparisonData = {
      manufacturers: selectedManufacturers,
      timestamp: new Date().toISOString(),
      criteria: ["capabilities", "pricing", "leadTime", "quality"],
    };

    // Save to localStorage or send to API
    localStorage.setItem("savedComparison", JSON.stringify(comparisonData));
    alert("Comparison saved! You can access it later from your dashboard.");
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
                Side-by-side comparison to make informed decisions
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveComparison}
                disabled={selectedManufacturers.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Comparison
              </button>
              <button
                onClick={handleClearAll}
                disabled={selectedManufacturers.length === 0}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Select Manufacturers to Compare ({selectedManufacturers.length}/
              {maxSelections})
            </h2>
            <span className="text-sm text-gray-500">
              Add up to {maxSelections} manufacturers
            </span>
          </div>

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
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <ComparisonTable manufacturers={selectedManufacturers} />

            {/* Comparison Summary */}
            <div className="border-t p-6 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedManufacturers.length}
                  </div>
                  <div className="text-sm text-gray-600">Manufacturers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.max(...selectedManufacturers.map((m) => m.rating))}/5
                  </div>
                  <div className="text-sm text-gray-600">Best Rating</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
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
            <p className="text-gray-600 mb-6">
              Add manufacturers from the selection panel above to start
              comparing
            </p>
          </div>
        )}

        {/* AI-Powered Recommendations */}
        {selectedManufacturers.length >= 2 && (
          <div className="mt-8">
            <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
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
                <h3 className="text-lg font-semibold text-gray-900">
                  AI-Powered Recommendation
                </h3>
              </div>
              <p className="text-gray-700 mb-4">
                Based on your selection, our AI will analyze and suggest the
                best match for your requirements.
              </p>
              <button
                onClick={() => {
                  // This will trigger the AI analysis (we'll implement this next)
                  console.log(
                    "Trigger AI analysis for:",
                    selectedManufacturers.map((m) => m.id)
                  );
                }}
                className="px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:opacity-90"
              >
                Get AI Recommendation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
