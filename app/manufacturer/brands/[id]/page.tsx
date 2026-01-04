// app/manufacturer/brands/[id]/page.tsx - SIMPLIFIED VERSION
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Building,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ExternalLink,
  Mail,
  Phone,
  Globe,
  Users,
} from "lucide-react";
import { getBrandById, SimpleBrand } from "@/actions/brand.actions";

export default function BrandDetailPage() {
  const params = useParams();
  const brandId = params.id as string;

  const [brand, setBrand] = useState<SimpleBrand | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrand();
  }, [brandId]);

  const loadBrand = async () => {
    try {
      const data = await getBrandById(brandId);
      setBrand(data);
    } catch (error) {
      console.error("Error loading brand:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Brand Not Found</h3>
          <p className="text-gray-500 mt-2">
            The requested brand could not be found.
          </p>
          <Link
            href="/manufacturer/brands"
            className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Brands
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/manufacturer/brands"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Brands
          </Link>
        </div>
      </div>

      {/* Brand Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              {brand.avatar ? (
                <img
                  src={brand.avatar}
                  alt={brand.company!}
                  className="h-24 w-24 rounded-full border-4 border-white"
                />
              ) : (
                <div className="h-24 w-24 rounded-full border-4 border-white bg-blue-100 flex items-center justify-center">
                  <Building className="h-12 w-12 text-blue-600" />
                </div>
              )}
              {brand.verified && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1 rounded-full">
                  <CheckCircle className="h-5 w-5" />
                </div>
              )}
            </div>

            {/* Brand Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{brand.company}</h1>
              <p className="text-xl text-blue-100 mt-1">{brand.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-gray-900">
              {brand.totalBriefs}
            </div>
            <div className="text-sm text-gray-600">Total Briefs</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-green-600">
              {brand.activeBriefs}
            </div>
            <div className="text-sm text-gray-600">Active Briefs</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(brand.avgBriefBudget)}
            </div>
            <div className="text-sm text-gray-600">Avg Budget</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-purple-600">
              {brand.verified ? "Verified" : "Not Verified"}
            </div>
            <div className="text-sm text-gray-600">Status</div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
          <p className="text-gray-700 whitespace-pre-line">
            {brand.description || "No description available."}
          </p>
        </div>

        {/* Contact & Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Contact</h2>
            <div className="space-y-4">
              {brand.website && (
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-gray-400" />
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    {brand.website.replace(/^https?:\/\//, "")}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
