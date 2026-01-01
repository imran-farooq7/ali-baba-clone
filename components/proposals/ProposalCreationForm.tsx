"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Send,
  Upload,
  X,
  Plus,
  DollarSign,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Briefcase,
  BarChart,
} from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import rich text editor to avoid SSR issues
const RichTextEditor = dynamic(() => import("@/components/ui/RichTextEditor"), {
  ssr: false,
  loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded"></div>,
});

interface ProposalCreationFormProps {
  manufacturerId: string;
  brief?: any;
  recentProposals?: any[];
}

export default function ProposalCreationForm({
  manufacturerId,
  brief,
  recentProposals = [],
}: ProposalCreationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    briefId: brief?.id || "",
    message: "",
    price: "",
    timelineDays: "",
    terms: {
      paymentTerms: "50% advance, 50% on delivery",
      warranty: "1 year",
      deliveryTerms: "FOB",
      qualityStandards: ["ISO 9001"],
      additionalTerms: "",
    },
    attachments: [] as string[],
  });

  const [newAttachment, setNewAttachment] = useState("");
  const [newQualityStandard, setNewQualityStandard] = useState("");

  // Auto-save draft
  useEffect(() => {
    const autoSave = setTimeout(async () => {
      if (formData.message || formData.price || formData.timelineDays) {
        await saveDraft();
      }
    }, 3000);

    return () => clearTimeout(autoSave);
  }, [formData]);

  const saveDraft = async () => {
    if (!formData.briefId) return;

    setIsSavingDraft(true);
    try {
      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? parseFloat(formData.price) : 0,
          timelineDays: formData.timelineDays
            ? parseInt(formData.timelineDays)
            : 0,
          status: "DRAFT",
        }),
      });

      if (response.ok) {
        console.log("Draft auto-saved");
      }
    } catch (err) {
      console.error("Auto-save failed:", err);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async (action: "save" | "submit") => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Validation
      if (!formData.briefId) {
        throw new Error("Please select a brief");
      }

      if (!formData.message.trim()) {
        throw new Error("Proposal message is required");
      }

      if (!formData.price || parseFloat(formData.price) <= 0) {
        throw new Error("Valid price is required");
      }

      if (!formData.timelineDays || parseInt(formData.timelineDays) <= 0) {
        throw new Error("Valid timeline is required");
      }

      const endpoint =
        action === "save" ? "/api/proposals" : `/api/proposals?action=submit`;
      const method = action === "save" ? "POST" : "POST";

      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          briefId: formData.briefId,
          message: formData.message,
          price: parseFloat(formData.price),
          timelineDays: parseInt(formData.timelineDays),
          terms: formData.terms,
          attachments: formData.attachments,
          status: action === "submit" ? "SUBMITTED" : "DRAFT",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} proposal`);
      }

      setSuccess(
        `Proposal ${action === "submit" ? "submitted" : "saved"} successfully!`
      );

      // Redirect after success
      setTimeout(() => {
        router.push(`/manufacturer/proposals/${data.proposal.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
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

  const addQualityStandard = () => {
    if (
      newQualityStandard.trim() &&
      !formData.terms.qualityStandards.includes(newQualityStandard.trim())
    ) {
      setFormData({
        ...formData,
        terms: {
          ...formData.terms,
          qualityStandards: [
            ...formData.terms.qualityStandards,
            newQualityStandard.trim(),
          ],
        },
      });
      setNewQualityStandard("");
    }
  };

  const removeQualityStandard = (index: number) => {
    setFormData({
      ...formData,
      terms: {
        ...formData.terms,
        qualityStandards: formData.terms.qualityStandards.filter(
          (_, i) => i !== index
        ),
      },
    });
  };

  // Calculate suggested price based on brief budget
  const calculateSuggestedPrice = () => {
    if (!brief?.budget) return null;

    const budget = brief.budget;
    const suggested = budget * 0.9; // 10% lower than budget
    return suggested.toFixed(2);
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      {/* Brief Info */}
      {brief && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Proposing on:</h3>
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">
                {brief.title}
              </h4>
              <p className="text-gray-600 text-sm mt-1">
                {brief.description?.substring(0, 150)}...
              </p>

              <div className="flex flex-wrap gap-4 mt-3 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span>Budget: ${brief.budget?.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                  <span>Quantity: {brief.quantity?.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart className="h-4 w-4 text-gray-400" />
                  <span>Category: {brief.category}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-500">Brand</div>
              <div className="font-medium">{brief.brand?.company}</div>
            </div>
          </div>
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <p className="font-medium text-green-800">{success}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="space-y-8">
        {/* Proposal Message */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proposal Message *
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Introduce your company, explain why you're the best fit, and
              detail your approach
            </p>
            <RichTextEditor
              value={formData.message}
              onChange={(value) => setFormData({ ...formData, message: value })}
              placeholder="Describe your manufacturing capabilities, quality standards, and why you're the right choice for this project..."
            />
          </div>
        </div>

        {/* Price & Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (USD) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            {brief?.budget && (
              <p className="text-sm text-gray-500 mt-2">
                Brief budget: ${brief.budget.toLocaleString()} | Suggested: $
                {calculateSuggestedPrice()}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timeline (Days) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                min="1"
                required
                value={formData.timelineDays}
                onChange={(e) =>
                  setFormData({ ...formData, timelineDays: e.target.value })
                }
                className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="30"
              />
            </div>
            {brief?.timelineDays && (
              <p className="text-sm text-gray-500 mt-2">
                Brand's requested timeline: {brief.timelineDays} days
              </p>
            )}
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Terms & Conditions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Terms
              </label>
              <input
                type="text"
                value={formData.terms.paymentTerms}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    terms: { ...formData.terms, paymentTerms: e.target.value },
                  })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 50% advance, 50% on delivery"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warranty Period
              </label>
              <input
                type="text"
                value={formData.terms.warranty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    terms: { ...formData.terms, warranty: e.target.value },
                  })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 1 year"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Terms
              </label>
              <input
                type="text"
                value={formData.terms.deliveryTerms}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    terms: { ...formData.terms, deliveryTerms: e.target.value },
                  })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., FOB, CIF"
              />
            </div>
          </div>

          {/* Quality Standards */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quality Standards
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newQualityStandard}
                onChange={(e) => setNewQualityStandard(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" &&
                  (e.preventDefault(), addQualityStandard())
                }
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a quality standard (e.g., ISO 9001)"
              />
              <button
                type="button"
                onClick={addQualityStandard}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {formData.terms.qualityStandards.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.terms.qualityStandards.map((standard, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg"
                  >
                    {standard}
                    <button
                      type="button"
                      onClick={() => removeQualityStandard(index)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Additional Terms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Terms
            </label>
            <textarea
              value={formData.terms.additionalTerms}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  terms: { ...formData.terms, additionalTerms: e.target.value },
                })
              }
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any additional terms, conditions, or special requirements..."
            />
          </div>
        </div>

        {/* Attachments */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Attachments</h3>

          <div className="flex gap-2">
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
              <Upload className="h-5 w-5" />
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
                    <div className="truncate">
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

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4 pt-8 border-t">
          <div className="text-sm text-gray-500">
            {isSavingDraft ? "Auto-saving draft..." : "Draft auto-saved"}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleSubmit("save")}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </button>

            <button
              type="button"
              onClick={() => handleSubmit("submit")}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Proposal
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
