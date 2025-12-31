import { getCurrentUser } from "@/lib/auth";
import ManufacturerDashboardLayout from "@/components/manufacturer/ManufacturerDashboardLayout";
import CertificationUpload from "@/components/manufacturer/CertificationUpload";
import CapabilitySetupForm from "@/components/manufacturer/CapabilitySetupForm";
import ManufacturerProfileView from "@/components/manufacturer/ManufacturerProfileView";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  BarChart,
  TrendingUp,
  Users,
  Package,
  Globe,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ManufacturerProfilePage() {
  const user = await getCurrentUser();

  if (!user || user.type !== "MANUFACTURER") {
    redirect("/auth/login");
  }

  // Fetch complete manufacturer data from new API
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/manufacturers/${user.id}`,
    {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch manufacturer data");
  }

  const manufacturerData = await response.json();

  return (
    <div className="space-y-8">
      {/* Header with stats */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {manufacturerData.company || manufacturerData.name}
            </h1>
            <p className="text-gray-600 mt-2">
              Complete your manufacturer profile to get verified and attract
              more brands
              {!manufacturerData.verified && (
                <span className="ml-2 inline-flex items-center gap-1 text-yellow-600">
                  <AlertCircle className="h-4 w-4" />
                  Verification pending
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href={`/manufacturer/profile/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Edit Profile
            </Link>
            <Link
              href={`/brand/manufacturers/${user.id}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Eye className="h-4 w-4" />
              View Public Profile
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {manufacturerData.stats?.acceptanceRate || 0}%
            </div>
            <div className="text-sm text-gray-500">Acceptance Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {manufacturerData.stats?.totalProposals || 0}
            </div>
            <div className="text-sm text-gray-500">Total Proposals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {manufacturerData.stats?.totalBriefs || 0}
            </div>
            <div className="text-sm text-gray-500">Briefs Received</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {manufacturerData.stats?.bookmarks || 0}
            </div>
            <div className="text-sm text-gray-500">Bookmarks</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main profile view */}
        <div className="lg:col-span-2 space-y-6">
          <ManufacturerProfileView
            manufacturer={manufacturerData}
            viewType="OWNER"
          />

          {/* Capabilities Setup */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Update Capabilities
            </h2>
            <CapabilitySetupForm manufacturerId={user.id} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-4">
              Profile Completion
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Basic Information</span>
                  <span className="text-green-600">
                    {
                      [
                        manufacturerData.company,
                        manufacturerData.description,
                        manufacturerData.website,
                      ].filter(Boolean).length
                    }
                    /3
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        ([
                          manufacturerData.company,
                          manufacturerData.description,
                          manufacturerData.website,
                        ].filter(Boolean).length /
                          3) *
                          100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Capabilities</span>
                  <span className="text-green-600">
                    {manufacturerData.capabilities?.length || 0} added
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        ((manufacturerData.capabilities?.length || 0) / 5) * 100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Certifications</span>
                  <span className="text-green-600">
                    {manufacturerData.certifications?.length || 0} added
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        ((manufacturerData.certifications?.length || 0) / 3) *
                          100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Benefits of Complete Profile
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Higher search ranking for brands</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Verified badge on your profile</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>AI-powered matching with briefs</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Quick file upload */}
          <CertificationUpload manufacturerId={user.id} />

          {/* Recent Activity Preview */}
          {manufacturerData.privateStats?.recentActivity && (
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h3 className="font-medium text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {manufacturerData.privateStats.recentActivity.proposals
                  .slice(0, 3)
                  .map((proposal: any) => (
                    <div key={proposal.id} className="text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">
                          {proposal.brief?.title}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            proposal.status === "ACCEPTED"
                              ? "bg-green-100 text-green-800"
                              : proposal.status === "UNDER_REVIEW"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {proposal.status}
                        </span>
                      </div>
                      <div className="text-gray-500 mt-1">
                        {new Date(proposal.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                <Link
                  href="/manufacturer/proposals"
                  className="block text-center text-sm text-blue-600 hover:text-blue-800 mt-4"
                >
                  View all proposals →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
