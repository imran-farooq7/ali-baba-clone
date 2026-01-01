"use client";

import { useState } from "react";
import {
  CheckCircle,
  DollarSign,
  Calendar,
  Package,
  AlertCircle,
  FileText,
  Shield,
  Check,
  X,
  Loader2,
  Building,
  Briefcase,
} from "lucide-react";

interface AcceptProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: any;
  onAccept: () => void;
  isProcessing: boolean;
}

export default function AcceptProposalModal({
  isOpen,
  onClose,
  proposal,
  onAccept,
  isProcessing,
}: AcceptProposalModalProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [notes, setNotes] = useState("");

  const handleAccept = () => {
    if (!agreedToTerms) {
      alert("Please agree to the terms and conditions");
      return;
    }
    onAccept();
  };

  // Calculate price per unit
  const calculatePricePerUnit = () => {
    if (!proposal.brief?.quantity) return null;
    return (proposal.price / proposal.brief.quantity).toFixed(2);
  };

  if (!isOpen) return null;

  const pricePerUnit = calculatePricePerUnit();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Accept Proposal
                </h2>
                <p className="text-sm text-gray-600">
                  You're about to accept a proposal from{" "}
                  {proposal.manufacturer?.company ||
                    proposal.manufacturer?.name ||
                    "manufacturer"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">
                  Important Notice
                </h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Accepting this proposal creates a binding agreement. This
                  action will:
                </p>
                <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside space-y-1">
                  <li>Mark this proposal as ACCEPTED</li>
                  <li>Mark the brief as MATCHED</li>
                  <li>
                    Automatically reject all other proposals for this brief
                  </li>
                  <li>Assign this manufacturer to the brief</li>
                  <li>Create a project conversation for collaboration</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Proposal Summary */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-4">Proposal Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    Total Cost
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  ${proposal.price?.toLocaleString() || "0"}
                </p>
                {pricePerUnit && (
                  <p className="text-sm text-gray-500 mt-1">
                    ${pricePerUnit} per unit
                  </p>
                )}
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    Timeline
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {proposal.timelineDays} days
                </p>
                {proposal.brief?.timelineDays && (
                  <p className="text-sm text-gray-500 mt-1">
                    Requested: {proposal.brief.timelineDays} days
                  </p>
                )}
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    Quantity
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {proposal.brief?.quantity?.toLocaleString() || "N/A"}
                </p>
                <p className="text-sm text-gray-500 mt-1">Units</p>
              </div>
            </div>

            {/* Budget comparison */}
            {proposal.brief?.budget && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Brief Budget</span>
                  <span
                    className={`font-medium ${
                      proposal.price <= proposal.brief.budget
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    ${proposal.brief.budget.toLocaleString()}
                    {proposal.price !== proposal.brief.budget && (
                      <span className="ml-2">
                        (
                        {(
                          ((proposal.price - proposal.brief.budget) /
                            proposal.brief.budget) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Brief & Manufacturer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="h-5 w-5 text-blue-500" />
                <h4 className="font-medium text-gray-900">Brief Details</h4>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Title</p>
                  <p className="font-medium">
                    {proposal.brief?.title || "Untitled"}
                  </p>
                </div>
                {proposal.brief?.category && (
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-medium">{proposal.brief.category}</p>
                  </div>
                )}
                {proposal.brief?.location && (
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium">{proposal.brief.location}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Building className="h-5 w-5 text-green-500" />
                <h4 className="font-medium text-gray-900">Manufacturer</h4>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Company</p>
                  <p className="font-medium">
                    {proposal.manufacturer?.company}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contact</p>
                  <p className="font-medium">{proposal.manufacturer?.name}</p>
                </div>
                {proposal.manufacturer?.locations?.[0] && (
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium">
                      {proposal.manufacturer.locations[0]}
                    </p>
                  </div>
                )}
                {proposal.manufacturer?.verified && (
                  <div className="flex items-center gap-2 mt-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">
                      Verified Manufacturer
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          {proposal.terms && Object.keys(proposal.terms).length > 0 && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Proposed Terms</h4>
              <div className="space-y-3">
                {Object.entries(proposal.terms).map(
                  ([key, value]: [string, any]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-sm text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}:
                      </span>
                      <span className="text-sm font-medium">
                        {Array.isArray(value)
                          ? value.join(", ")
                          : String(value)}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Additional Notes (Optional)
              </div>
              <span className="text-xs font-normal text-gray-500">
                These notes will be visible to the manufacturer
              </span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Add any special instructions, requirements, or comments for the manufacturer..."
            />
          </div>

          {/* Agreement */}
          <div className="mb-6">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="agree-terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 h-4 w-4 text-green-600 rounded focus:ring-green-500"
              />
              <label htmlFor="agree-terms" className="text-sm text-gray-700">
                I agree to the proposed terms and conditions. I understand that
                accepting this proposal creates a binding agreement with{" "}
                <span className="font-medium">
                  {proposal.manufacturer?.company}
                </span>{" "}
                for the manufacturing of{" "}
                <span className="font-medium">
                  {proposal.brief?.quantity?.toLocaleString() || "specified"}
                </span>{" "}
                units of "
                <span className="font-medium">
                  {proposal.brief?.title || "the product"}
                </span>
                " at a total cost of{" "}
                <span className="font-medium">
                  ${proposal.price?.toLocaleString() || "0"}
                </span>{" "}
                to be delivered within{" "}
                <span className="font-medium">{proposal.timelineDays}</span>{" "}
                days.
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAccept}
              disabled={isProcessing || !agreedToTerms}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Accept & Create Contract
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
