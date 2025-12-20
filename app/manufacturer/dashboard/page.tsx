// app/(manufacturer)/dashboard/page.tsx
import { getCurrentUser } from "@/lib/auth";
import ManufacturerDashboardLayout from "@/components/manufacturer/ManufacturerDashboardLayout";
import ManufacturerBriefList from "@/components/manufacturer/ManufacturerBriefList";
import {
  Briefcase,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Factory,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/db/client";
import ManufacturerStatsCard from "@/components/manufacturer/ManufacturerStatsCard";
import ManufacturerProposalList from "@/components/manufacturer/ManufacturerProposalList";

export default async function ManufacturerDashboardPage() {
  const user = await getCurrentUser();

  if (!user || user.type !== "manufacturer") {
    redirect("/auth/login");
  }

  // Fetch manufacturer data
  const [briefs, proposals, manufacturer] = await Promise.all([
    // Get available briefs
    prisma.brief.findMany({
      where: {
        status: "PUBLISHED",
        brand: {
          company: {
            not: null,
          },
        },
        // Add location/category matching logic here
      },
      include: {
        brand: {
          select: { name: true, company: true, id: true },
        },
        proposals: {
          where: { manufacturerId: user.id },
          select: { id: true, status: true },
        },
        _count: {
          select: { proposals: true },
        },
      },
      take: 6,
      orderBy: { createdAt: "desc" },
    }),

    // Get manufacturer's proposals
    prisma.proposal.findMany({
      where: { manufacturerId: user.id },
      include: {
        brief: {
          include: {
            brand: {
              select: { name: true, company: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),

    // Get manufacturer profile
    prisma.user.findUnique({
      where: { id: user.id },
    }),
  ]);

  // Calculate stats
  const stats = {
    totalProposals: proposals.length,
    acceptedProposals: proposals.filter((p) => p.status === "ACCEPTED").length,
    pendingProposals: proposals.filter(
      (p) => p.status === "PENDING" || p.status === "SUBMITTED"
    ).length,
    successRate:
      proposals.length > 0
        ? Math.round(
            (proposals.filter((p) => p.status === "ACCEPTED").length /
              proposals.length) *
              100
          )
        : 0,
    availableBriefs: briefs.length,
    estimatedRevenue: proposals
      .filter((p) => p.status === "ACCEPTED")
      .reduce((acc, p) => acc + p.price, 0),
  };

  return (
    <ManufacturerDashboardLayout user={user}>
      {/* Welcome section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Manufacturer Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, {user.name}!{" "}
              {!user.verified && "Complete your profile to get verified."}
            </p>
          </div>
          {!user.verified && (
            <Link
              href="/manufacturer/profile"
              className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-md hover:bg-yellow-200"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Complete Verification
            </Link>
          )}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <ManufacturerStatsCard
          title="Total Proposals"
          value={stats.totalProposals}
          icon={Briefcase}
          color="blue"
          subtitle="All time"
          onClick={() => (window.location.href = "/manufacturer/proposals")}
        />

        <ManufacturerStatsCard
          title="Success Rate"
          value={`${stats.successRate}%`}
          icon={TrendingUp}
          color={stats.successRate > 50 ? "green" : "orange"}
          subtitle="Proposals accepted"
        />

        <ManufacturerStatsCard
          title="Estimated Revenue"
          value={`$${(stats.estimatedRevenue / 1000).toFixed(0)}k`}
          icon={DollarSign}
          color="purple"
          subtitle="From accepted proposals"
        />

        <ManufacturerStatsCard
          title="Available Briefs"
          value={stats.availableBriefs}
          icon={Factory}
          color="green"
          subtitle="Matching your profile"
          onClick={() => (window.location.href = "/manufacturer/briefs")}
        />
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/manufacturer/briefs"
            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Browse Briefs</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Find new opportunities
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-green-600" />
            </div>
          </Link>

          <Link
            href="/manufacturer/profile"
            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Update Profile</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Add capabilities & certifications
                </p>
              </div>
              <Factory className="h-8 w-8 text-blue-600" />
            </div>
          </Link>

          <Link
            href="/manufacturer/proposals"
            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Track Proposals</h3>
                <p className="text-sm text-gray-500 mt-1">
                  View your submissions
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </Link>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column - Available briefs */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recommended Briefs
            </h2>
            <Link
              href="/manufacturer/briefs"
              className="text-sm text-green-600 hover:text-green-800"
            >
              View all →
            </Link>
          </div>
          <ManufacturerBriefList briefs={briefs} manufacturerId={user.id} />
        </div>

        {/* Right column - Recent proposals */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Proposals
            </h2>
            <Link
              href="/manufacturer/proposals"
              className="text-sm text-green-600 hover:text-green-800"
            >
              View all →
            </Link>
          </div>
          <ManufacturerProposalList proposals={proposals.slice(0, 5)} />
        </div>
      </div>
    </ManufacturerDashboardLayout>
  );
}
