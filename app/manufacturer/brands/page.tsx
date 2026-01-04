// app/manufacturer/brands/page.tsx - SIMPLIFIED VERSION
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building,
  MapPin,
  Briefcase,
  DollarSign,
  CheckCircle,
  ChevronRight,
  Users,
  Calendar,
} from "lucide-react";
import { getBrands, SimpleBrand } from "@/actions/brand.actions";

export default function ManufacturerBrandsPage() {
  const [brands, setBrands] = useState<SimpleBrand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      const data = await getBrands();
      setBrands(data);
    } catch (error) {
      console.error("Error loading brands:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${Math.round(amount)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Brand Directory</h1>
              <p className="text-blue-100 mt-2">
                Browse {brands.length} brands looking for manufacturing partners
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold">{brands.length}</div>
                <div className="text-sm text-blue-200">Total Brands</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {brands.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              No brands found
            </h3>
            <p className="text-gray-500 mt-2">
              There are currently no brands registered in the system.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/manufacturer/brands/${brand.id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 overflow-hidden group"
              >
                {/* Brand Header */}
                <div className="relative h-32 bg-gradient-to-r from-blue-500 to-indigo-600">
                  <div className="w-full h-full flex items-center justify-center">
                    <Building className="h-12 w-12 text-white opacity-30" />
                  </div>

                  {/* Avatar */}
                  <div className="absolute -bottom-6 left-4">
                    <div className="relative">
                      {brand.avatar ? (
                        <img
                          src={brand.avatar}
                          alt={brand.company!}
                          className="h-12 w-12 rounded-full border-2 border-white bg-white"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center">
                          <Building className="h-6 w-6 text-blue-600" />
                        </div>
                      )}
                      {brand.verified && (
                        <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-0.5 rounded-full">
                          <CheckCircle className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Brand Info */}
                <div className="pt-8 pb-6 px-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600">
                        {brand.company}
                      </h3>
                      <p className="text-sm text-gray-600">{brand.name}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                  </div>

                  {brand.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {brand.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                        <div className="text-lg font-bold text-gray-900">
                          {brand.totalBriefs}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">Briefs</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Users className="h-4 w-4 text-green-400" />
                        <div className="text-lg font-bold text-green-600">
                          {brand.activeBriefs}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <DollarSign className="h-4 w-4 text-blue-400" />
                        <div className="text-lg font-bold text-blue-600">
                          {formatCurrency(brand.avgBriefBudget)}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">Avg Budget</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
