// components/manufacturers/RecentBriefs.tsx
import Link from "next/link";
import { Briefcase, DollarSign, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";

interface Brief {
  id: string;
  title: string;
  category: string;
  budget: number;
  timelineDays: number | null;
  location?: string | null;
  createdAt: Date;
}

interface RecentBriefsProps {
  briefs: Brief[];
  manufacturerIndustries: string[];
}

export default function RecentBriefs({
  briefs,
  manufacturerIndustries,
}: RecentBriefsProps) {
  if (briefs.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Matching Briefs</h2>
        <Link
          href="/brand/briefs"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          View all
        </Link>
      </div>

      <div className="space-y-4">
        {briefs.slice(0, 3).map((brief) => {
          const matchStrength = manufacturerIndustries.includes(brief.category)
            ? "High"
            : "Medium";

          return (
            <Link
              key={brief.id}
              href={`/briefs/${brief.id}`}
              className="block p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                  {brief.title}
                </h3>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    matchStrength === "High"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {matchStrength} Match
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span>${brief.budget.toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{brief.timelineDays} days</span>
                </div>

                {brief.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{brief.location}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t text-xs text-gray-400">
                Posted {format(new Date(brief.createdAt), "MMM d")}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t">
        <Link
          href="/briefs/create"
          className="block w-full text-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          Create New Brief
        </Link>
      </div>
    </div>
  );
}
