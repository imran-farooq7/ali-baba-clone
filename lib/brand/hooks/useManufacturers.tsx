// hooks/useManufacturers.ts
"use client";

import { Manufacturer } from "@/lib/types";
import { useState, useEffect, useCallback } from "react";

interface UseManufacturersReturn {
  manufacturers: Manufacturer[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  totalCount: number;
  matchedCount: number;
}

export function useManufacturers(
  searchQuery: string = "",
  filters: any = {}
): UseManufacturersReturn {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);

  const fetchManufacturers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build query string from filters
      const params = new URLSearchParams();

      if (searchQuery) params.append("q", searchQuery);
      if (filters.category.length > 0)
        params.append("category", filters.category.join(","));
      if (filters.location.length > 0)
        params.append("location", filters.location.join(","));
      if (filters.certification.length > 0)
        params.append("certification", filters.certification.join(","));
      if (filters.minCapacity)
        params.append("minCapacity", filters.minCapacity.toString());
      if (filters.minOrderQuantity)
        params.append("minOrderQuantity", filters.minOrderQuantity.toString());
      if (filters.verifiedOnly) params.append("verifiedOnly", "true");

      const response = await fetch(`/api/manufacturers?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch manufacturers");
      }

      const data = await response.json();

      setManufacturers(data.manufacturers || []);
      setTotalCount(data.totalCount || 0);
      setMatchedCount(data.matchedCount || 0);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setManufacturers([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filters]);

  useEffect(() => {
    // Debounce search to avoid too many requests
    const timeoutId = setTimeout(() => {
      fetchManufacturers();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [fetchManufacturers]);

  return {
    manufacturers,
    isLoading,
    error,
    refetch: fetchManufacturers,
    totalCount,
    matchedCount,
  };
}
