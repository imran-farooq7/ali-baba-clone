// app/manufacturer/proposals/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Eye,
  MessageSquare,
  FileText,
  RefreshCw,
  Calendar,
  Package,
  Building,
} from "lucide-react";

interface Proposal {
  id: string;
  title: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "UNDER_REVIEW" | "NEGOTIATING";
  price: number;
  submittedAt: string;
  updatedAt: string;
  deadline?: string;
  brand: {
    id: string;
    name: string;
    company: string;
    avatar?: string;
  };
  brief: {
    id: string;
    title: string;
    quantity: number;
    category: string;
  };
  unreadMessages: number;
  isArchived: boolean;
}

export default function ManufacturerProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("updated");

  // Fetch proposals on mount
  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call - replace with your actual API endpoint
      const response = await fetch("/api/proposals", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch proposals");
      }

      const data = await response.json();
      setProposals(data.proposals || []);
    } catch (err) {
      console.error("Error fetching proposals:", err);
      setError("Failed to load proposals. Please try again.");

      // Fallback mock data for demo
    } finally {
      setLoading(false);
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      case "UNDER_REVIEW":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "NEGOTIATING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PENDING":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <CheckCircle className="h-4 w-4" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4" />;
      case "UNDER_REVIEW":
        return <Clock className="h-4 w-4" />;
      case "NEGOTIATING":
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Filter and sort proposals
  const filteredProposals = proposals
    .filter((proposal) => {
      if (!proposal.isArchived === false) return false; // Show non-archived only

      const matchesSearch =
        search === "" ||
        proposal.title.toLowerCase().includes(search.toLowerCase()) ||
        proposal.brand.company.toLowerCase().includes(search.toLowerCase()) ||
        proposal.brief.title.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || proposal.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price":
          return b.price - a.price;
        case "date":
          return (
            new Date(b.submittedAt).getTime() -
            new Date(a.submittedAt).getTime()
          );
        default: // "updated"
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
      }
    });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Proposals
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your manufacturing proposals and quotes
              </p>
            </div>
            <button
              onClick={fetchProposals}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Proposals</p>
                <p className="text-2xl font-bold text-gray-900">
                  {proposals.length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    proposals.filter(
                      (p) =>
                        p.status === "UNDER_REVIEW" ||
                        p.status === "NEGOTIATING"
                    ).length
                  }
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-gray-900">
                  {proposals.filter((p) => p.status === "ACCEPTED").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    proposals.reduce((sum, p) => sum + p.price, 0)
                  )}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search proposals, brands, or briefs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="NEGOTIATING">Negotiating</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="updated">Recently Updated</option>
                <option value="date">Submission Date</option>
                <option value="price">Highest Price</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-700">{error}</p>
              <button
                onClick={fetchProposals}
                className="ml-auto text-sm text-red-600 hover:text-red-800"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProposals.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No proposals found
            </h3>
            <p className="text-gray-600">
              {search || statusFilter !== "ALL"
                ? "Try adjusting your filters"
                : "You haven't submitted any proposals yet"}
            </p>
          </div>
        )}

        {/* Proposals List */}
        {!loading && filteredProposals.length > 0 && (
          <div className="space-y-4">
            {filteredProposals.map((proposal) => (
              <div
                key={proposal.id}
                className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Left: Brand Info */}
                    <div className="flex items-start gap-3 flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border">
                        <img
                          src={
                            proposal.brand.avatar ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${proposal.brand.company}`
                          }
                          alt={proposal.brand.company}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {proposal.brand.company}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {proposal.brand.name}
                        </p>
                      </div>
                    </div>

                    {/* Middle: Proposal Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-lg font-semibold text-gray-900">
                          {proposal.title}
                        </h2>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                            proposal.status
                          )}`}
                        >
                          {getStatusIcon(proposal.status)}
                          {proposal.status.replace("_", " ")}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-4">
                        For: {proposal.brief.title} • {proposal.brief.quantity}{" "}
                        units
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Submitted {formatDate(proposal.submittedAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {proposal.brief.category}
                        </div>
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {proposal.brief.quantity} units
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions & Price */}
                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(proposal.price)}
                        </p>
                        <p className="text-sm text-gray-600">Proposal Value</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            window.open(
                              `/manufacturer/proposals/${proposal.id}`,
                              "_blank"
                            )
                          }
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                        <button
                          onClick={() =>
                            window.open(
                              `/chat?proposalId=${proposal.id}`,
                              "_blank"
                            )
                          }
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Chat
                          {proposal.unreadMessages > 0 && (
                            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                              {proposal.unreadMessages}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
