// app/(brand)/manufacturers/[id]/page.tsx
import CapabilityCard from "@/components/brand/CapabilityCard";
import CertificationCard from "@/components/brand/CertificationCard";
import RecentBriefs from "@/components/brand/RecentBriefs";
import ReviewsSection from "@/components/brand/ReviewsSection";
import ChatButton from "@/components/chat/ui/Chat-button";
import StatsCard from "@/components/dashboard/StatsCard";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/prisma/prisma";
import { format } from "date-fns";
import {
  Award,
  BarChart,
  Bookmark,
  BookmarkCheck,
  Calendar,
  CheckCircle,
  ChevronLeft,
  Clock,
  Eye,
  Factory,
  FileText,
  Globe,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Share2,
  Shield,
  Star,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface ManufacturerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ManufacturerDetailPage({
  params,
}: ManufacturerDetailPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Verify user is a brand
  if (user.type !== "BRAND") {
    redirect("/dashboard");
  }
  const { id } = await params;

  // Fetch manufacturer with all details
  const manufacturer = await prisma.user.findUnique({
    where: {
      id: id,
      type: "MANUFACTURER",
    },
    include: {
      // Get manufacturer's proposals to show success rate
      sentProposals: {
        select: {
          id: true,
          status: true,
          price: true,
          createdAt: true,
          brief: {
            select: {
              id: true,
              title: true,
              category: true,
            },
          },
        },
      },
      // Get recent briefs in their categories
      _count: {
        select: {
          sentProposals: true,
          bookmarks: true,
        },
      },
    },
  });

  if (!manufacturer) {
    notFound();
  }

  // Calculate stats
  const stats = {
    totalProposals: manufacturer.sentProposals.length,
    acceptedProposals: manufacturer.sentProposals.filter(
      (p) => p.status === "ACCEPTED"
    ).length,
    acceptanceRate:
      manufacturer.sentProposals.length > 0
        ? Math.round(
            (manufacturer.sentProposals.filter((p) => p.status === "ACCEPTED")
              .length /
              manufacturer.sentProposals.length) *
              100
          )
        : 0,
    avgResponseTime: 24, // hours - would be calculated from actual data
    avgRating: 4.5, // would be calculated from reviews
    memberSince: format(new Date(manufacturer.createdAt), "MMM yyyy"),
  };

  // Get recent briefs matching manufacturer's categories
  const matchingBriefs = await prisma.brief.findMany({
    where: {
      category: {
        in: manufacturer.industries || [],
      },
      status: "PUBLISHED",
      brandId: {
        not: user.id, // Don't show user's own briefs
      },
    },
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      category: true,
      budget: true,
      timelineDays: true,
      location: true,
      createdAt: true,
    },
  });

  // Check if manufacturer is bookmarked
  const isBookmarked = await prisma.bookmark.findUnique({
    where: {
      userId_manufacturerId: {
        userId: user.id,
        manufacturerId: manufacturer.id,
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/brand/manufacturers"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Manufacturers
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-linear-to-b from-white to-gray-50 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Company Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                {/* Logo */}
                <div className="relative h-32 w-32 bg-white border rounded-2xl shadow-sm overflow-hidden">
                  {manufacturer.avatar ? (
                    <Image
                      src={manufacturer.avatar}
                      alt={manufacturer.company || manufacturer.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-linear-to-br from-blue-50 to-blue-100">
                      <Factory className="h-12 w-12 text-blue-600" />
                    </div>
                  )}

                  {/* Verified Badge */}
                  {manufacturer.verified && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-green-500 text-white p-1.5 rounded-full shadow-lg">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Company Details */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-gray-900">
                          {manufacturer.company || manufacturer.name}
                        </h1>
                        {manufacturer.verified && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            <CheckCircle className="h-4 w-4" />
                            Verified
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 mb-4">
                        {manufacturer.description ||
                          "Leading manufacturer with expertise in multiple industries"}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        {manufacturer.locations &&
                          manufacturer.locations.length > 0 && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{manufacturer.locations.join(", ")}</span>
                            </div>
                          )}

                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Member since {stats.memberSince}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          <span>
                            {manufacturer._count?.bookmarks || 0} bookmarks
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <ChatButton
                      // manufacturerId={manufacturer.id}
                      // participants={[manufacturer.id]}
                      // title={`Chat with ${manufacturer.company}`}
                      // className="bg-blue-600 hover:bg-blue-700 text-white"
                      />

                      <form method="POST">
                        <input
                          type="hidden"
                          name="manufacturerId"
                          value={manufacturer.id}
                        />
                        <button
                          type="submit"
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          {isBookmarked ? (
                            <>
                              <BookmarkCheck className="h-4 w-4 text-blue-600" />
                              <span>Bookmarked</span>
                            </>
                          ) : (
                            <>
                              <Bookmark className="h-4 w-4 text-gray-400" />
                              <span>Bookmark</span>
                            </>
                          )}
                        </button>
                      </form>

                      <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Share2 className="h-4 w-4 text-gray-400" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="lg:w-80 space-y-4">
              <StatsCard
                title="Acceptance Rate"
                value={`${stats.acceptanceRate}%`}
                color="blue"
              />

              <StatsCard
                title="Avg Response"
                value={`${stats.avgResponseTime}h`}
                color="green"
              />

              <StatsCard
                title="Rating"
                value={stats.avgRating.toFixed(1)}
                color="yellow"
              />

              <StatsCard
                title="Bookmarks"
                value={manufacturer._count?.bookmarks || 0}
                color="purple"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Capabilities Section */}
            {manufacturer.capabilities &&
              manufacturer.capabilities.length > 0 && (
                <div className="bg-white rounded-xl border shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Capabilities
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {manufacturer.capabilities.map((capability, index) => (
                      <CapabilityCard
                        key={index}
                        capability={capability}
                        description={
                          (
                            manufacturer.capabilityDetails as Record<
                              string,
                              any
                            >
                          )?.[capability]
                        }
                      />
                    ))}
                  </div>
                </div>
              )}

            {/* Certifications */}
            {manufacturer.certifications &&
              manufacturer.certifications.length > 0 && (
                <div className="bg-white rounded-xl border shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Certifications & Standards
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {manufacturer.certifications.map((certification, index) => (
                      <CertificationCard
                        key={index}
                        certification={certification}
                        details={
                          (
                            manufacturer.certificationDetails as Record<
                              string,
                              any
                            >
                          )?.[certification]
                        }
                      />
                    ))}
                  </div>
                </div>
              )}

            {/* Production Details */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Production Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Min Order Quantity
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {manufacturer.minOrderQuantity?.toLocaleString() ||
                          "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Max Order Quantity
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {manufacturer.maxOrderQuantity?.toLocaleString() ||
                          "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Factory className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Monthly Capacity</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {manufacturer.productionCapacity?.toLocaleString() ||
                          "N/A"}{" "}
                        units
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Industries */}
              {manufacturer.industries &&
                manufacturer.industries.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-medium text-gray-900 mb-4">
                      Industries Served
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {manufacturer.industries.map((industry, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm"
                        >
                          {industry}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Recent Projects/Reviews */}
            <ReviewsSection manufacturerId={manufacturer.id} />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Information
              </h2>
              <div className="space-y-4">
                {manufacturer.email && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded">
                      <Mail className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <a
                        href={`mailto:${manufacturer.email}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {manufacturer.email}
                      </a>
                    </div>
                  </div>
                )}

                {manufacturer.website && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded">
                      <Globe className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Website</p>
                      <a
                        href={manufacturer.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {manufacturer.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <ChatButton
                  // manufacturerId={manufacturer.id}
                  // participants={[manufacturer.id]}
                  // title={`Chat with ${manufacturer.company}`}
                  // className="w-full justify-center"
                  />
                </div>
              </div>
            </div>

            {/* Matching Briefs */}
            <RecentBriefs
              briefs={matchingBriefs}
              manufacturerIndustries={manufacturer.industries || []}
            />

            {/* Additional Actions */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link
                  href={`/briefs/create?manufacturer=${manufacturer.id}`}
                  className="block w-full text-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Brief for This Manufacturer
                </Link>

                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <FileText className="h-4 w-4" />
                  Request Quote
                </button>

                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <MessageSquare className="h-4 w-4" />
                  Schedule Call
                </button>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6">
              <h3 className="font-semibold text-blue-900 mb-3">
                Trust & Safety
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    Verified Business
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    Quality Certified
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-blue-800">Global Shipping</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
