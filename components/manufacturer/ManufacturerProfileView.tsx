"use client";

import { Manufacturer } from "@/lib/types";
import {
  Award,
  CheckCircle,
  Factory,
  MapPin,
  Package,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

interface ManufacturerProfileViewProps {
  manufacturer: Manufacturer;
  viewType: "OWNER" | "BRAND" | "ADMIN" | "PUBLIC";
}

export default function ManufacturerProfileView({
  manufacturer,
  viewType,
}: ManufacturerProfileViewProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "capabilities", label: "Capabilities" },
    { id: "certifications", label: "Certifications" },
    { id: "production", label: "Production" },
    ...(viewType === "OWNER" || viewType === "ADMIN"
      ? [{ id: "analytics", label: "Analytics" }]
      : []),
  ];

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Company Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">
                      Company Name
                    </label>
                    <p className="text-gray-900 font-medium">
                      {manufacturer.company || manufacturer.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">
                      Contact Person
                    </label>
                    <p className="text-gray-900 font-medium">
                      {manufacturer.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Email</label>
                    <p className="text-gray-900 font-medium">
                      {manufacturer.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {manufacturer.description && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Description
                </h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {manufacturer.description}
                </p>
              </div>
            )}

            {/* Locations */}
            {manufacturer.locations && manufacturer.locations.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Locations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {manufacturer.locations.map(
                    (location: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg"
                      >
                        <MapPin className="h-4 w-4" />
                        {location}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Industries */}
            {manufacturer.industries && manufacturer.industries.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Industries Served
                </h3>
                <div className="flex flex-wrap gap-2">
                  {manufacturer.industries.map(
                    (industry: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm"
                      >
                        {industry}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "capabilities" && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Manufacturing Capabilities
              <span className="ml-2 text-sm text-gray-500">
                ({manufacturer.capabilities?.length || 0} capabilities)
              </span>
            </h3>

            {manufacturer.capabilities &&
            manufacturer.capabilities.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {manufacturer.capabilities.map(
                  (capability: string, index: number) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gray-100 rounded">
                          <Factory className="h-5 w-5 text-gray-600" />
                        </div>
                        <h4 className="font-medium text-gray-900">
                          {capability}
                        </h4>
                      </div>

                      {(manufacturer.capabilities as Record<string, any>)?.[
                        capability
                      ] && (
                        <div className="mt-3 text-sm text-gray-600">
                          {Object.entries(
                            (manufacturer.capabilities as Record<string, any>)[
                              capability
                            ]
                          ).map(([key, value]: [string, any]) => (
                            <div
                              key={key}
                              className="flex justify-between py-1"
                            >
                              <span className="text-gray-500">{key}:</span>
                              <span className="font-medium">
                                {Array.isArray(value)
                                  ? value.join(", ")
                                  : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No capabilities added yet. Add capabilities to attract more
                brands.
              </div>
            )}
          </div>
        )}

        {activeTab === "certifications" && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Certifications & Standards
              <span className="ml-2 text-sm text-gray-500">
                ({manufacturer.certifications?.length || 0} certifications)
              </span>
            </h3>

            {manufacturer.certifications &&
            manufacturer.certifications.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {manufacturer.certifications.map(
                  (certification: string, index: number) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-100 rounded">
                          <Award className="h-5 w-5 text-green-600" />
                        </div>
                        <h4 className="font-medium text-gray-900">
                          {certification}
                        </h4>
                      </div>

                      {(manufacturer.certifications as Record<string, any>)?.[
                        certification
                      ] && (
                        <div className="space-y-2 text-sm">
                          {Object.entries(
                            (
                              manufacturer.certifications as Record<string, any>
                            )[certification]
                          ).map(([key, value]: [string, any]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-500">{key}:</span>
                              <span className="font-medium text-gray-900">
                                {String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No certifications added yet. Add certifications to build trust
                with brands.
              </div>
            )}
          </div>
        )}

        {activeTab === "production" && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">
              Production Capacity
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Minimum Order</h4>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {manufacturer.minOrderQuantity?.toLocaleString() || "N/A"}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Minimum quantity per order
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Maximum Order</h4>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {manufacturer.maxOrderQuantity?.toLocaleString() || "N/A"}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Maximum quantity per order
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Factory className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Monthly Capacity
                    </h4>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {manufacturer.productionCapacity?.toLocaleString() ||
                        "N/A"}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Total monthly production capacity
                </p>
              </div>
            </div>

            {/* Production Notes */}
            {/* {manufacturer.metadata?.productionNotes && (
              <div className="border border-gray-200 rounded-lg p-5">
                <h4 className="font-medium text-gray-900 mb-3">
                  Production Notes
                </h4>
                <p className="text-gray-700">
                  {manufacturer.metadata.productionNotes}
                </p>
              </div>
            )} */}
          </div>
        )}

        {activeTab === "analytics" && viewType === "OWNER" && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">
              Performance Analytics
            </h3>

            <div className="text-center py-8 text-gray-500">
              Analytics data will appear as you submit proposals and work with
              brands.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
