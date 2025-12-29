// components/manufacturers/ManufacturerCard.tsx
"use client";

import { Manufacturer } from "@/lib/types";
import {
  Factory,
  MapPin,
  Star,
  CheckCircle,
  Bookmark,
  BookmarkCheck,
  Users,
  TrendingUp,
  BarChart,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ManufacturerCardProps {
  manufacturer: Manufacturer;
  viewMode: "grid" | "list";
  onBookmark: (id: string) => void;
  onCompareToggle: (id: string) => void;
  isSelectedForCompare: boolean;
}

export default function ManufacturerCard({
  manufacturer,
  viewMode,
  onBookmark,
  onCompareToggle,
  isSelectedForCompare,
}: ManufacturerCardProps) {
  const isGrid = viewMode === "grid";

  return (
    <div
      className={`group relative bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ${
        isGrid ? "p-4" : "p-6"
      } ${isSelectedForCompare ? "ring-2 ring-blue-500" : ""}`}
    >
      {/* Compare Checkbox */}
      <div className="absolute top-3 right-3">
        <input
          type="checkbox"
          checked={isSelectedForCompare}
          onChange={() => onCompareToggle(manufacturer.id)}
          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </div>

      {/* Bookmark Button */}
      <button
        onClick={() => onBookmark(manufacturer.id)}
        className="absolute top-3 left-3 p-1.5 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white"
      >
        {manufacturer.isBookmarked ? (
          <BookmarkCheck className="h-5 w-5 text-blue-600" />
        ) : (
          <Bookmark className="h-5 w-5 text-gray-400 hover:text-blue-600" />
        )}
      </button>

      <div className={isGrid ? "space-y-3" : "flex gap-4"}>
        {/* Logo/Avatar */}
        <div className={isGrid ? "" : "flex-shrink-0"}>
          <div
            className={`relative ${
              isGrid ? "h-16 w-16" : "h-20 w-20"
            } bg-gray-100 rounded-lg overflow-hidden`}
          >
            {manufacturer.avatar ? (
              <Image
                src={manufacturer.avatar}
                alt={manufacturer.company}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Factory className="h-8 w-8 text-gray-400" />
              </div>
            )}
            {manufacturer.verified && (
              <div className="absolute -top-1 -right-1">
                <div className="bg-green-500 text-white p-0.5 rounded-full">
                  <CheckCircle className="h-3 w-3" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className={isGrid ? "" : "flex-1"}>
          <div className="flex items-start justify-between">
            <div>
              <Link href={`/manufacturers/${manufacturer.id}`}>
                <h3
                  className={`font-semibold text-gray-900 hover:text-blue-600 ${
                    isGrid ? "text-base" : "text-lg"
                  }`}
                >
                  {manufacturer.company}
                </h3>
              </Link>
              <p className="text-gray-500 text-sm mt-1">{manufacturer.name}</p>
            </div>

            {/* Match Score */}
            <div className="text-right">
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                <BarChart className="h-3 w-3" />
                <span className="font-medium">{manufacturer.matchScore}%</span>
              </div>
            </div>
          </div>

          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
            {manufacturer.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {manufacturer.capabilities?.slice(0, 3).map((capability, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs"
              >
                {capability}
              </span>
            ))}
            {manufacturer.capabilities &&
              manufacturer.capabilities.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                  +{manufacturer.capabilities.length - 3} more
                </span>
              )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {manufacturer.locations?.[0] || "Global"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {manufacturer.productionCapacity?.toLocaleString() || "N/A"}{" "}
                units
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                Min: {manufacturer.minOrderQuantity?.toLocaleString() || "N/A"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {manufacturer.rating || "N/A"} rating
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t">
            <Link
              href={`/manufacturers/${manufacturer.id}`}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Profile
            </Link>

            <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
              Send Inquiry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
