// components/proposals/ProposalCreationForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  Calendar,
  FileText,
  Upload,
  Check,
  X,
  AlertCircle,
  Calculator,
  Clock,
  Package,
  TrendingUp,
  Shield,
} from "lucide-react";

interface Brief {
  id: string;
  title: string;
  description: string;
  budget: number;
  quantity: number;
  timelineDays: number;
  brand: {
    id: string;
    company: string;
    name: string;
  };
}

interface ProposalCreationFormProps {
  briefId: string;
  manufacturerId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ProposalCreationForm({
  briefId,
  manufacturerId,
  onSuccess,
  onCancel,
}: ProposalCreationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    price: "",
    timelineDays: "",
    message: "",
    terms: "",
    attachments: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load brief data
  useEffect(() => {
    const fetchBrief = async () => {
      try {
        const response = await fetch(`/api/briefs/${briefId}`);
        const data = await response.json();
        if (data.success) {
          setBrief(data.data);
          // Set default values based on brief
          setFormData((prev) => ({
            ...prev,
            price: data.data.budget.toString(),
            timelineDays: data.data.timelineDays.toString(),
          }));
        }
      } catch (error) {
        console.error("Error fetching brief:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBrief();
  }, [briefId]);

  // Handle file upload
  const handleFileUpload = async (files: FileList) => {
    const newFiles = Array.from(files);
    setFiles((prev) => [...prev, ...newFiles]);

    // In production: Upload to Supabase Storage
    const uploadedUrls = newFiles.map((file) => URL.createObjectURL(file));
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...uploadedUrls],
    }));
  };

  // Remove file
  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    const newAttachments = [...formData.attachments];
    newAttachments.splice(index, 1);
    setFormData({ ...formData, attachments: newAttachments });
  };

  // Calculate profit margin
  const calculateMargin = () => {
    if (!brief || !formData.price) return 0;
    const cost = parseFloat(formData.price);
    const budget = brief.budget;
    return ((cost - budget) / budget) * 100;
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
      newErrors.message = "Proposal message is required";
    }

    if (brief && parseFloat(formData.price) > brief.budget * 2) {
      newErrors.price = "Price is significantly above brief budget";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          briefId,
          manufacturerId,
          price: parseFloat(formData.price),
          timelineDays: parseInt(formData.timelineDays),
          message: formData.message,
          terms: formData.terms,
          attachments: formData.attachments,
          status: "SUBMITTED",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success - redirect or callback
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/manufacturer/proposals/${data.data.id}`);
        }
      } else {
        setErrors({ submit: data.error || "Failed to submit proposal" });
      }
    } catch (error) {
      setErrors({ submit: "Network error occurred" });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle input changes
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Brief Not Found</h3>
        <p className="text-gray-500 mt-2">
          The brief you're trying to submit a proposal for doesn't exist.
        </p>
      </div>
    );
  }

  const margin = calculateMargin();
  const isWithinBudget = brief && parseFloat(formData.price) <= brief.budget;

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Submit Proposal
            </h2>
            <p className="text-gray-600 mt-1">For: {brief.title}</p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="flex items-center text-gray-500">
                <Package className="h-4 w-4 mr-1" />
                {brief.quantity.toLocaleString()} units
              </span>
              <span className="flex items-center text-gray-500">
                <DollarSign className="h-4 w-4 mr-1" />
                Budget: ${brief.budget.toLocaleString()}
              </span>
              <span className="flex items-center text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                {brief.timelineDays} days requested
              </span>
            </div>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          {/* Price & Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Your Price (USD) *
                </div>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  className={`pl-7 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.price ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter your price"
                />
              </div>
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}

              {/* Price indicators */}
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Brief Budget:</span>
                  <span className="font-medium">
                    ${brief.budget.toLocaleString()}
                  </span>
                </div>
                <div
                  className={`flex justify-between text-sm ${
                    margin > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  <span className="flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Margin:
                  </span>
                  <span className="font-medium">{margin.toFixed(1)}%</span>
                </div>
                {!isWithinBudget && (
                  <div className="flex items-center text-amber-600 text-sm">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Your price is above the brief budget
                  </div>
                )}
              </div>
            </div>

            {/* Timeline Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Production Timeline (Days) *
                </div>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="number"
                  min="1"
                  value={formData.timelineDays}
                  onChange={(e) => handleChange("timelineDays", e.target.value)}
                  className={`pl-10 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.timelineDays ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Estimated days"
                />
              </div>
              {errors.timelineDays && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.timelineDays}
                </p>
              )}

              <div className="mt-3 flex items-center text-sm text-gray-600">
                <Clock className="h-3 w-3 mr-1" />
                <span>Brand requested: {brief.timelineDays} days</span>
              </div>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                Proposal Message *
              </div>
              <span className="text-xs font-normal text-gray-500">
                Introduce yourself and explain why you're the best fit
              </span>
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => handleChange("message", e.target.value)}
              rows={6}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.message ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Describe your capabilities, experience, and approach for this project..."
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-600">{errors.message}</p>
            )}
            <div className="mt-2 text-xs text-gray-500">
              {formData.message.length}/2000 characters
            </div>
          </div>

          {/* Terms & Conditions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                Terms & Conditions
              </div>
              <span className="text-xs font-normal text-gray-500">
                Payment terms, delivery conditions, warranties, etc.
              </span>
            </label>
            <textarea
              value={formData.terms}
              onChange={(e) => handleChange("terms", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Example: 50% deposit, 50% on delivery. 30-day warranty..."
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center">
                <Upload className="h-4 w-4 mr-1" />
                Supporting Documents
              </div>
              <span className="text-xs font-normal text-gray-500">
                Upload portfolio samples, certifications, or reference projects
              </span>
            </label>

            <div className="mt-2">
              <label className="cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload files</p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, JPG, PNG, DOC up to 10MB each
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  onChange={(e) =>
                    e.target.files && handleFileUpload(e.target.files)
                  }
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
              </label>
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Selected Files ({files.length})
                </h4>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Proposal Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white rounded border">
                <p className="text-sm text-gray-600">Your Price</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${parseFloat(formData.price || "0").toLocaleString()}
                </p>
              </div>
              <div className="text-center p-3 bg-white rounded border">
                <p className="text-sm text-gray-600">Timeline</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formData.timelineDays || "0"} days
                </p>
              </div>
              <div className="text-center p-3 bg-white rounded border">
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-lg font-semibold text-green-600">
                  Ready to Submit
                </p>
              </div>
            </div>
          </div>

          {/* Error message */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            {onCancel ? (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50"
                disabled={submitting}
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50"
                disabled={submitting}
              >
                Back
              </button>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Submit Proposal
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
