// components/proposals/ProposalDetail.tsx - UPDATED FOR YOUR API
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  DollarSign,
  Calendar,
  MessageSquare,
  User,
  Building,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Package,
  Globe,
  Phone,
  Mail,
  TrendingUp,
  ArrowRight,
  Download,
  Printer,
  Share2,
  Copy,
  Send,
  RotateCcw,
} from "lucide-react";
import ProposalStatusBadge from "./ProposalStatusBadge";
import CounterOfferForm from "./CounterOfferForm";
import AcceptProposalModal from "./AcceptProposalModal";
import { format } from "date-fns";

interface Proposal {
  id: string;
  message: string;
  price: number;
  timelineDays: number;
  status:
    | "DRAFT"
    | "SUBMITTED"
    | "UNDER_REVIEW"
    | "NEGOTIATION"
    | "ACCEPTED"
    | "REJECTED"
    | "WITHDRAWN";
  terms: any;
  attachments: string[];
  submittedAt: string | null;
  createdAt: string;
  decidedAt: string | null;
  brief: {
    id: string;
    title: string;
    budget: number;
    quantity: number;
    description: string;
    brand: {
      id: string;
      name: string;
      company: string;
      avatar: string | null;
    };
  };
  manufacturer: {
    id: string;
    name: string;
    company: string;
    avatar: string | null;
    capabilities: string[];
    certifications: string[];
    description: string | null;
    location: string | null;
  };
  brand: {
    id: string;
    name: string;
    company: string;
    avatar: string | null;
  };
  counterProposal?: {
    id: string;
    price: number;
    status: string;
    createdAt: string;
  };
  counterPrice?: number;
  counterTimeline?: number;
  counterMessage?: string;
  counterTerms?: any;
}

export default function ProposalDetail() {
  const params = useParams();
  const proposalId = params.id as string;

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCounterForm, setShowCounterForm] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [userType, setUserType] = useState<"brand" | "manufacturer" | null>(
    null
  );
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchProposal();
  }, [proposalId]);

  const fetchProposal = async () => {
    try {
      const response = await fetch(`/api/proposals/${proposalId}`);
      const data = await response.json();

      if (data.success) {
        setProposal(data.data);
        // Determine user type
        const currentUser = await fetch("/api/auth/me").then((res) =>
          res.json()
        );
        if (currentUser.id === data.data.brand.id) {
          setUserType("brand");
        } else if (currentUser.id === data.data.manufacturer.id) {
          setUserType("manufacturer");
        }
      }
    } catch (error) {
      console.error("Error fetching proposal:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProposalAction = async (action: string, data?: any) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/proposals/${proposalId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: data ? JSON.stringify(data) : undefined,
      });

      const result = await response.json();

      if (response.ok) {
        if (action === "accept") {
          setShowAcceptModal(false);
        }
        if (action === "counter") {
          setShowCounterForm(false);
        }
        // Refresh proposal data
        fetchProposal();
      } else {
        alert(result.error || `Failed to ${action} proposal`);
      }
    } catch (error) {
      alert("Network error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = async (notes?: string) => {
    await handleProposalAction("accept", { notes });
  };

  const handleReject = async () => {
    if (!confirm("Are you sure you want to reject this proposal?")) return;
    await handleProposalAction("reject");
  };

  const handleWithdraw = async () => {
    if (!confirm("Are you sure you want to withdraw this proposal?")) return;
    await handleProposalAction("withdraw");
  };

  const handleSubmit = async () => {
    if (!confirm("Submit this proposal for review?")) return;
    await handleProposalAction("submit");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="text-center p-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">
          Proposal Not Found
        </h3>
        <p className="text-gray-500 mt-2">
          The requested proposal could not be found.
        </p>
      </div>
    );
  }

  const priceDiff =
    ((proposal.price - proposal.brief.budget) / proposal.brief.budget) * 100;
  const canBrandAction =
    userType === "brand" &&
    ["SUBMITTED", "UNDER_REVIEW", "NEGOTIATION"].includes(proposal.status);
  const canManufacturerAction =
    userType === "manufacturer" && proposal.status === "DRAFT";

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  Proposal Details
                </h1>
                <ProposalStatusBadge status={proposal.status} size="lg" />
              </div>
              <p className="text-gray-600 mt-1">For: {proposal.brief.title}</p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              {/* Manufacturer actions */}
              {canManufacturerAction && (
                <>
                  <button
                    onClick={handleSubmit}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Submit Proposal
                  </button>
                  <button
                    onClick={handleWithdraw}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 disabled:opacity-50"
                  >
                    Delete Draft
                  </button>
                </>
              )}

              {/* Brand actions */}
              {canBrandAction && (
                <>
                  <button
                    onClick={() => setShowCounterForm(true)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 disabled:opacity-50"
                  >
                    Counter Offer
                  </button>
                  <button
                    onClick={() => setShowAcceptModal(true)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    Accept
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </>
              )}

              {/* Withdraw action for manufacturer */}
              {userType === "manufacturer" &&
                ["SUBMITTED", "UNDER_REVIEW"].includes(proposal.status) && (
                  <button
                    onClick={handleWithdraw}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    Withdraw
                  </button>
                )}
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                Proposed Price
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(proposal.price)}
            </p>
            {proposal.counterPrice && (
              <p className="text-sm text-yellow-600 mt-1">
                Counter: {formatCurrency(proposal.counterPrice)}
              </p>
            )}
          </div>

          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                Timeline
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {proposal.timelineDays} days
            </p>
            {proposal.counterTimeline && (
              <p className="text-sm text-yellow-600 mt-1">
                Counter: {proposal.counterTimeline} days
              </p>
            )}
          </div>

          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Status</span>
            </div>
            <div className="space-y-1">
              <ProposalStatusBadge status={proposal.status} />
              {proposal.submittedAt && (
                <p className="text-sm text-gray-500">
                  {format(new Date(proposal.submittedAt), "MMM d, yyyy")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Counter offer info */}
      {proposal.counterMessage && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">
                Counter Offer Received
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                {proposal.counterMessage}
              </p>
              {proposal.counterPrice && (
                <div className="mt-2 text-sm">
                  <span className="font-medium">New Price: </span>
                  {formatCurrency(proposal.counterPrice)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Proposal content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Manufacturer message */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Manufacturer's Message
            </h2>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-line">
                {proposal.message}
              </p>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Terms & Conditions
            </h2>
            <div className="space-y-4">
              {proposal.terms && typeof proposal.terms === "object" ? (
                Object.entries(proposal.terms).map(([key, value]) => (
                  <div
                    key={key}
                    className="border-l-4 border-green-500 pl-4 py-2"
                  >
                    <h4 className="font-medium text-gray-900 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </h4>
                    <p className="text-gray-600">{String(value)}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">
                  No specific terms provided
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right column - Sidebar */}
        <div className="space-y-6">
          {/* Manufacturer info */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {proposal.manufacturer.company}
                </h3>
                <p className="text-sm text-gray-600">
                  {proposal.manufacturer.name}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {proposal.manufacturer.location && (
                <div className="flex items-center text-sm text-gray-600">
                  <Globe className="h-4 w-4 mr-2 text-gray-400" />
                  {proposal.manufacturer.location}
                </div>
              )}

              <div className="pt-3 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Capabilities
                </h4>
                <div className="flex flex-wrap gap-2">
                  {proposal.manufacturer.capabilities
                    .slice(0, 5)
                    .map((cap, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        {cap}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Brief info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Brief Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Budget:</span>
                <span className="font-medium">
                  {formatCurrency(proposal.brief.budget)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">
                  {proposal.brief.quantity.toLocaleString()} units
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Brand:</span>
                <span className="font-medium">{proposal.brand.company}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-medium">
                  {format(new Date(proposal.createdAt), "MMM d, yyyy")}
                </p>
              </div>
              {proposal.submittedAt && (
                <div>
                  <p className="text-sm text-gray-600">Submitted</p>
                  <p className="font-medium">
                    {format(new Date(proposal.submittedAt), "MMM d, yyyy")}
                  </p>
                </div>
              )}
              {proposal.decidedAt && (
                <div>
                  <p className="text-sm text-gray-600">Decision</p>
                  <p className="font-medium">
                    {format(new Date(proposal.decidedAt), "MMM d, yyyy")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Counter Offer Form Modal */}
      {showCounterForm && proposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <CounterOfferForm
            proposal={proposal}
            onSuccess={() => setShowCounterForm(false)}
            onCancel={() => setShowCounterForm(false)}
          />
        </div>
      )}

      {/* Accept Proposal Modal */}
      {showAcceptModal && proposal && (
        <AcceptProposalModal
          proposal={proposal}
          onAccept={handleAccept}
          onCancel={() => setShowAcceptModal(false)}
        />
      )}
    </div>
  );
}
