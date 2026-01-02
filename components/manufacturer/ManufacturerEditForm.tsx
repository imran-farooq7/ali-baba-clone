"use client";

import { Capability, Certification } from "@/lib/types";
import { AlertCircle, Plus, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ManufacturerEditFormProps {
  manufacturer: any;
}

export default function ManufacturerEditForm({
  manufacturer,
}: ManufacturerEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: manufacturer.name || "",
    company: manufacturer.company || "",
    avatar: manufacturer.avatar || "",
    website: manufacturer.website || "",
    description: manufacturer.description || "",
    capabilities: manufacturer.capabilities || [],
    certifications: manufacturer.certifications || [],
    minOrderQuantity: manufacturer.minOrderQuantity || "",
    maxOrderQuantity: manufacturer.maxOrderQuantity || "",
    productionCapacity: manufacturer.productionCapacity || "",
    locations: manufacturer.locations || [],
    industries: manufacturer.industries || [],
  });

  const [newCapability, setNewCapability] = useState("");
  const [newCertification, setNewCertification] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newIndustry, setNewIndustry] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/manufacturers/${manufacturer.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          minOrderQuantity: formData.minOrderQuantity
            ? parseInt(formData.minOrderQuantity as string)
            : undefined,
          maxOrderQuantity: formData.maxOrderQuantity
            ? parseInt(formData.maxOrderQuantity as string)
            : undefined,
          productionCapacity: formData.productionCapacity
            ? parseInt(formData.productionCapacity as string)
            : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setSuccess(true);
      setTimeout(() => {
        router.refresh();
        router.push("/manufacturer/profile");
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addCapability = () => {
    if (
      newCapability.trim() &&
      !formData.capabilities.includes(newCapability.trim())
    ) {
      setFormData({
        ...formData,
        capabilities: [...formData.capabilities, newCapability.trim()],
      });
      setNewCapability("");
    }
  };

  const removeCapability = (index: number) => {
    setFormData({
      ...formData,
      capabilities: formData.capabilities.filter(
        (_: any, i: number) => i !== index
      ),
    });
  };

  const addCertification = () => {
    if (
      newCertification.trim() &&
      !formData.certifications.includes(newCertification.trim())
    ) {
      setFormData({
        ...formData,
        certifications: [...formData.certifications, newCertification.trim()],
      });
      setNewCertification("");
    }
  };

  const removeCertification = (index: number) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter(
        (_: any, i: number) => i !== index
      ),
    });
  };

  const addLocation = () => {
    if (
      newLocation.trim() &&
      !formData.locations.includes(newLocation.trim())
    ) {
      setFormData({
        ...formData,
        locations: [...formData.locations, newLocation.trim()],
      });
      setNewLocation("");
    }
  };

  const removeLocation = (index: number) => {
    setFormData({
      ...formData,
      locations: formData.locations.filter((_: any, i: number) => i !== index),
    });
  };

  const addIndustry = () => {
    if (
      newIndustry.trim() &&
      !formData.industries.includes(newIndustry.trim())
    ) {
      setFormData({
        ...formData,
        industries: [...formData.industries, newIndustry.trim()],
      });
      setNewIndustry("");
    }
  };

  const removeIndustry = (index: number) => {
    setFormData({
      ...formData,
      industries: formData.industries.filter(
        (_: any, i: number) => i !== index
      ),
    });
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
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
          <p className="font-medium text-green-800">
            Profile updated successfully! Redirecting...
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avatar URL
              </label>
              <input
                type="url"
                value={formData.avatar}
                onChange={(e) =>
                  setFormData({ ...formData, avatar: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe your manufacturing company, expertise, and values..."
            />
          </div>
        </div>

        {/* Capabilities */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Capabilities</h3>

          <div className="flex gap-2">
            <input
              type="text"
              value={newCapability}
              onChange={(e) => setNewCapability(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), addCapability())
              }
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add a capability (e.g., CNC Machining)"
            />
            <button
              type="button"
              onClick={addCapability}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {formData.capabilities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.capabilities.map(
                (capability: Capability, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg"
                  >
                    {capability.name}
                    <button
                      type="button"
                      onClick={() => removeCapability(index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                )
              )}
            </div>
          )}
        </div>

        {/* Certifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Certifications</h3>

          <div className="flex gap-2">
            <input
              type="text"
              value={newCertification}
              onChange={(e) => setNewCertification(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), addCertification())
              }
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add a certification (e.g., ISO 9001)"
            />
            <button
              type="button"
              onClick={addCertification}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {formData.certifications.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.certifications.map(
                (certification: Certification, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg"
                  >
                    {certification.name}
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                )
              )}
            </div>
          )}
        </div>

        {/* Production Details */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">
            Production Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Order Quantity
              </label>
              <input
                type="number"
                min="0"
                value={formData.minOrderQuantity}
                onChange={(e) =>
                  setFormData({ ...formData, minOrderQuantity: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 1000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Order Quantity
              </label>
              <input
                type="number"
                min="0"
                value={formData.maxOrderQuantity}
                onChange={(e) =>
                  setFormData({ ...formData, maxOrderQuantity: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 50000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Production Capacity
              </label>
              <input
                type="number"
                min="0"
                value={formData.productionCapacity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    productionCapacity: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 100000"
              />
            </div>
          </div>
        </div>

        {/* Locations */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Manufacturing Locations
          </h3>

          <div className="flex gap-2">
            <input
              type="text"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), addLocation())
              }
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add a location (e.g., Shanghai, China)"
            />
            <button
              type="button"
              onClick={addLocation}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {formData.locations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.locations.map((location: any, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-800 rounded-lg"
                >
                  {location}
                  <button
                    type="button"
                    onClick={() => removeLocation(index)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Industries */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Industries Served
          </h3>

          <div className="flex gap-2">
            <input
              type="text"
              value={newIndustry}
              onChange={(e) => setNewIndustry(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), addIndustry())
              }
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add an industry (e.g., Automotive)"
            />
            <button
              type="button"
              onClick={addIndustry}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {formData.industries.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.industries.map((industry: any, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-100 text-indigo-800 rounded-lg"
                >
                  {industry}
                  <button
                    type="button"
                    onClick={() => removeIndustry(index)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              "Saving..."
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
