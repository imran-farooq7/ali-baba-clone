// components/briefs/AnalyticsSection.tsx
import { BarChart, TrendingUp, Users, DollarSign } from "lucide-react";

interface AnalyticsSectionProps {
  analytics: {
    totalProposals: number;
    acceptedProposals: number;
    pendingProposals: number;
    averagePrice: number;
    daysSincePublished: string | null;
  };
}

export default function AnalyticsSection({ analytics }: AnalyticsSectionProps) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-blue-700">Total Proposals</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {analytics.totalProposals}
            </p>
          </div>

          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-700">Accepted</p>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {analytics.acceptedProposals}
            </p>
          </div>
        </div>

        <div className="p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-purple-600" />
            <p className="text-sm text-purple-700">Average Proposal Price</p>
          </div>
          <p className="text-2xl font-bold text-purple-900">
            $
            {analytics.averagePrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        {analytics.daysSincePublished && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <BarChart className="h-4 w-4 text-gray-600" />
              <p className="text-sm text-gray-700">Published</p>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {analytics.daysSincePublished}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
