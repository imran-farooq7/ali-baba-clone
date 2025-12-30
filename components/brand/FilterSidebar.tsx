// components/manufacturers/FilterSidebar.tsx
"use client";

import { Filter, X, Check, ChevronDown, ChevronUp, Star } from "lucide-react";
import { useState } from "react";

interface FilterSidebarProps {
  categories: string[];
  locations: string[];
  certifications: string[];
  selectedFilters: {
    category: string[];
    location: string[];
    certification: string[];
    minCapacity: number | null;
    minOrderQuantity: number | null;
    verifiedOnly: boolean;
  };
  onFilterChange: (filters: any) => void;
  onClearFilters: () => void;
}

export default function FilterSidebar({
  categories,
  locations,
  certifications,
  selectedFilters,
  onFilterChange,
  onClearFilters,
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    location: true,
    certification: true,
    capacity: true,
    requirements: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = selectedFilters.category.includes(category)
      ? selectedFilters.category.filter((c) => c !== category)
      : [...selectedFilters.category, category];

    onFilterChange({ ...selectedFilters, category: newCategories });
  };

  const handleLocationToggle = (location: string) => {
    const newLocations = selectedFilters.location.includes(location)
      ? selectedFilters.location.filter((l) => l !== location)
      : [...selectedFilters.location, location];

    onFilterChange({ ...selectedFilters, location: newLocations });
  };

  const handleCertificationToggle = (cert: string) => {
    const newCerts = selectedFilters.certification.includes(cert)
      ? selectedFilters.certification.filter((c) => c !== cert)
      : [...selectedFilters.certification, cert];

    onFilterChange({ ...selectedFilters, certification: newCerts });
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        <button
          onClick={onClearFilters}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Clear all
        </button>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("category")}
          className="flex items-center justify-between w-full mb-3"
        >
          <h3 className="font-medium text-gray-900">Category</h3>
          {expandedSections.category ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>

        {expandedSections.category && (
          <div className="space-y-2">
            {categories.map((category) => (
              <label
                key={category}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedFilters.category.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{category}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Location Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("location")}
          className="flex items-center justify-between w-full mb-3"
        >
          <h3 className="font-medium text-gray-900">Location</h3>
          {expandedSections.location ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>

        {expandedSections.location && (
          <div className="space-y-2">
            {locations.map((location) => (
              <label
                key={location}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedFilters.location.includes(location)}
                  onChange={() => handleLocationToggle(location)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{location}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Certification Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("certification")}
          className="flex items-center justify-between w-full mb-3"
        >
          <h3 className="font-medium text-gray-900">Certification</h3>
          {expandedSections.certification ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>

        {expandedSections.certification && (
          <div className="space-y-2">
            {certifications.map((cert) => (
              <label
                key={cert}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedFilters.certification.includes(cert)}
                  onChange={() => handleCertificationToggle(cert)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{cert}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Capacity Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("capacity")}
          className="flex items-center justify-between w-full mb-3"
        >
          <h3 className="font-medium text-gray-900">Production Capacity</h3>
          {expandedSections.capacity ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>

        {expandedSections.capacity && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Minimum Capacity (units/month)
              </label>
              <input
                type="number"
                value={selectedFilters.minCapacity || ""}
                onChange={(e) =>
                  onFilterChange({
                    ...selectedFilters,
                    minCapacity: e.target.value
                      ? parseInt(e.target.value)
                      : null,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 10000"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Minimum Order Quantity
              </label>
              <input
                type="number"
                value={selectedFilters.minOrderQuantity || ""}
                onChange={(e) =>
                  onFilterChange({
                    ...selectedFilters,
                    minOrderQuantity: e.target.value
                      ? parseInt(e.target.value)
                      : null,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Requirements Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("requirements")}
          className="flex items-center justify-between w-full mb-3"
        >
          <h3 className="font-medium text-gray-900">Requirements</h3>
          {expandedSections.requirements ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>

        {expandedSections.requirements && (
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedFilters.verifiedOnly}
                onChange={(e) =>
                  onFilterChange({
                    ...selectedFilters,
                    verifiedOnly: e.target.checked,
                  })
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-700">Verified Only</span>
              </div>
            </label>
          </div>
        )}
      </div>

      {/* Active Filters Count */}
      <div className="pt-6 border-t">
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {Object.values(selectedFilters).reduce((count: number, filter) => {
              if (Array.isArray(filter)) return count + filter.length;
              if (typeof filter === "boolean")
                return filter ? count + 1 : count;
              if (typeof filter === "number") return count + 1;
              return count;
            }, 0)}{" "}
            active filters
          </p>
        </div>
      </div>
    </div>
  );
}
