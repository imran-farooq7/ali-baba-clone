// hooks/useCompare.ts
"use client";

import { useState, useEffect, useCallback } from "react";

interface UseCompareReturn {
  selectedManufacturers: string[];
  toggleCompare: (manufacturerId: string) => void;
  clearCompare: () => void;
  canCompare: boolean;
  maxSelection: number;
}

const MAX_SELECTION = 4;

export function useCompare(): UseCompareReturn {
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>(
    []
  );

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("manufactura-compare-selection");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSelectedManufacturers(parsed.slice(0, MAX_SELECTION));
        }
      } catch {
        // Ignore invalid data
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (selectedManufacturers.length > 0) {
      localStorage.setItem(
        "manufactura-compare-selection",
        JSON.stringify(selectedManufacturers)
      );
    } else {
      localStorage.removeItem("manufactura-compare-selection");
    }
  }, [selectedManufacturers]);

  const toggleCompare = useCallback((manufacturerId: string) => {
    setSelectedManufacturers((prev) => {
      if (prev.includes(manufacturerId)) {
        // Remove if already selected
        return prev.filter((id) => id !== manufacturerId);
      } else {
        // Add if not at max
        if (prev.length < MAX_SELECTION) {
          return [...prev, manufacturerId];
        }
        // If at max, replace the oldest selection
        return [...prev.slice(1), manufacturerId];
      }
    });
  }, []);

  const clearCompare = useCallback(() => {
    setSelectedManufacturers([]);
  }, []);

  const canCompare =
    selectedManufacturers.length >= 2 &&
    selectedManufacturers.length <= MAX_SELECTION;

  return {
    selectedManufacturers,
    toggleCompare,
    clearCompare,
    canCompare,
    maxSelection: MAX_SELECTION,
  };
}
