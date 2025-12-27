// components/proposals/CounterOfferForm.tsx - UPDATED FOR YOUR API
"use client";

import { useState } from "react";
import {
  DollarSign,
  Calendar,
  MessageSquare,
  TrendingDown,
  Check,
  X,
} from "lucide-react";

interface CounterOfferFormProps {
  proposal: {
    id: string;
    price: number;
    timelineDays: number;
    terms: any;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CounterOfferForm({
  proposal,
  onSuccess,
  onCancel,
}: CounterOfferFormProps) {
  const [formData, setFormData] = useState({
    counterPrice: proposal.price.toString(),
    counterTimeline: proposal.timelineDays.toString(),
    counterMessage: "",
    counterTerms: JSON.stringify(proposal.terms || {}, null, 2),
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle input changes
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Calculate price difference
  const calculatePriceDiff = () => {
    const newPrice = parseFloat(formData.counterPrice || "0");
    return ((newPrice - proposal.price) / proposal.price) * 100;
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.counterPrice || parseFloat(formData.counterPrice) <= 0) {
      newErrors.counterPrice = "Price must be greater than 0";
    }

    if (!formData.counterTimeline || parseInt(formData.counterTimeline) <= 0) {
      newErrors.counterTimeline = "Timeline must be specified";
    }

    // Validate JSON for terms
    if (formData.counterTerms) {
      try {
        JSON.parse(formData.counterTerms);
      } catch {
        newErrors.counterTerms = "Terms must be valid JSON";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/proposals/${proposal.id}/counter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          counterPrice: parseFloat(formData.counterPrice),
          counterTimeline: parseInt(formData.counterTimeline),
          counterMessage: formData.counterMessage,
          counterTerms: formData.counterTerms
            ? JSON.parse(formData.counterTerms)
            : {},
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        setErrors({ submit: data.error || "Failed to submit counter offer" });
      }
    } catch (error) {
      setErrors({ submit: "Network error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const priceDiff = calculatePriceDiff();
  const isPriceLower = priceDiff < 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Make Counter Offer
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Negotiate terms with the manufacturer
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current vs Counter comparison */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 border border-gray-200 rounded">
            <p className="text-xs text-gray-600 mb-1">Current Price</p>
            <p className="font-medium">${proposal.price.toLocaleString()}</p>
          </div>
          <div
            className={`p-3 border rounded ${
              isPriceLower
                ? "border-green-300 bg-green-50"
                : "border-yellow-300 bg-yellow-50"
            }`}
          >
            <p className="text-xs text-gray-600 mb-1">Your Counter</p>
            <div className="flex items-center justify-between">
              <p className="font-medium">
                ${parseFloat(formData.counterPrice || "0").toLocaleString()}
              </p>
              {priceDiff !== 0 && (
                <span
                  className={`text-xs ${
                    isPriceLower ? "text-green-600" : "text-yellow-600"
                  }`}
                >
                  {isPriceLower ? "↓" : "↑"} {Math.abs(priceDiff).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Price Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Counter Price (USD)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.counterPrice}
              onChange={(e) => handleChange("counterPrice", e.target.value)}
              className={`pl-10 w-full px-3 py-2 border rounded-md ${
                errors.counterPrice ? "border-red-300" : "border-gray-300"
              }`}
            />
          </div>
          {errors.counterPrice && (
            <p className="mt-1 text-sm text-red-600">{errors.counterPrice}</p>
          )}
        </div>

        {/* Timeline Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Counter Timeline (Days)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="number"
              min="1"
              value={formData.counterTimeline}
              onChange={(e) => handleChange("counterTimeline", e.target.value)}
              className={`pl-10 w-full px-3 py-2 border rounded-md ${
                errors.counterTimeline ? "border-red-300" : "border-gray-300"
              }`}
            />
          </div>
          {errors.counterTimeline && (
            <p className="mt-1 text-sm text-red-600">
              {errors.counterTimeline}
            </p>
          )}
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Counter Offer
          </label>
          <textarea
            value={formData.counterMessage}
            onChange={(e) => handleChange("counterMessage", e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.counterMessage ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="Explain your counter offer..."
          />
        </div>

        {/* Terms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Updated Terms (JSON)
          </label>
          <textarea
            value={formData.counterTerms}
            onChange={(e) => handleChange("counterTerms", e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md font-mono text-sm ${
              errors.counterTerms ? "border-red-300" : "border-gray-300"
            }`}
            placeholder='{"paymentTerms": "50% deposit, 50% on delivery", "warranty": "30 days"}'
          />
          {errors.counterTerms && (
            <p className="mt-1 text-sm text-red-600">{errors.counterTerms}</p>
          )}
        </div>

        {/* Error message */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-700">{errors.submit}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Send Counter Offer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
