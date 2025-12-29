// components/briefs/ProposalsSection.tsx
import { Brief, Proposal } from "@/lib/generated/prisma/client";
import { MessageSquare, Eye, CheckCircle, Clock, XCircle } from "lucide-react";
import Link from "next/link";

interface ProposalsSectionProps {
  brief: Brief;
  proposals: Array<
    Proposal & {
      manufacturer: {
        id: string;
        name: string;
        company: string | null;
        avatar: string | null;
        verified: boolean;
      };
    }
  >;
}

export default function ProposalsSection({
  brief,
  proposals,
}: ProposalsSectionProps) {
  if (proposals.length === 0) {
    return (
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Proposals</h2>
        <div className="text-center py-8">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No proposals yet
          </h3>
          <p className="text-gray-500 mb-4">
            Manufacturers will submit proposals to your brief once it's
            published.
          </p>
          {brief.status === "DRAFT" && (
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Publish Brief
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Proposals ({proposals.length})
        </h2>
        <Link
          href={`/briefs/${brief.id}/proposals`}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          View all proposals
        </Link>
      </div>

      <div className="space-y-4">
        {proposals.slice(0, 3).map((proposal) => (
          <Link
            key={proposal.id}
            href={`/proposals/${proposal.id}`}
            className="block p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  {proposal.manufacturer.avatar ? (
                    <img
                      src={proposal.manufacturer.avatar}
                      alt={proposal.manufacturer.name}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <span className="text-gray-600 font-semibold">
                      {proposal.manufacturer.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">
                      {proposal.manufacturer.company}
                    </h3>
                    {proposal.manufacturer.verified && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {proposal.manufacturer.name}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  {proposal.status === "ACCEPTED" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : proposal.status === "REJECTED" ? (
                    <XCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    ${proposal.price.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {proposal.status.replace("_", " ")}
                </p>
              </div>
            </div>

            {proposal.message && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {proposal.message}
                </p>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
