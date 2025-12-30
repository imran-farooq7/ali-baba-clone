// components/manufacturers/ManufacturerGrid.tsx
"use client";

import { Manufacturer } from "@/lib/types";
import ManufacturerCard from "./ManufacturerCard";

interface ManufacturerGridProps {
  manufacturers: Manufacturer[];
  viewMode: "grid" | "list";
  onBookmark: (id: string) => void;
  onCompareToggle: (id: string) => void;
  selectedForCompare: string[];
}

export default function ManufacturerGrid({
  manufacturers,
  viewMode,
  onBookmark,
  onCompareToggle,
  selectedForCompare,
}: ManufacturerGridProps) {
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {manufacturers.map((manufacturer) => (
          <ManufacturerCard
            key={manufacturer.id}
            manufacturer={manufacturer}
            viewMode={viewMode}
            onBookmark={onBookmark}
            onCompareToggle={onCompareToggle}
            isSelectedForCompare={selectedForCompare.includes(manufacturer.id)}
          />
        ))}
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-4">
      {manufacturers.map((manufacturer) => (
        <ManufacturerCard
          key={manufacturer.id}
          manufacturer={manufacturer}
          viewMode={viewMode}
          onBookmark={onBookmark}
          onCompareToggle={onCompareToggle}
          isSelectedForCompare={selectedForCompare.includes(manufacturer.id)}
        />
      ))}
    </div>
  );
}
