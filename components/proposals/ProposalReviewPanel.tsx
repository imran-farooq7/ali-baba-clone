"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  MessageSquare,
  DollarSign,
  Calendar,
  FileText,
  Download,
  Clock,
  User,
  Building,
  AlertCircle,
  TrendingUp,
  BarChart,
  Shield,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import CounterOfferForm from "./CounterOfferForm";
import AcceptProposalModal from "./AcceptProposalModal";

interface ProposalReviewPanelProps {
  proposal: any;
  permissions: any;
  isManufacturerBookmarked: boolean;
  onBookmarkToggle: () => void;
}

export default function ProposalReviewPanel({
  proposal,
  permissions,
  isManufacturerBookmarked,
  onBookmarkToggle,
}: ProposalReviewPanelProps) {
  const router = useRouter();
  const [showCounterForm, setShowCounterForm] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleAction = async (action: string, data?: any) => {
    setIsProcessing(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const endpoint = `/api/proposals/${proposal.id}/${action}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: data ? JSON.stringify(data) : undefined,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${action} proposal`);
      }

      setActionSuccess(`Proposal ${action}ed successfully!`);

      // Refresh page data
      setTimeout(() => {
        router.refresh();
        if (action === "accept") {
          setShowAcceptModal(false);
        }
        if (action === "counter") {
          setShowCounterForm(false);
        }
      }, 1500);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Specific handler for counter offer
  const handleCounterOffer = async (counterData: any) => {
    setIsProcessing(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const response = await fetch(`/api/proposals/${proposal.id}/counter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: counterData.message,
          price: counterData.price,
          timelineDays: counterData.timelineDays,
          terms: counterData.terms,
          attachments: counterData.attachments || [],
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit counter offer");
      }

      setActionSuccess("Counter offer submitted successfully!");

      // Refresh and close form
      setTimeout(() => {
        router.refresh();
        setShowCounterForm(false);
      }, 1500);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: "bg-gray-100 text-gray-800",
      SUBMITTED: "bg-blue-100 text-blue-800",
      UNDER_REVIEW: "bg-yellow-100 text-yellow-800",
      NEGOTIATION: "bg-purple-100 text-purple-800",
      ACCEPTED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      COUNTERED: "bg-orange-100 text-orange-800",
      WITHDRAWN: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Calculate price per unit
  const pricePerUnit = proposal.brief?.quantity
    ? (proposal.price / proposal.brief.quantity).toFixed(2)
    : null;

  // Prepare proposal data for CounterOfferForm
  const counterProposalData = {
    id: proposal.id,
    price: proposal.price,
    timelineDays: proposal.timelineDays,
    terms: proposal.terms || {},
    brief: proposal.brief || undefined,
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Proposal Review
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  proposal.status
                )}`}
              >
                {proposal.status.replace("_", " ")}
              </span>
            </div>
            <p className="text-gray-600">
              For: {proposal.brief?.title || "Untitled Brief"}
            </p>
          </div>

          {/* Action Buttons */}
          {permissions.canReview && (
            <div className="flex flex-wrap gap-3">
              {permissions.canCounter && proposal.status !== "COUNTERED" && (
                <button
                  onClick={() => setShowCounterForm(!showCounterForm)}
                  disabled={isProcessing}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    showCounterForm
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "border border-blue-600 text-blue-600 hover:bg-blue-50"
                  } disabled:opacity-50`}
                >
                  <MessageSquare className="h-4 w-4" />
                  {showCounterForm ? "Cancel Counter" : "Counter Offer"}
                </button>
              )}

              {permissions.canAccept && proposal.status !== "ACCEPTED" && (
                <button
                  onClick={() => setShowAcceptModal(true)}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  Accept Proposal
                </button>
              )}

              {permissions.canReject &&
                !["REJECTED", "ACCEPTED", "WITHDRAWN"].includes(
                  proposal.status
                ) && (
                  <button
                    onClick={() =>
                      handleAction("reject", { reason: "Not a good fit" })
                    }
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                )}
            </div>
          )}
        </div>

        {/* Action Messages */}
        {actionError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{actionError}</span>
            </div>
          </div>
        )}

        {actionSuccess && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">{actionSuccess}</span>
            </div>
          </div>
        )}
      </div>

      {/* Counter Offer Form */}
      {showCounterForm && permissions.canCounter && (
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Make Counter Offer
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Negotiate terms with the manufacturer
            </p>
          </div>
          <CounterOfferForm
            proposal={counterProposalData}
            onSubmit={handleCounterOffer}
            onCancel={() => setShowCounterForm(false)}
            isSubmitting={isProcessing}
          />
        </div>
      )}

      {/* Proposal Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Proposal Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Manufacturer Info */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Manufacturer Details
            </h3>
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 bg-gray-100 rounded-lg overflow-hidden">
                {proposal.manufacturer?.avatar ? (
                  <img
                    src={proposal.manufacturer.avatar}
                    alt={proposal.manufacturer.company}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Building className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {proposal.manufacturer?.company}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {proposal.manufacturer?.name}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      {proposal.manufacturer?.verified && (
                        <span className="inline-flex items-center gap-1 text-sm text-green-600">
                          <Shield className="h-4 w-4" />
                          Verified
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        {proposal.manufacturer?.locations?.[0] || "Global"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={onBookmarkToggle}
                    className={`p-2 rounded-lg ${
                      isManufacturerBookmarked
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-400 hover:text-blue-600"
                    }`}
                  >
                    {isManufacturerBookmarked ? (
                      <BookmarkCheck className="h-5 w-5" />
                    ) : (
                      <Bookmark className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Manufacturer Stats */}
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {proposal.manufacturer?.stats?.acceptanceRate || 0}%
                    </div>
                    <div className="text-xs text-gray-500">Acceptance Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {proposal.manufacturer?.stats?.totalProposals || 0}
                    </div>
                    <div className="text-xs text-gray-500">Proposals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {proposal.manufacturer?.stats?.responseRate || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">Response Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Proposal Message */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Proposal Details
            </h3>
            <div className="prose max-w-none">
              {proposal.message ? (
                <div dangerouslySetInnerHTML={{ __html: proposal.message }} />
              ) : (
                <p className="text-gray-500 italic">No message provided</p>
              )}
            </div>
          </div>

          {/* Terms & Conditions */}
          {proposal.terms && Object.keys(proposal.terms).length > 0 && (
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Terms & Conditions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(proposal.terms).map(
                  ([key, value]: [string, any]) => (
                    <div key={key} className="space-y-1">
                      <dt className="text-sm font-medium text-gray-500 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </dt>
                      <dd className="text-gray-900">
                        {Array.isArray(value)
                          ? value.join(", ")
                          : String(value)}
                      </dd>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Attachments */}
          {proposal.attachments && proposal.attachments.length > 0 && (
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Attachments
              </h3>
              <div className="space-y-3">
                {proposal.attachments.map((url: string, index: number) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {url.split("/").pop()}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-md">
                          {url}
                        </div>
                      </div>
                    </div>
                    <Download className="h-5 w-5 text-gray-400" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Summary & Actions */}
        <div className="space-y-6">
          {/* Price Summary */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Financial Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Proposed Price</span>
                <span className="text-2xl font-bold text-gray-900">
                  ${proposal.price.toLocaleString()}
                </span>
              </div>

              {pricePerUnit && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Price per unit</span>
                  <span className="text-lg font-semibold text-gray-900">
                    ${pricePerUnit}
                  </span>
                </div>
              )}

              {proposal.brief?.budget && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Brief Budget</span>
                    <span className="text-gray-900">
                      ${proposal.brief.budget.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Difference</span>
                    <span
                      className={`font-medium ${
                        proposal.price <= proposal.brief.budget
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {(
                        ((proposal.price - proposal.brief.budget) /
                          proposal.brief.budget) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </>
              )}

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Timeline: {proposal.timelineDays} days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Submitted</span>
                <span className="text-gray-900">
                  {new Date(
                    proposal.submittedAt || proposal.createdAt
                  ).toLocaleDateString()}
                </span>
              </div>

              {proposal.reviewedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Reviewed</span>
                  <span className="text-gray-900">
                    {new Date(proposal.reviewedAt).toLocaleDateString()}
                  </span>
                </div>
              )}

              {proposal.decidedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Decision</span>
                  <span className="text-gray-900">
                    {new Date(proposal.decidedAt).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="text-sm text-gray-500">
                  Expected completion:{" "}
                  {new Date(
                    new Date(
                      proposal.submittedAt || proposal.createdAt
                    ).getTime() +
                      proposal.timelineDays * 24 * 60 * 60 * 1000
                  ).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Stats */}
          {proposal.brief?.proposalsCount > 1 && (
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Comparison
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BarChart className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {proposal.brief.proposalsCount} total proposals
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Avg. price: $
                    {(proposal.brief.budget * 1.1).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Avg. timeline: {proposal.brief.timelineDays || 30} days
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <h3 className="font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() =>
                  router.push(`/brand/manufacturers/${proposal.manufacturerId}`)
                }
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-white transition-colors"
              >
                <User className="h-4 w-4" />
                View Manufacturer Profile
              </button>

              <button
                onClick={() =>
                  router.push(`/chat?userId=${proposal.manufacturerId}`)
                }
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-white transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                Send Message
              </button>

              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-white transition-colors">
                <FileText className="h-4 w-4" />
                Download as PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Negotiation History */}
      {proposal.negotiationHistory &&
        proposal.negotiationHistory.length > 1 && (
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">
              Negotiation History
            </h3>
            <div className="space-y-4">
              {proposal.negotiationHistory.map((item: any, index: number) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border ${
                    item.type === "COUNTER"
                      ? "bg-blue-50 border-blue-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          item.by === "MANUFACTURER"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {item.by === "MANUFACTURER" ? "M" : "B"}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {item.user?.company || item.user?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.type === "COUNTER"
                            ? "Counter Offer"
                            : "Original Proposal"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">
                        ${item.price.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.timelineDays} days
                      </div>
                    </div>
                  </div>

                  {item.message && (
                    <p className="text-gray-700 text-sm mt-2">
                      {item.message.substring(0, 150)}...
                    </p>
                  )}

                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(item.submittedAt).toLocaleDateString()} at{" "}
                    {new Date(item.submittedAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Accept Proposal Modal */}
      <AcceptProposalModal
        isOpen={showAcceptModal}
        onClose={() => setShowAcceptModal(false)}
        proposal={proposal}
        onAccept={() => handleAction("accept")}
        isProcessing={isProcessing}
      />
    </div>
  );
}
