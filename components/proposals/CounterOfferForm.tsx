"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  Calendar,
  MessageSquare,
  TrendingDown,
  TrendingUp,
  Check,
  X,
  FileText,
  AlertCircle,
} from "lucide-react";

interface CounterOfferFormProps {
  proposal: {
    id: string;
    price: number;
    timelineDays: number;
    terms: any;
    brief?: {
      budget?: number;
      timelineDays?: number;
    };
  };
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function CounterOfferForm({
  proposal,
  onSubmit,
  onCancel,
  isSubmitting,
}: CounterOfferFormProps) {
  const [formData, setFormData] = useState({
    message: "",
    price: proposal.price.toString(),
    timelineDays: proposal.timelineDays.toString(),
    terms: proposal.terms ? JSON.stringify(proposal.terms, null, 2) : "{}",
    attachments: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newAttachment, setNewAttachment] = useState("");

  // Initialize form with proposal data
  useEffect(() => {
    setFormData({
      message: "",
      price: proposal.price.toString(),
      timelineDays: proposal.timelineDays.toString(),
      terms: proposal.terms ? JSON.stringify(proposal.terms, null, 2) : "{}",
      attachments: [],
    });
  }, [proposal]);

  // Calculate price difference
  const calculatePriceDiff = () => {
    const newPrice = parseFloat(formData.price || "0");
    return ((newPrice - proposal.price) / proposal.price) * 100;
  };

  // Calculate budget difference if available
  const calculateBudgetDiff = () => {
    if (!proposal.brief?.budget) return null;
    const newPrice = parseFloat(formData.price || "0");
    return ((newPrice - proposal.brief.budget) / proposal.brief.budget) * 100;
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (!formData.timelineDays || parseInt(formData.timelineDays) <= 0) {
      newErrors.timelineDays = "Timeline must be greater than 0 days";
    }

    // Validate JSON for terms
    if (formData.terms) {
      try {
        JSON.parse(formData.terms);
      } catch {
        newErrors.terms = "Terms must be valid JSON";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const submissionData = {
      message: formData.message,
      price: parseFloat(formData.price),
      timelineDays: parseInt(formData.timelineDays),
      terms: formData.terms ? JSON.parse(formData.terms) : {},
      attachments: formData.attachments,
    };

    onSubmit(submissionData);
  };

  const addAttachment = () => {
    if (
      newAttachment.trim() &&
      !formData.attachments.includes(newAttachment.trim())
    ) {
      setFormData({
        ...formData,
        attachments: [...formData.attachments, newAttachment.trim()],
      });
      setNewAttachment("");
    }
  };

  const removeAttachment = (index: number) => {
    setFormData({
      ...formData,
      attachments: formData.attachments.filter((_, i) => i !== index),
    });
  };

  const priceDiff = calculatePriceDiff();
  const budgetDiff = calculateBudgetDiff();
  const isPriceLower = priceDiff < 0;
  const isWithinBudget = budgetDiff ? budgetDiff <= 0 : null;

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Make Counter Offer
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Negotiate terms with the {proposal.brief ? "manufacturer" : "brand"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Price Comparison */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Price Comparison</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-white border rounded">
              <p className="text-xs text-gray-600 mb-1">Current Offer</p>
              <p className="font-bold text-lg">
                ${proposal.price.toLocaleString()}
              </p>
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
                <p className="font-bold text-lg">
                  ${parseFloat(formData.price || "0").toLocaleString()}
                </p>
                {priceDiff !== 0 && (
                  <span
                    className={`text-sm font-medium ${
                      isPriceLower ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    {isPriceLower ? (
                      <TrendingDown className="h-4 w-4 inline mr-1" />
                    ) : (
                      <TrendingUp className="h-4 w-4 inline mr-1" />
                    )}
                    {Math.abs(priceDiff).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>

            {proposal.brief?.budget && (
              <div
                className={`p-3 border rounded ${
                  isWithinBudget
                    ? "border-green-300 bg-green-50"
                    : "border-red-300 bg-red-50"
                }`}
              >
                <p className="text-xs text-gray-600 mb-1">Brief Budget</p>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-lg">
                    ${proposal.brief.budget.toLocaleString()}
                  </p>
                  {budgetDiff !== null && budgetDiff !== 0 && (
                    <span
                      className={`text-sm font-medium ${
                        isWithinBudget ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {Math.abs(budgetDiff).toFixed(1)}%
                      {isWithinBudget ? " under" : " over"}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Price Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Counter Price (USD) *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              className={`pl-10 w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.price ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="0.00"
            />
          </div>
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price}</p>
          )}
        </div>

        {/* Timeline Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timeline (Days) *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="number"
              min="1"
              required
              value={formData.timelineDays}
              onChange={(e) =>
                setFormData({ ...formData, timelineDays: e.target.value })
              }
              className={`pl-10 w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.timelineDays ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="30"
            />
          </div>
          {errors.timelineDays && (
            <p className="mt-1 text-sm text-red-600">{errors.timelineDays}</p>
          )}

          {proposal.brief?.timelineDays && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Original request: {proposal.brief.timelineDays} days</span>
              {parseInt(formData.timelineDays) >
                proposal.brief.timelineDays && (
                <span className="text-yellow-600">
                  (+
                  {parseInt(formData.timelineDays) -
                    proposal.brief.timelineDays}{" "}
                  days longer)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Counter Offer
          </label>
          <textarea
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Explain your reasoning for this counter offer. Be specific about what you're looking for..."
          />
          <p className="text-sm text-gray-500 mt-1">
            A clear explanation increases the chances of acceptance
          </p>
        </div>

        {/* Terms */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Updated Terms (JSON)
            </label>
            <button
              type="button"
              onClick={() => {
                const defaultTerms = {
                  paymentTerms: "50% deposit, 50% on delivery",
                  warranty: "1 year from delivery",
                  deliveryTerms: "FOB",
                  qualityStandards: ["ISO 9001"],
                  inspectionPeriod: "7 days",
                  lateDeliveryPenalty: "1% per week",
                  forceMajeure: "Standard clause applies",
                };
                setFormData({
                  ...formData,
                  terms: JSON.stringify(defaultTerms, null, 2),
                });
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Use default terms
            </button>
          </div>
          <textarea
            value={formData.terms}
            onChange={(e) =>
              setFormData({ ...formData, terms: e.target.value })
            }
            rows={4}
            className={`w-full px-4 py-2.5 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.terms ? "border-red-300" : "border-gray-300"
            }`}
            placeholder='{"paymentTerms": "50% deposit, 50% on delivery", "warranty": "1 year"}'
          />
          {errors.terms && (
            <p className="mt-1 text-sm text-red-600">{errors.terms}</p>
          )}
          <div className="mt-2 text-sm text-gray-500">
            Common terms: payment schedule, warranty, delivery, quality
            standards, penalties
          </div>
        </div>

        {/* Attachments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Supporting Documents (Optional)
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="url"
              value={newAttachment}
              onChange={(e) => setNewAttachment(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), addAttachment())
              }
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add file URL (PDF, DOC, images)"
            />
            <button
              type="button"
              onClick={addAttachment}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Add
            </button>
          </div>

          {formData.attachments.length > 0 && (
            <div className="space-y-2">
              {formData.attachments.map((url, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div className="truncate max-w-xs">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {url.split("/").pop()}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {url}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Tips for Successful Counter Offers
          </h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <div className="bg-white p-0.5 rounded mt-0.5">
                <div className="h-1.5 w-1.5 bg-blue-500 rounded-full"></div>
              </div>
              <span>Be specific about what you want changed</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="bg-white p-0.5 rounded mt-0.5">
                <div className="h-1.5 w-1.5 bg-blue-500 rounded-full"></div>
              </div>
              <span>Justify your price with market data or requirements</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="bg-white p-0.5 rounded mt-0.5">
                <div className="h-1.5 w-1.5 bg-blue-500 rounded-full"></div>
              </div>
              <span>Keep the door open for further negotiation</span>
            </li>
          </ul>
        </div>

        {/* Error message */}
        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{errors.submit}</span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending Counter Offer...
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
