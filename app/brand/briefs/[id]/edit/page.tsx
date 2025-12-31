"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import BriefCreationForm from "@/components/brand/BriefCreationForm";
import { ArrowLeft, Loader2, AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Brief } from "@/lib/generated/prisma/client";

export default function EditBriefPage() {
  const router = useRouter();
  const params = useParams();
  const briefId = params.id as string;
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [brief, setBrief] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>(""); // You'll need to get this from auth

  useEffect(() => {
    fetchBrief();
    // Get current user ID from your auth system
    // setUserId(currentUser.id)
  }, [briefId]);

  const fetchBrief = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log(briefId, "id");
      const response = await fetch(`/api/briefs/${briefId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Brief not found");
        }
        throw new Error("Failed to fetch brief");
      }

      const data = await response.json();
      setBrief(data);

      // Set user ID from brief if available
      if (data.brandId) {
        setUserId(data.brandId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching brief:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIEnhance = async () => {
    try {
      setIsEnhancing(true);
      const response = await fetch(`/api/ai/brief-enhance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          briefId,
          currentBrief: brief,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to enhance brief with AI");
      }

      const enhancedDescription = await response.text();

      // Update form with AI suggestions
      if (enhancedDescription && enhancedDescription.trim().length > 0) {
        setBrief((prev: Brief) =>
          prev
            ? {
                ...prev,
                aiEnhancedDescription: enhancedDescription,
                aiSuggestions: enhancedDescription || prev.aiSuggestions,
              }
            : null
        );
        toast.success("AI enhancement applied!");
      }
    } catch (err) {
      toast.error("AI enhancement failed");
      console.error("AI enhancement error:", err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleUpdate = async (formData: any) => {
    try {
      const response = await fetch(`/api/briefs/${briefId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          id: briefId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update brief");
      }

      const updatedBrief = await response.json();

      toast.success("Brief updated successfully!");

      // Redirect after successful save

      // router.replace(`brand/briefs/${briefId}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update brief"
      );
      console.error("Error updating brief:", err);
    }
  };

  const handleCancel = () => {
    router.push(`/briefs/${briefId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading brief details...</p>
        </div>
      </div>
    );
  }

  if (error && !brief) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Brief Not Found
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/briefs"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Briefs
          </Link>
        </div>
      </div>
    );
  }

  if (!brief) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/briefs/${briefId}`}
                className="inline-flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Brief
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Edit Brief: {brief.title}
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Update your manufacturing requirements
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAIEnhance}
                className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:opacity-90"
              >
                {isEnhancing ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <span className="flex gap-2 items-center">
                    <Sparkles className="h-4 w-4" />
                    Enhance with AI
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Enhanced Description Banner */}
      {brief.aiEnhancedDescription && (
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-900">
                    AI-Enhanced Description Available
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Review the AI-suggested improvements for your brief
                    description
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  // Auto-fill the AI enhanced description
                  setBrief((prev: Brief) => ({
                    ...prev,
                    description: prev.aiEnhancedDescription,
                  }));
                  toast.success("AI description applied!");
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Apply Suggestion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <BriefCreationForm
            userId={userId}
            initialData={brief}
            onUpdate={handleUpdate}
            isEditMode={true}
          />
        </div>

        {/* Status Information */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600">Status</div>
              <div className="font-medium">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    brief.status === "PUBLISHED"
                      ? "bg-green-100 text-green-800"
                      : brief.status === "DRAFT"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {brief.status}
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Proposals Received</div>
              <div className="font-medium">{brief.proposalsCount || 0}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Created</div>
              <div className="font-medium">
                {new Date(brief.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Last Updated</div>
              <div className="font-medium">
                {new Date(brief.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
