// app/(brand)/manufacturers/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  MapPin,
  Star,
  Users,
  Factory,
  CheckCircle,
  Grid,
  List,
  SlidersHorizontal,
  X,
  Bookmark,
  BookmarkCheck,
  BarChart,
  TrendingUp,
} from "lucide-react";
import { useCompare } from "@/hooks/useCompare";
import ManufacturerGrid from "@/components/brand/ManufacturerGrid";
import FilterSidebar from "@/components/brand/FilterSidebar";
import CompareButton from "@/components/brand/CompareButton";
import { useManufacturers } from "@/lib/brand/hooks/useManufacturers";

export default function ManufacturerDiscoveryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    category: [] as string[],
    location: [] as string[],
    certification: [] as string[],
    minCapacity: null as number | null,
    minOrderQuantity: null as number | null,
    verifiedOnly: false,
  });

  // Custom hooks for data
  const { manufacturers, isLoading, error, refetch, totalCount, matchedCount } =
    useManufacturers(searchQuery, selectedFilters);

  const { selectedManufacturers, toggleCompare, clearCompare, canCompare } =
    useCompare();

  // Categories from your briefs for matching
  const categories = [
    "Electronics Manufacturing",
    "Apparel Production",
    "Plastic Injection Molding",
    "Metal Fabrication",
    "Packaging Solutions",
    "Consumer Goods",
    "Industrial Equipment",
    "Medical Devices",
    "Automotive Parts",
    "Home Appliances",
  ];

  const locations = [
    "Global",
    "North America",
    "Europe",
    "Asia",
    "China",
    "Vietnam",
    "India",
    "Mexico",
    "USA",
    "Germany",
  ];

  const certifications = [
    "ISO 9001",
    "ISO 14001",
    "FDA",
    "CE",
    "RoHS",
    "UL",
    "REACH",
    "GMP",
  ];

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleFilterChange = useCallback((filters: any) => {
    setSelectedFilters(filters);
  }, []);

  const clearFilters = () => {
    setSelectedFilters({
      category: [],
      location: [],
      certification: [],
      minCapacity: null,
      minOrderQuantity: null,
      verifiedOnly: false,
    });
    setSearchQuery("");
  };

  const handleBookmark = async (manufacturerId: string) => {
    // Implement bookmark functionality
    try {
      await fetch("/api/manufacturers/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manufacturerId }),
      });
      refetch();
    } catch (error) {
      console.error("Failed to bookmark:", error);
    }
  };

  const goToCompare = () => {
    if (selectedManufacturers.length > 0) {
      router.push(
        `/manufacturers/compare?ids=${selectedManufacturers.join(",")}`
      );
    }
  };

  // Calculate active filters count
  const activeFilterCount = (() => {
    let count = 0;

    // Count array filters
    count += selectedFilters.category.length;
    count += selectedFilters.location.length;
    count += selectedFilters.certification.length;

    // Count other filters
    if (selectedFilters.minCapacity !== null) count += 1;
    if (selectedFilters.minOrderQuantity !== null) count += 1;
    if (selectedFilters.verifiedOnly) count += 1;

    return count;
  })();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Discover Manufacturers
              </h1>
              <p className="text-gray-600 mt-2">
                Find and connect with verified manufacturers for your projects
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Compare button */}
              <CompareButton
                count={selectedManufacturers.length}
                onClick={goToCompare}
                disabled={!canCompare}
              />

              {/* View toggle */}
              <div className="hidden md:flex items-center border rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${
                    viewMode === "grid"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-500"
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded ${
                    viewMode === "list"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-500"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Factory className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Total</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {totalCount.toLocaleString()}
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Matched
                </span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {matchedCount.toLocaleString()}
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">
                  Verified
                </span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {manufacturers.filter((m) => m.verified).length}
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">
                  Bookmarked
                </span>
              </div>
              <div className="text-2xl font-bold text-orange-900">
                {manufacturers.filter((m) => m.isBookmarked).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block lg:w-64 shrink-0">
            <FilterSidebar
              categories={categories}
              locations={locations}
              certifications={certifications}
              selectedFilters={selectedFilters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Search and Mobile Filters */}
            <div className="bg-white rounded-xl border shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search manufacturers by name, capability, or location..."
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <SlidersHorizontal className="h-5 w-5 text-gray-600" />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="px-2 py-1 text-xs bg-blue-500 text-white rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Clear Filters Button */}
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-900"
                  >
                    <X className="h-5 w-5" />
                    <span>Clear all</span>
                  </button>
                )}
              </div>

              {/* Active Filters - Mobile */}
              {activeFilterCount > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex flex-wrap gap-2">
                    {selectedFilters.category.map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {cat}
                        <button
                          onClick={() =>
                            handleFilterChange({
                              ...selectedFilters,
                              category: selectedFilters.category.filter(
                                (c) => c !== cat
                              ),
                            })
                          }
                          className="ml-1 hover:text-blue-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    {/* Add other active filters similarly */}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Filters Drawer */}
            {showFilters && (
              <div className="lg:hidden mb-6">
                <FilterSidebar
                  categories={categories}
                  locations={locations}
                  certifications={certifications}
                  selectedFilters={selectedFilters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={clearFilters}
                />
              </div>
            )}

            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {isLoading
                    ? "Loading manufacturers..."
                    : `Showing ${manufacturers.length} manufacturers`}
                </h2>
                {searchQuery && (
                  <p className="text-sm text-gray-500 mt-1">
                    Results for "{searchQuery}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Sort by:</span>
                <select className="border-none bg-transparent focus:ring-0">
                  <option>Best Match</option>
                  <option>Rating</option>
                  <option>Price</option>
                  <option>Capacity</option>
                </select>
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-600">
                  Finding the best manufacturers for you...
                </p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <X className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Error loading manufacturers
                </h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            ) : manufacturers.length === 0 ? (
              <div className="bg-white border rounded-xl p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Factory className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No manufacturers found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or filters
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                {/* Manufacturer Grid/List */}
                <ManufacturerGrid
                  manufacturers={manufacturers}
                  viewMode={viewMode}
                  onBookmark={handleBookmark}
                  onCompareToggle={toggleCompare}
                  selectedForCompare={selectedManufacturers}
                />

                {/* Load More Button */}
                {manufacturers.length < totalCount && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={() => {
                        /* Load more logic */
                      }}
                      className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Load More Manufacturers
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Comparison Bar - Sticky */}
            {selectedManufacturers.length > 0 && (
              <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border rounded-xl shadow-lg p-4 flex items-center gap-4 z-50">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {selectedManufacturers.length} selected
                  </span>
                  <button
                    onClick={clearCompare}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={goToCompare}
                  disabled={!canCompare}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Compare ({selectedManufacturers.length})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
