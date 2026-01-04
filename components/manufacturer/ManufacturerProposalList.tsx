// components/manufacturer/ManufacturerProposalList.tsx
"use client";

import { useState } from "react";
import {
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import ChatButton from "../chat/ui/Chat-button";
import { BriefStatus, ProposalStatus } from "@/lib/generated/prisma/enums";

interface Proposal {
  id: string;
  message: string;
  price: number;
  status: ProposalStatus;
  createdAt: Date;
  brief: {
    id: string;
    title: string;
    budget: number;
    status: BriefStatus;
    brand: {
      name: string;
      company: string | null;
      id: string;
    };
  };
}

interface ManufacturerProposalListProps {
  proposals: Proposal[];
}

export default function ManufacturerProposalList({
  proposals,
}: ManufacturerProposalListProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Filter proposals
  const filteredProposals = proposals.filter(
    (proposal) => selectedStatus === "all" || proposal.status === selectedStatus
  );

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get status config
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "accepted":
        return { color: "bg-green-100 text-green-800", icon: CheckCircle };
      case "pending":
      case "submitted":
        return { color: "bg-blue-100 text-blue-800", icon: Clock };
      case "countered":
        return { color: "bg-yellow-100 text-yellow-800", icon: AlertCircle };
      case "rejected":
        return { color: "bg-red-100 text-red-800", icon: XCircle };
      case "withdrawn":
        return { color: "bg-gray-100 text-gray-800", icon: XCircle };
      default:
        return { color: "bg-gray-100 text-gray-800", icon: Clock };
    }
  };

  // Handle withdraw proposal
  const handleWithdrawProposal = async (proposalId: string) => {
    if (!confirm("Are you sure you want to withdraw this proposal?")) return;

    try {
      const response = await fetch(`/api/proposals/${proposalId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "withdrawn" }),
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error withdrawing proposal:", error);
      alert("Failed to withdraw proposal");
    }
  };

  // Calculate proposal success rate
  const successRate =
    proposals.length > 0
      ? (proposals.filter((p) => p.status === "ACCEPTED").length /
          proposals.length) *
        100
      : 0;

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              My Proposals
            </h2>
            <p className="text-sm text-gray-500">
              {proposals.length} total proposals • {successRate.toFixed(1)}%
              success rate
            </p>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
              <option value="countered">Countered</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Proposals list */}
      {filteredProposals.length === 0 ? (
        <div className="p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-sm font-medium text-gray-900">
            No proposals found
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {selectedStatus !== "all"
              ? "No proposals with this status"
              : "Submit your first proposal to get started"}
          </p>
          <div className="mt-6">
            <Link
              href="/manufacturer/briefs"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Browse Available Briefs
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brief / Brand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Your Proposal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px 6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProposals.map((proposal) => {
                const statusConfig = getStatusConfig(proposal.status);
                const StatusIcon = statusConfig.icon;
                const isPriceHigher = proposal.price > proposal.brief.budget;

                return (
                  <tr key={proposal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          <Link
                            href={`/manufacturer/briefs/${proposal.brief.id}`}
                            className="hover:text-green-600"
                          >
                            {proposal.brief.title}
                          </Link>
                        </div>
                        <div className="text-sm text-gray-500">
                          {proposal.brief.brand.company}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Brief budget: {formatCurrency(proposal.brief.budget)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(proposal.price)}
                        </div>
                        {isPriceHigher ? (
                          <TrendingUp
                            className="h-4 w-4 text-red-500"
                            values="Above brief budget"
                          />
                        ) : (
                          <TrendingDown
                            className="h-4 w-4 text-green-500"
                            values="Within brief budget"
                          />
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {proposal.message}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {proposal.status.charAt(0).toUpperCase() +
                          proposal.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDistanceToNow(new Date(proposal.createdAt), {
                        addSuffix: true,
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <Link
                          href={`/manufacturer/proposals/${proposal.id}`}
                          className="text-green-600 hover:text-green-900"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {proposal.status === "UNDER_REVIEW" && (
                          <>
                            <Link
                              href={`/manufacturer/proposals/${proposal.id}/edit`}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() =>
                                handleWithdrawProposal(proposal.id)
                              }
                              className="text-red-600 hover:text-red-900"
                              title="Withdraw"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <ChatButton />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
