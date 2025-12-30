// components/brand/BriefCreationForm.tsx - UPDATED
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2, Save } from "lucide-react";
import toast from "react-hot-toast";

const briefSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  category: z.string().min(1, "Category is required"),
  budget: z.number().min(100, "Minimum budget is 100"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  requirements: z.array(z.string()).min(1, "Add at least one requirement"),
  timelineDays: z.number().min(1, "Timeline is required"),
});

type BriefFormData = z.infer<typeof briefSchema>;

interface BriefCreationFormProps {
  userId: string;
  initialData?: any;
  onUpdate?: (data: BriefFormData) => Promise<void>;
  isEditMode?: boolean;
}

export default function BriefCreationForm({
  userId,
  initialData,
  onUpdate,
  isEditMode = false,
}: BriefCreationFormProps) {
  const [requirements, setRequirements] = useState<string[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BriefFormData>({
    resolver: zodResolver(briefSchema),
    defaultValues: {
      requirements: [""],
      budget: 1000,
      quantity: 100,
      timelineDays: 30,
      ...(initialData && {
        title: initialData.title || "",
        description: initialData.description || "",
        category: initialData.category || "",
        budget: initialData.budget || 1000,
        quantity: initialData.quantity || 100,
        timelineDays: initialData.timelineDays || 30,
      }),
    },
  });

  // Initialize requirements from initialData
  useEffect(() => {
    if (initialData) {
      // Handle different requirement formats
      if (
        initialData.requirements &&
        typeof initialData.requirements === "object"
      ) {
        // If requirements is a JSON object, extract values
        const reqArray = Object.values(initialData.requirements);
        setRequirements(
          reqArray.filter((r): r is string => typeof r === "string")
        );
      } else if (Array.isArray(initialData.requirements)) {
        setRequirements(initialData.requirements);
      }
    }
  }, [initialData]);

  // Update form when requirements change
  useEffect(() => {
    setValue("requirements", requirements);
  }, [requirements, setValue]);

  const addRequirement = () => {
    const newRequirements = [...requirements, ""];
    setRequirements(newRequirements);
  };

  const removeRequirement = (index: number) => {
    const newRequirements = requirements.filter((_, i) => i !== index);
    setRequirements(newRequirements);
  };

  const updateRequirement = (index: number, value: string) => {
    const newRequirements = [...requirements];
    newRequirements[index] = value;
    setRequirements(newRequirements);
  };

  const onSubmit = async (data: BriefFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditMode && onUpdate) {
        // Edit mode - call onUpdate
        await onUpdate(data);
      } else {
        // Create mode - original logic
        const response = await fetch("/api/briefs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, brandId: userId }),
        });

        if (response.ok) {
          toast.success("Brief created successfully!");
          // Reset form
          setRequirements([""]);
          reset();
        } else {
          throw new Error("Failed to create brief");
        }
      }
    } catch (error) {
      toast.error(isEditMode ? "Error updating brief" : "Error creating brief");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Form Header */}
      <div className="pb-4 border-b">
        <h2 className="text-xl font-semibold text-gray-900">
          {isEditMode ? "Edit Brief" : "Create New Brief"}
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          {isEditMode
            ? "Update your manufacturing requirements and specifications"
            : "Describe your manufacturing needs to find the right manufacturer"}
        </p>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Brief Title *
        </label>
        <input
          {...register("title")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Eco-friendly T-shirt production"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          {...register("description")}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe your project in detail..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}

        {/* AI Enhanced Description Preview */}
        {initialData?.aiEnhancedDescription && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">
                AI-Enhanced Version
              </span>
              <button
                type="button"
                onClick={() =>
                  setValue("description", initialData.aiEnhancedDescription)
                }
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Use This Version
              </button>
            </div>
            <p className="text-sm text-gray-700">
              {initialData.aiEnhancedDescription}
            </p>
          </div>
        )}
      </div>

      {/* Category, Budget, Quantity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            {...register("category")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select category</option>
            <option value="apparel">Apparel</option>
            <option value="electronics">Electronics</option>
            <option value="furniture">Furniture</option>
            <option value="packaging">Packaging</option>
            <option value="other">Other</option>
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">
              {errors.category.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Budget (USD) *
          </label>
          <input
            type="number"
            {...register("budget", { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.budget && (
            <p className="mt-1 text-sm text-red-600">{errors.budget.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity *
          </label>
          <input
            type="number"
            {...register("quantity", { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.quantity && (
            <p className="mt-1 text-sm text-red-600">
              {errors.quantity.message}
            </p>
          )}
        </div>
      </div>

      {/* Requirements */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Requirements *
          </label>
          <button
            type="button"
            onClick={addRequirement}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <Plus size={16} /> Add Requirement
          </button>
        </div>

        <div className="space-y-2">
          {requirements.map((req, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={req}
                onChange={(e) => updateRequirement(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Requirement ${index + 1}`}
              />
              {requirements.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRequirement(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                  title="Remove requirement"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.requirements && (
          <p className="mt-1 text-sm text-red-600">
            {errors.requirements.message}
          </p>
        )}
      </div>

      {/* Timeline */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Timeline (days) *
        </label>
        <input
          type="number"
          {...register("timelineDays", { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.timelineDays && (
          <p className="mt-1 text-sm text-red-600">
            {errors.timelineDays.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        {isEditMode && (
          <button
            type="button"
            onClick={() =>
              (window.location.href = `/briefs/${initialData?.id}`)
            }
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {isEditMode ? "Saving..." : "Creating..."}
            </>
          ) : (
            <>
              <Save size={18} />
              {isEditMode ? "Save Changes" : "Create Brief"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
