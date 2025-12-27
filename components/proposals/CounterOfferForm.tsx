// components/proposals/CounterOfferForm.tsx
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
    message: string;
    brief: {
      budget: number;
      timelineDays: number;
    };
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
    price: proposal.price.toString(),
    timelineDays: proposal.timelineDays.toString(),
    message: "",
    terms: "",
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
    const newPrice = parseFloat(formData.price || "0");
    return ((newPrice - proposal.price) / proposal.price) * 100;
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (!formData.timelineDays || parseInt(formData.timelineDays) <= 0) {
      newErrors.timelineDays = "Timeline must be specified";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Please explain your counter offer";
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
          price: parseFloat(formData.price),
          timelineDays: parseInt(formData.timelineDays),
          message: formData.message,
          terms: formData.terms,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
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
          Negotiate terms with {proposal.brief.budget.toLocaleString()}
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
                ${parseFloat(formData.price || "0").toLocaleString()}
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
              value={formData.price}
              onChange={(e) => handleChange("price", e.target.value)}
              className={`pl-10 w-full px-3 py-2 border rounded-md ${
                errors.price ? "border-red-300" : "border-gray-300"
              }`}
            />
          </div>
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price}</p>
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
              value={formData.timelineDays}
              onChange={(e) => handleChange("timelineDays", e.target.value)}
              className={`pl-10 w-full px-3 py-2 border rounded-md ${
                errors.timelineDays ? "border-red-300" : "border-gray-300"
              }`}
            />
          </div>
          {errors.timelineDays && (
            <p className="mt-1 text-sm text-red-600">{errors.timelineDays}</p>
          )}
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Counter Offer
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => handleChange("message", e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.message ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="Explain your counter offer..."
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600">{errors.message}</p>
          )}
        </div>

        {/* Terms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Updated Terms (Optional)
          </label>
          <textarea
            value={formData.terms}
            onChange={(e) => handleChange("terms", e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Any changes to payment terms or conditions..."
          />
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
