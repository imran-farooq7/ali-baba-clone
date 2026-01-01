"use client";

import {
  BarChart,
  Calendar,
  Clock,
  DollarSign,
  Download,
  Eye,
  MessageSquare,
  MoreVertical,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ProposalStatusBadge from "./ProposalStatusBadge";

interface ProposalListProps {
  proposals: any[];
  pagination: any;
  stats: any;
  filters: any;
  userType: "BRAND" | "MANUFACTURER" | "ADMIN";
}

export default function ProposalList({
  proposals,
  pagination,
  stats,
  filters,
  userType,
}: ProposalListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(filters.status);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedProposals, setSelectedProposals] = useState<string[]>([]);

  const filteredProposals = proposals.filter((proposal) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        proposal.brief?.title?.toLowerCase().includes(query) ||
        proposal.manufacturer?.company?.toLowerCase().includes(query) ||
        proposal.brand?.company?.toLowerCase().includes(query) ||
        proposal.message?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all" && proposal.status !== statusFilter) {
      return false;
    }

    return true;
  });

  // Sort proposals
  const sortedProposals = [...filteredProposals].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "price-high":
        return b.price - a.price;
      case "price-low":
        return a.price - b.price;
      case "timeline-short":
        return a.timelineDays - b.timelineDays;
      case "timeline-long":
        return b.timelineDays - a.timelineDays;
      default:
        return 0;
    }
  });

  const handleProposalSelect = (id: string) => {
    setSelectedProposals((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleBulkAction = (action: string) => {
    // Implement bulk actions (download, status change, etc.)
    console.log("Bulk action:", action, selectedProposals);
  };

  const exportToCSV = () => {
    // Implement CSV export
    console.log("Exporting proposals to CSV");
  };

  return (
    <div className="space-y-6">
      {/* Stats & Filters */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {stats.total || 0}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {stats.byStatus?.ACCEPTED || 0}
              </div>
              <div className="text-sm text-gray-600">Accepted</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {stats.byStatus?.UNDER_REVIEW || 0}
              </div>
              <div className="text-sm text-gray-600">Reviewing</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {stats.conversionRate || 0}%
              </div>
              <div className="text-sm text-gray-600">Conversion</div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search proposals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="NEGOTIATION">Negotiation</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
                <option value="COUNTERED">Countered</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
                <option value="timeline-short">Timeline: Shortest</option>
                <option value="timeline-long">Timeline: Longest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedProposals.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {selectedProposals.length} proposals selected
                </span>
                <button
                  onClick={() => setSelectedProposals([])}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction("download")}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
                <button
                  onClick={() => handleBulkAction("export")}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  <BarChart className="h-4 w-4" />
                  Export
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {sortedProposals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <div className="text-gray-400 mb-3">
              <MessageSquare className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No proposals found
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : userType === "MANUFACTURER"
                ? "Submit your first proposal to get started"
                : "No proposals have been submitted yet"}
            </p>
          </div>
        ) : (
          sortedProposals.map((proposal) => (
            <div
              key={proposal.id}
              className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow ${
                selectedProposals.includes(proposal.id)
                  ? "ring-2 ring-blue-500"
                  : ""
              }`}
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left side - Proposal info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {proposal.brief?.title || "Untitled Brief"}
                          </h3>
                          <ProposalStatusBadge status={proposal.status} />
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            {userType === "BRAND" ? (
                              <>
                                <div className="h-6 w-6 bg-gray-100 rounded-full overflow-hidden">
                                  {proposal.manufacturer?.avatar && (
                                    <img
                                      src={proposal.manufacturer.avatar}
                                      alt={proposal.manufacturer.company}
                                      className="h-full w-full object-cover"
                                    />
                                  )}
                                </div>
                                <span>{proposal.manufacturer?.company}</span>
                              </>
                            ) : (
                              <>
                                <div className="h-6 w-6 bg-gray-100 rounded-full overflow-hidden">
                                  {proposal.brand?.avatar && (
                                    <img
                                      src={proposal.brand.avatar}
                                      alt={proposal.brand.company}
                                      className="h-full w-full object-cover"
                                    />
                                  )}
                                </div>
                                <span>{proposal.brand?.company}</span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Submitted{" "}
                              {new Date(
                                proposal.submittedAt || proposal.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>

                          {proposal.reviewedAt && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>
                                Reviewed{" "}
                                {new Date(
                                  proposal.reviewedAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Checkbox for selection */}
                      <input
                        type="checkbox"
                        checked={selectedProposals.includes(proposal.id)}
                        onChange={() => handleProposalSelect(proposal.id)}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>

                    {/* Proposal message preview */}
                    <p className="text-gray-700 line-clamp-2 mb-4">
                      {proposal.message
                        ?.replace(/<[^>]*>/g, "")
                        .substring(0, 200)}
                      ...
                    </p>

                    {/* Financial info */}
                    <div className="flex flex-wrap gap-6">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          ${proposal.price.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {proposal.brief?.quantity &&
                            `(${(
                              proposal.price / proposal.brief.quantity
                            ).toFixed(2)}/unit)`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">
                          {proposal.timelineDays} days
                        </span>
                      </div>

                      {proposal.brief?.budget && (
                        <div
                          className={`text-sm ${
                            proposal.price <= proposal.brief.budget
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {proposal.price <= proposal.brief.budget
                            ? "Within"
                            : "Over"}{" "}
                          budget
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right side - Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                    <button
                      onClick={() =>
                        router.push(
                          userType === "BRAND"
                            ? `/brand/proposals/${proposal.id}`
                            : `/manufacturer/proposals/${proposal.id}`
                        )
                      }
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>

                    {proposal.conversationId ? (
                      <button
                        onClick={() =>
                          router.push(`/chat/${proposal.conversationId}`)
                        }
                        className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Open Chat
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          router.push(
                            `/chat?userId=${
                              userType === "BRAND"
                                ? proposal.manufacturerId
                                : proposal.brandId
                            }&proposalId=${proposal.id}`
                          )
                        }
                        className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Start Chat
                      </button>
                    )}

                    {/* Quick actions dropdown */}
                    <div className="relative">
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        <MoreVertical className="h-4 w-4" />
                        More
                      </button>

                      <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 hidden group-hover:block">
                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Download PDF
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Duplicate Proposal
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                          Withdraw Proposal
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Negotiation info */}
                {proposal.counterProposal && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MessageSquare className="h-4 w-4" />
                      <span>Counter offer available</span>
                      <span className="font-medium">
                        ${proposal.counterProposal.price.toLocaleString()} for{" "}
                        {proposal.counterProposal.timelineDays} days
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl border shadow-sm p-6">
          <div className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} proposals
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => router.push(`?page=${pagination.page - 1}`)}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>

            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              let pageNum;
              if (pagination.pages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.pages - 2) {
                pageNum = pagination.pages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => router.push(`?page=${pageNum}`)}
                  className={`px-4 py-2 border rounded-lg ${
                    pageNum === pagination.page
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => router.push(`?page=${pagination.page + 1}`)}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
