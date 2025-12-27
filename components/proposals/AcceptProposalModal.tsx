// components/proposals/AcceptProposalModal.tsx - UPDATED FOR YOUR API
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
} from "lucide-react";

interface AcceptProposalModalProps {
  proposal: {
    id: string;
    price: number;
    timelineDays: number;
    terms: any;
    manufacturer: {
      company: string;
      name: string;
    };
    brief: {
      title: string;
      quantity: number;
    };
  };
  onAccept: () => void;
  onCancel: () => void;
}

export default function AcceptProposalModal({
  proposal,
  onAccept,
  onCancel,
}: AcceptProposalModalProps) {
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [notes, setNotes] = useState("");

  const handleAccept = async () => {
    if (!agreedToTerms) {
      alert("Please agree to the terms and conditions");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/proposals/${proposal.id}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      const data = await response.json();

      if (response.ok) {
        onAccept();
      } else {
        alert(data.error || "Failed to accept proposal");
      }
    } catch (error) {
      alert("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
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
                  {proposal.manufacturer.company}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600"
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
                <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside">
                  <li>Mark this proposal as ACCEPTED</li>
                  <li>Mark the brief as MATCHED</li>
                  <li>
                    Automatically reject all other proposals for this brief
                  </li>
                  <li>Assign this manufacturer to the brief</li>
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
                  ${proposal.price.toLocaleString()}
                </p>
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
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    Quantity
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {proposal.brief.quantity.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Manufacturer Info */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">
              Manufacturer Information
            </h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {proposal.manufacturer.company}
                </p>
                <p className="text-sm text-gray-600">
                  {proposal.manufacturer.name}
                </p>
              </div>
            </div>
          </div>

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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
              placeholder="Add any special instructions or comments..."
            />
          </div>

          {/* Agreement */}
          <div className="mb-6">
            <div className="flex items-start gap-3">
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
                {proposal.manufacturer.company} for the manufacturing of{" "}
                {proposal.brief.quantity.toLocaleString()} units of "
                {proposal.brief.title}" at a total cost of $
                {proposal.price.toLocaleString()}.
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAccept}
              disabled={loading || !agreedToTerms}
              className="px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
