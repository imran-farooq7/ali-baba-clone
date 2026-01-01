import { getCurrentUser } from "@/lib/auth";
import ProposalList from "@/components/proposals/ProposalList";
import {
  Filter,
  Download,
  BarChart,
  Plus,
  MessageSquare,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

interface BrandProposalsPageProps {
  searchParams: Promise<{
    status?: string;
    briefId?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function BrandProposalsPage({
  searchParams,
}: BrandProposalsPageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;

  if (!user || user.type !== "BRAND") {
    redirect("/auth/login");
  }

  // Fetch proposals with filters
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.set("status", params.status);
  if (params.briefId) queryParams.set("briefId", params.briefId);
  if (params.page) queryParams.set("page", params.page);
  if (params.limit) queryParams.set("limit", params.limit);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/proposals?${queryParams}`,
    {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Cookie: `sb-access-token=${user.id}`, // You'll need to pass auth token
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch proposals");
  }

  const { proposals, pagination, stats, filters } = await response.json();

  // Get briefs for filter dropdown
  const briefsResponse = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/briefs?brandId=${user.id}`,
    { cache: "no-store" }
  );

  const briefs = briefsResponse.ok ? await briefsResponse.json() : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Proposals</h1>
              <p className="text-gray-600 mt-2">
                Review and manage proposals from manufacturers
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href="/brand/briefs"
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-4 w-4" />
                View Briefs
              </Link>

              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.total || 0}
                  </div>
                  <div className="text-sm text-gray-500">Total Proposals</div>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.byStatus?.UNDER_REVIEW || 0}
                  </div>
                  <div className="text-sm text-gray-500">Needs Review</div>
                </div>
                <Filter className="h-8 w-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${stats.averageValue?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-gray-500">Avg. Value</div>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.conversionRate || 0}%
                  </div>
                  <div className="text-sm text-gray-500">Acceptance Rate</div>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-xl border shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              {/* Brief Filter */}
              {briefs.length > 0 && (
                <select
                  defaultValue={params.briefId || ""}
                  onChange={(e) => {
                    const url = new URL(window.location.href);
                    if (e.target.value) {
                      url.searchParams.set("briefId", e.target.value);
                    } else {
                      url.searchParams.delete("briefId");
                    }
                    window.location.href = url.toString();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Briefs</option>
                  {briefs.map((brief: any) => (
                    <option key={brief.id} value={brief.id}>
                      {brief.title}
                    </option>
                  ))}
                </select>
              )}

              {/* Status Filter */}
              <select
                defaultValue={params.status || "all"}
                onChange={(e) => {
                  const url = new URL(window.location.href);
                  if (e.target.value !== "all") {
                    url.searchParams.set("status", e.target.value);
                  } else {
                    url.searchParams.delete("status");
                  }
                  window.location.href = url.toString();
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="NEGOTIATION">Negotiation</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
              </select>

              {/* Time Filter */}
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>This year</option>
                <option>All time</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <BarChart className="h-4 w-4" />
                Analytics
              </button>

              <Link
                href="/brand/briefs/new"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create Brief
              </Link>
            </div>
          </div>
        </div>

        {/* Proposals List */}
        <ProposalList
          proposals={proposals}
          pagination={pagination}
          stats={stats}
          filters={filters}
          userType="BRAND"
        />

        {/* Empty State */}
        {proposals.length === 0 && !params.status && !params.briefId && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No proposals yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create a brief to start receiving proposals from manufacturers
              </p>
              <Link
                href="/brand/briefs/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Create Your First Brief
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
