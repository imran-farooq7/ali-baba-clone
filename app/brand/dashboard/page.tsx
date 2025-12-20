// app/(brand)/dashboard/page.tsx - COMPLETE
import { getBriefsByBrand } from "@/db/client";
import BriefCreationForm from "@/components/brand/BriefCreationForm";
import BriefList from "@/components/brand/BriefList";
import StatsCard from "@/components/dashboard/StatsCard";
import { createClient } from "@/lib/supabase/server";

export default async function BrandDashboard() {
  const supabase = await createClient();
  const user = (await supabase.auth.getUser()).data.user!;
  const briefs = await getBriefsByBrand(user.id);

  const stats = {
    totalBriefs: briefs.length,
    activeBriefs: briefs.filter((b) => b.status === "published").length,
    completed: briefs.filter((b) => b.status === "completed").length,
    pendingProposals: briefs.reduce(
      (acc, b) =>
        acc + b.proposals.filter((p) => p.status === "pending").length,
      0
    ),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.name}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Total Briefs" value={stats.totalBriefs} />
          <StatsCard title="Active Briefs" value={stats.activeBriefs} />
          <StatsCard title="Completed" value={stats.completed} />
          <StatsCard title="Pending Proposals" value={stats.pendingProposals} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Brief Creation */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Create New Brief</h2>
              <BriefCreationForm userId={user.id} />
            </div>

            {/* Brief List */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Your Briefs</h2>
              </div>
              <BriefList briefs={briefs} />
            </div>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full btn-primary">
                  View Manufacturers
                </button>
                <button className="w-full btn-secondary">Check Messages</button>
                <button className="w-full btn-outline">View Proposals</button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {briefs.slice(0, 3).map((brief) => (
                  <div
                    key={brief.id}
                    className="border-l-4 border-blue-500 pl-4 py-2"
                  >
                    <p className="text-sm font-medium">{brief.title}</p>
                    <p className="text-xs text-gray-500">
                      Status: {brief.status}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
