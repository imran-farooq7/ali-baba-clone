"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Manufacturer } from "@/lib/types";
import { ManufacturerForComparison } from "@/app/brand/manufacturers/compare/page";

interface ManufacturerSelectorProps {
  manufacturers: ManufacturerForComparison[];
  selectedManufacturers: Manufacturer[];
  onAdd: (manufacturer: ManufacturerForComparison) => void;
  onRemove: (id: string) => void;
  maxSelections: number;
}

export default function ManufacturerSelector({
  manufacturers,
  selectedManufacturers,
  onAdd,
  onRemove,
  maxSelections,
}: ManufacturerSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCapability, setFilterCapability] = useState("all");
  const [filterIndustry, setFilterIndustry] = useState("all");
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"rating" | "matchScore" | "name">(
    "matchScore"
  );

  // Filter and sort available manufacturers
  const filteredManufacturers = useMemo(() => {
    let filtered = manufacturers.filter(
      (m) => !selectedManufacturers.some((selected) => selected.id === m.id)
    );

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.locations.some((loc) =>
            loc.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Apply capability filter
    if (filterCapability !== "all") {
      filtered = filtered.filter((m) =>
        m.capabilities?.includes(filterCapability)
      );
    }

    // Apply industry filter
    if (filterIndustry !== "all") {
      filtered = filtered.filter((m) => m.industries?.includes(filterIndustry));
    }

    // Apply verified filter
    if (showVerifiedOnly) {
      filtered = filtered.filter((m) => m.verified);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "matchScore":
          return b.matchScore - a.matchScore;
        case "name":
          return a.company.localeCompare(b.company);
        default:
          return 0;
      }
    });

    return filtered;
  }, [
    manufacturers,
    selectedManufacturers,
    searchTerm,
    filterCapability,
    filterIndustry,
    showVerifiedOnly,
    sortBy,
  ]);

  // Get unique capabilities for filter dropdown
  const allCapabilities = useMemo(() => {
    const capabilities = new Set<string>();
    manufacturers.forEach((m) => {
      m.capabilities?.forEach((cap) => capabilities.add(cap));
    });
    return ["all", ...Array.from(capabilities)].slice(0, 15);
  }, [manufacturers]);

  // Get unique industries for filter dropdown
  const allIndustries = useMemo(() => {
    const industries = new Set<string>();
    manufacturers.forEach((m) => {
      m.industries?.forEach((ind) => industries.add(ind));
    });
    return ["all", ...Array.from(industries)].slice(0, 10);
  }, [manufacturers]);

  return (
    <div className="space-y-6">
      {/* Selected Manufacturers */}
      {selectedManufacturers.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-blue-900">
              Selected for Comparison ({selectedManufacturers.length}/
              {maxSelections})
            </h3>
            <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">
              {maxSelections - selectedManufacturers.length} more available
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            {selectedManufacturers.map((manufacturer) => (
              <div
                key={manufacturer.id}
                className="flex items-center gap-3 bg-white border border-blue-300 rounded-lg pl-4 pr-3 py-3 shadow-sm"
              >
                {manufacturer.avatar ? (
                  <div className="relative w-8 h-8">
                    <Image
                      src={manufacturer.avatar}
                      alt={manufacturer.company}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
                      {manufacturer.company.charAt(0)}
                    </span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-blue-900 truncate">
                      {manufacturer.company}
                    </span>
                    {manufacturer.verified && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 text-yellow-400 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {manufacturer.rating.toFixed(1)}
                    </span>
                    <span>•</span>
                    <span className="truncate">
                      {manufacturer.locations[0]}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onRemove(manufacturer.id)}
                  className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                  aria-label={`Remove ${manufacturer.company}`}
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="bg-white p-6 rounded-xl border space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Input */}
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Search Manufacturers
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, company, or location..."
                className="pl-10 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Capability Filter */}
          <div>
            <label
              htmlFor="capability"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Filter by Capability
            </label>
            <select
              id="capability"
              value={filterCapability}
              onChange={(e) => setFilterCapability(e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {allCapabilities.map((capability) => (
                <option key={capability} value={capability}>
                  {capability === "all" ? "All Capabilities" : capability}
                </option>
              ))}
            </select>
          </div>

          {/* Industry Filter */}
          <div>
            <label
              htmlFor="industry"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Filter by Industry
            </label>
            <select
              id="industry"
              value={filterIndustry}
              onChange={(e) => setFilterIndustry(e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {allIndustries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry === "all" ? "All Industries" : industry}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label
              htmlFor="sort"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Sort By
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="matchScore">Best Match</option>
              <option value="rating">Highest Rating</option>
              <option value="name">Company Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Additional Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <input
              id="verified-only"
              type="checkbox"
              checked={showVerifiedOnly}
              onChange={(e) => setShowVerifiedOnly(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="verified-only"
              className="ml-2 text-sm text-gray-700"
            >
              Show verified only
            </label>
          </div>

          <div className="text-sm text-gray-600">
            <span className="font-medium text-blue-600">
              {filteredManufacturers.length}
            </span>{" "}
            manufacturer(s) available
          </div>

          <div className="ml-auto text-sm">
            <span className="text-gray-600">Match threshold: </span>
            <span className="font-medium text-green-600">70+</span>
          </div>
        </div>
      </div>

      {/* Manufacturer Grid */}
      {filteredManufacturers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredManufacturers.slice(0, 12).map((manufacturer) => (
            <div
              key={manufacturer.id}
              className="bg-white border rounded-xl p-5 hover:shadow-lg transition-all duration-200 hover:border-blue-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {manufacturer.avatar ? (
                    <div className="relative w-12 h-12">
                      <Image
                        src={manufacturer.avatar}
                        alt={manufacturer.company}
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-linear-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-lg">
                        {manufacturer.company.charAt(0)}
                      </span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">
                        {manufacturer.company}
                      </h4>
                      {manufacturer.verified && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {manufacturer.name}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onAdd(manufacturer)}
                  disabled={selectedManufacturers.length >= maxSelections}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedManufacturers.length >= maxSelections
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                  }`}
                >
                  Add to Compare
                </button>
              </div>

              <div className="space-y-3">
                {/* Rating and Match Score */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex items-center mr-4">
                      <svg
                        className="w-4 h-4 text-yellow-400 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-medium">
                        {manufacturer.rating.toFixed(1)}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                      <span className="font-medium text-gray-700">
                        {manufacturer.matchScore}%
                      </span>
                      <span className="text-xs text-gray-500 ml-1">match</span>
                    </div>
                  </div>

                  <button className="text-gray-400 hover:text-red-500">
                    <svg
                      className="w-5 h-5"
                      fill={manufacturer.isBookmarked ? "currentColor" : "none"}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={manufacturer.isBookmarked ? 0 : 2}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                  </button>
                </div>

                {/* Location */}
                <div className="flex items-center text-sm text-gray-600">
                  <svg
                    className="w-4 h-4 mr-2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="truncate">
                    {manufacturer.locations.join(", ")}
                  </span>
                </div>

                {/* Production Capacity */}
                {manufacturer.productionCapacity && (
                  <div className="text-sm">
                    <span className="text-gray-600">Capacity: </span>
                    <span className="font-medium">
                      {manufacturer.productionCapacity.toLocaleString()}{" "}
                      units/month
                    </span>
                  </div>
                )}

                {/* Capabilities */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">
                    Key Capabilities:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {manufacturer.capabilities
                      ?.slice(0, 3)
                      .map((capability) => (
                        <span
                          key={capability}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                        >
                          {capability}
                        </span>
                      ))}
                    {manufacturer.capabilities &&
                      manufacturer.capabilities.length > 3 && (
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                          +{manufacturer.capabilities.length - 3} more
                        </span>
                      )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border">
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
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Manufacturers Found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ||
            filterCapability !== "all" ||
            filterIndustry !== "all" ||
            showVerifiedOnly
              ? "Try adjusting your filters to see more results."
              : "All available manufacturers are already selected for comparison."}
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterCapability("all");
              setFilterIndustry("all");
              setShowVerifiedOnly(false);
            }}
            className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
