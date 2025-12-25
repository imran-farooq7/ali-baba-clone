// components/proposals/ProposalList.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  FileText,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface Proposal {
  id: string;
  price: number;
  timelineDays: number;
  message: string;
  status:
    | "DRAFT"
    | "SUBMITTED"
    | "PENDING_REVIEW"
    | "COUNTERED"
    | "ACCEPTED"
    | "REJECTED"
    | "WITHDRAWN";
  submittedAt: string;
  manufacturer: {
    id: string;
    company: string;
    name: string;
    verified: boolean;
    capabilities: string[];
  };
  brief: {
    id: string;
    title: string;
    budget: number;
  };
  counterPrice?: number;
  counterTimeline?: number;
}

interface ProposalListProps {
  brandId: string;
  briefId?: string;
}

export default function ProposalList({ brandId, briefId }: ProposalListProps) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [filteredProposals, setFilteredProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "newest" | "price-low" | "price-high" | "timeline"
  >("newest");

  // Fetch proposals
  useEffect(() => {
    const fetchProposals = async () => {
      setLoading(true);
      try {
        const url = briefId
          ? `/api/proposals?briefId=${briefId}`
          : `/api/proposals?brandId=${brandId}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
          setProposals(data.data);
          setFilteredProposals(data.data);
        }
      } catch (error) {
        console.error("Error fetching proposals:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProposals();
  }, [brandId, briefId]);

  // Filter and sort proposals
  useEffect(() => {
    let result = [...proposals];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (proposal) =>
          proposal.manufacturer.company.toLowerCase().includes(query) ||
          proposal.brief.title.toLowerCase().includes(query) ||
          proposal.message.toLowerCase().includes(query) ||
          proposal.manufacturer.capabilities.some((cap) =>
            cap.toLowerCase().includes(query)
          )
      );
    }

    // Apply status filter
    if (selectedStatus !== "all") {
      result = result.filter((proposal) => proposal.status === selectedStatus);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.submittedAt).getTime() -
            new Date(a.submittedAt).getTime()
          );
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "timeline":
          return a.timelineDays - b.timelineDays;
        default:
          return 0;
      }
    });

    setFilteredProposals(result);
  }, [proposals, searchQuery, selectedStatus, sortBy]);

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
      case "ACCEPTED":
        return {
          color: "bg-green-100 text-green-800",
          icon: CheckCircle,
          label: "Accepted",
        };
      case "SUBMITTED":
      case "PENDING_REVIEW":
        return {
          color: "bg-blue-100 text-blue-800",
          icon: Clock,
          label: "Under Review",
        };
      case "COUNTERED":
        return {
          color: "bg-yellow-100 text-yellow-800",
          icon: AlertCircle,
          label: "Countered",
        };
      case "REJECTED":
        return {
          color: "bg-red-100 text-red-800",
          icon: XCircle,
          label: "Rejected",
        };
      case "WITHDRAWN":
        return {
          color: "bg-gray-100 text-gray-800",
          icon: XCircle,
          label: "Withdrawn",
        };
      case "DRAFT":
        return {
          color: "bg-gray-100 text-gray-800",
          icon: FileText,
          label: "Draft",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          icon: Clock,
          label: status,
        };
    }
  };

  // Calculate price difference percentage
  const calculatePriceDiff = (proposalPrice: number, briefBudget: number) => {
    return ((proposalPrice - briefBudget) / briefBudget) * 100;
  };

  // Handle proposal action
  const handleProposalAction = async (
    proposalId: string,
    action: "accept" | "reject" | "counter"
  ) => {
    try {
      const response = await fetch(`/api/proposals/${proposalId}/${action}`, {
        method: "POST",
      });

      if (response.ok) {
        // Refresh proposals
        window.location.reload();
      }
    } catch (error) {
      console.error(`Error ${action}ing proposal:`, error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Proposals</h2>
            <p className="text-sm text-gray-500">
              {proposals.length} total •{" "}
              {proposals.filter((p) => p.status === "SUBMITTED").length} new
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Avg. Price</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(
                  proposals.reduce((acc, p) => acc + p.price, 0) /
                    (proposals.length || 1)
                )}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Response Rate</p>
              <p className="text-lg font-semibold text-gray-900">
                {proposals.length > 0
                  ? Math.round(
                      (proposals.filter((p) => p.status !== "DRAFT").length /
                        proposals.length) *
                        100
                    )
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Search proposals by manufacturer, brief, or capability..."
                />
              </div>
            </div>

            {/* Filter buttons */}
            <div className="flex gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Status</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="PENDING_REVIEW">Under Review</option>
                <option value="COUNTERED">Countered</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="timeline">Timeline: Shortest</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Proposals list */}
      {filteredProposals.length === 0 ? (
        <div className="p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            No proposals found
          </h3>
          <p className="text-gray-500 mt-2">
            {proposals.length === 0
              ? "No proposals have been submitted yet."
              : "No proposals match your current filters."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {filteredProposals.map((proposal) => {
            const statusConfig = getStatusConfig(proposal.status);
            const StatusIcon = statusConfig.icon;
            const priceDiff = calculatePriceDiff(
              proposal.price,
              proposal.brief.budget
            );
            const isCountered = proposal.status === "COUNTERED";

            return (
              <div
                key={proposal.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left side - Proposal info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-gray-900">
                            <Link
                              href={`/brand/proposals/${proposal.id}`}
                              className="hover:text-green-600"
                            >
                              {proposal.manufacturer.company}
                            </Link>
                          </h3>
                          {proposal.manufacturer.verified && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              <CheckCircle className="h-3 w-3" />
                              Verified
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mt-1">
                          For: {proposal.brief.title}
                        </p>
                      </div>

                      <div className="hidden lg:flex items-center gap-4">
                        {/* Quick actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleProposalAction(proposal.id, "accept")
                            }
                            disabled={
                              proposal.status !== "SUBMITTED" &&
                              proposal.status !== "COUNTERED"
                            }
                            className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200 disabled:opacity-50"
                            title="Accept Proposal"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() =>
                              handleProposalAction(proposal.id, "counter")
                            }
                            disabled={proposal.status !== "SUBMITTED"}
                            className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 disabled:opacity-50"
                            title="Send Counter Offer"
                          >
                            Counter
                          </button>
                          <button
                            onClick={() =>
                              handleProposalAction(proposal.id, "reject")
                            }
                            disabled={
                              proposal.status === "ACCEPTED" ||
                              proposal.status === "REJECTED"
                            }
                            className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200 disabled:opacity-50"
                            title="Reject Proposal"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Proposal details */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Price */}
                      <div className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">
                              Proposed Price
                            </p>
                            <p className="text-lg font-semibold text-gray-900">
                              {formatCurrency(proposal.price)}
                            </p>
                          </div>
                          <div
                            className={`flex items-center ${
                              priceDiff > 0 ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            {priceDiff > 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            <span className="text-sm ml-1">
                              {Math.abs(priceDiff).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Brief budget: {formatCurrency(proposal.brief.budget)}
                        </p>

                        {/* Counter price */}
                        {isCountered && proposal.counterPrice && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-600">
                              Your Counter:
                            </p>
                            <p className="text-sm font-medium text-yellow-700">
                              {formatCurrency(proposal.counterPrice)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Timeline */}
                      <div className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Timeline</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {proposal.timelineDays} days
                            </p>
                          </div>
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        {isCountered && proposal.counterTimeline && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-600">
                              Your Counter:
                            </p>
                            <p className="text-sm font-medium text-yellow-700">
                              {proposal.counterTimeline} days
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Manufacturer info */}
                      <div className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">
                              Manufacturer
                            </p>
                            <p className="font-medium text-gray-900">
                              {proposal.manufacturer.name}
                            </p>
                          </div>
                          <Users className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {proposal.manufacturer.capabilities
                              .slice(0, 3)
                              .map((cap, index) => (
                                <span
                                  key={index}
                                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                                >
                                  {cap}
                                </span>
                              ))}
                            {proposal.manufacturer.capabilities.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{proposal.manufacturer.capabilities.length - 3}{" "}
                                more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Message preview */}
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {proposal.message}
                      </p>
                    </div>

                    {/* Timestamp */}
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      Submitted{" "}
                      {formatDistanceToNow(new Date(proposal.submittedAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>

                  {/* Right side - Actions (mobile/tablet) */}
                  <div className="lg:hidden">
                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/brand/proposals/${proposal.id}`}
                        className="px-4 py-2 bg-gray-100 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-200 text-center"
                      >
                        View Details
                      </Link>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() =>
                            handleProposalAction(proposal.id, "accept")
                          }
                          disabled={
                            proposal.status !== "SUBMITTED" &&
                            proposal.status !== "COUNTERED"
                          }
                          className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 disabled:opacity-50"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            handleProposalAction(proposal.id, "counter")
                          }
                          disabled={proposal.status !== "SUBMITTED"}
                          className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 disabled:opacity-50"
                        >
                          Counter
                        </button>
                        <button
                          onClick={() =>
                            handleProposalAction(proposal.id, "reject")
                          }
                          disabled={
                            proposal.status === "ACCEPTED" ||
                            proposal.status === "REJECTED"
                          }
                          className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                      <Link
                        href={`/brand/chat/${proposal.manufacturer.id}`}
                        className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 text-center flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Message
                      </Link>
                    </div>
                  </div>

                  {/* Right side - Actions (desktop) */}
                  <div className="hidden lg:flex flex-col items-end gap-3">
                    <Link
                      href={`/brand/proposals/${proposal.id}`}
                      className="inline-flex items-center text-sm text-green-600 hover:text-green-800"
                    >
                      View Full Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                    <Link
                      href={`/brand/chat/${proposal.manufacturer.id}`}
                      className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 flex items-center gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Start Chat
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
