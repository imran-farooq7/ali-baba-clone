// components/manufacturer/CapabilitySetupForm.tsx
"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Check,
  X,
  Upload,
  Tag,
  Globe,
  Package,
  Settings,
  Award,
  Briefcase,
  Factory,
  Cpu,
  Wrench,
  Zap,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { Capability, Certification, CompanyInfo } from "@/lib/types";

export default function CapabilitySetupForm({
  manufacturerId,
}: {
  manufacturerId: string;
}) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [capabilities, setCapabilities] = useState<Capability[]>([
    {
      id: "1",
      name: "CNC Machining",
      description: "Precision CNC milling and turning with 0.001mm tolerance",
      category: "machining",
      experienceLevel: "expert",
    },
    {
      id: "2",
      name: "3D Printing",
      description: "SLA, FDM, and SLS 3D printing services",
      category: "additive",
      experienceLevel: "expert",
    },
    {
      id: "3",
      name: "Injection Molding",
      description: "Plastic injection molding up to 500 tons",
      category: "molding",
      experienceLevel: "intermediate",
    },
  ]);

  const [certifications, setCertifications] = useState<Certification[]>([
    {
      id: "1",
      name: "ISO 9001:2015",
      issuingAuthority: "International Organization for Standardization",
      issueDate: "2023-01-15",
      expiryDate: "2026-01-15",
      fileUrl: "/certificates/iso-9001.pdf",
    },
  ]);

  const [newCapability, setNewCapability] = useState({
    name: "",
    description: "",
    category: "",
    experienceLevel: "intermediate" as "beginner" | "intermediate" | "expert",
  });

  const [newCertification, setNewCertification] = useState({
    name: "",
    issuingAuthority: "",
    issueDate: "",
    expiryDate: "",
    file: null as File | null,
  });

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    companyName: "",
    website: "",
    employees: "",
    foundedYear: "",
    minOrderQuantity: "",
    maxOrderQuantity: "",
    productionCapacity: "",
    locations: [""],
    industries: ["electronics", "automotive", "medical"],
    description: "",
  });

  // Add capability
  const addCapability = () => {
    if (!newCapability.name.trim() || !newCapability.category.trim()) {
      alert("Please fill in capability name and category");
      return;
    }

    const newCap: Capability = {
      id: Date.now().toString(),
      name: newCapability.name,
      description: newCapability.description,
      category: newCapability.category,
      experienceLevel: newCapability.experienceLevel,
    };

    setCapabilities([...capabilities, newCap]);
    setNewCapability({
      name: "",
      description: "",
      category: "",
      experienceLevel: "intermediate",
    });
  };

  // Remove capability
  const removeCapability = (id: string) => {
    if (confirm("Are you sure you want to remove this capability?")) {
      setCapabilities(capabilities.filter((c) => c.id !== id));
    }
  };

  // Add certification
  const addCertification = async () => {
    if (
      !newCertification.name.trim() ||
      !newCertification.issuingAuthority.trim()
    ) {
      alert("Please fill in certification name and issuing authority");
      return;
    }

    // In real app, upload file to Supabase Storage
    const certification: Certification = {
      id: Date.now().toString(),
      name: newCertification.name,
      issuingAuthority: newCertification.issuingAuthority,
      issueDate: newCertification.issueDate,
      expiryDate: newCertification.expiryDate || undefined,
      fileUrl: newCertification.file
        ? URL.createObjectURL(newCertification.file)
        : undefined,
    };

    setCertifications([...certifications, certification]);
    setNewCertification({
      name: "",
      issuingAuthority: "",
      issueDate: "",
      expiryDate: "",
      file: null,
    });
  };

  // Remove certification
  const removeCertification = (id: string) => {
    if (confirm("Are you sure you want to remove this certification?")) {
      setCertifications(certifications.filter((c) => c.id !== id));
    }
  };

  // Update company info
  const updateCompanyInfo = (field: keyof CompanyInfo, value: any) => {
    setCompanyInfo({ ...companyInfo, [field]: value });
  };

  // Add location
  const addLocation = () => {
    setCompanyInfo({
      ...companyInfo,
      locations: [...companyInfo.locations, ""],
    });
  };

  // Update location
  const updateLocation = (index: number, value: string) => {
    const newLocations = [...companyInfo.locations];
    newLocations[index] = value;
    setCompanyInfo({ ...companyInfo, locations: newLocations });
  };

  // Remove location
  const removeLocation = (index: number) => {
    const newLocations = companyInfo.locations.filter((_, i) => i !== index);
    setCompanyInfo({ ...companyInfo, locations: newLocations });
  };

  // Add industry
  const toggleIndustry = (industry: string) => {
    const currentIndustries = [...companyInfo.industries];
    if (currentIndustries.includes(industry)) {
      setCompanyInfo({
        ...companyInfo,
        industries: currentIndustries.filter((i) => i !== industry),
      });
    } else {
      setCompanyInfo({
        ...companyInfo,
        industries: [...currentIndustries, industry],
      });
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "machining":
        return <Cpu className="h-5 w-5" />;
      case "additive":
        return <Zap className="h-5 w-5" />;
      case "molding":
        return <Factory className="h-5 w-5" />;
      case "assembly":
        return <Wrench className="h-5 w-5" />;
      case "finishing":
        return <Settings className="h-5 w-5" />;
      default:
        return <Briefcase className="h-5 w-5" />;
    }
  };

  // Get experience level color
  const getExperienceColor = (level: string) => {
    switch (level) {
      case "expert":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-blue-100 text-blue-800";
      case "beginner":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Submit form
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/manufacturers/capabilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manufacturerId,
          capabilities,
          certifications,
          companyInfo,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Capabilities updated successfully!");
        // Move to success step or redirect
        setStep(4);
      } else {
        alert(data.error || "Failed to update capabilities");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to update capabilities. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Available industries
  const availableIndustries = [
    "electronics",
    "automotive",
    "medical",
    "aerospace",
    "consumer goods",
    "industrial",
    "packaging",
    "textiles",
    "furniture",
    "construction",
    "energy",
    "defense",
  ];

  // Available capability categories
  const capabilityCategories = [
    "machining",
    "additive",
    "molding",
    "casting",
    "assembly",
    "finishing",
    "testing",
    "packaging",
    "electronics",
    "textiles",
    "woodworking",
    "metalworking",
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Stepper */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    step === stepNum
                      ? "bg-green-600 text-white"
                      : step > stepNum
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {step > stepNum ? <Check className="h-4 w-4" /> : stepNum}
                </div>
                {stepNum < 4 && (
                  <div
                    className={`h-1 w-12 mx-2 ${
                      step > stepNum ? "bg-green-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-sm text-gray-500">Step {step} of 4</div>
        </div>
        <div className="flex justify-between mt-4 text-sm">
          <span
            className={
              step >= 1 ? "text-green-600 font-medium" : "text-gray-500"
            }
          >
            Company Info
          </span>
          <span
            className={
              step >= 2 ? "text-green-600 font-medium" : "text-gray-500"
            }
          >
            Capabilities
          </span>
          <span
            className={
              step >= 3 ? "text-green-600 font-medium" : "text-gray-500"
            }
          >
            Certifications
          </span>
          <span
            className={
              step >= 4 ? "text-green-600 font-medium" : "text-gray-500"
            }
          >
            Complete
          </span>
        </div>
      </div>

      {/* Form content */}
      <div className="p-6">
        {step === 1 && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Company Information
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Tell us about your manufacturing company
              </p>
            </div>

            {/* Company Details */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={companyInfo.companyName}
                    onChange={(e) =>
                      updateCompanyInfo("companyName", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Your manufacturing company"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={companyInfo.website}
                    onChange={(e) =>
                      updateCompanyInfo("website", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Employees *
                  </label>
                  <select
                    value={companyInfo.employees}
                    onChange={(e) =>
                      updateCompanyInfo("employees", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select range</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1001+">1001+ employees</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year Founded *
                  </label>
                  <input
                    type="number"
                    value={companyInfo.foundedYear}
                    onChange={(e) =>
                      updateCompanyInfo("foundedYear", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="1990"
                    min="1900"
                    max={new Date().getFullYear()}
                    required
                  />
                </div>
              </div>

              {/* Company Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Description *
                </label>
                <textarea
                  value={companyInfo.description}
                  onChange={(e) =>
                    updateCompanyInfo("description", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Describe your company, expertise, and values..."
                  rows={4}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be visible to brands on your profile
                </p>
              </div>

              {/* Industries */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Industries You Serve *
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableIndustries.map((industry) => (
                    <button
                      key={industry}
                      type="button"
                      onClick={() => toggleIndustry(industry)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        companyInfo.industries.includes(industry)
                          ? "bg-green-100 text-green-800 border border-green-300"
                          : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      {industry.charAt(0).toUpperCase() + industry.slice(1)}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Select all industries you have experience serving
                </p>
              </div>

              {/* Production capacity */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700">
                  Production Capacity
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Min Order Quantity
                    </label>
                    <input
                      type="number"
                      value={companyInfo.minOrderQuantity}
                      onChange={(e) =>
                        updateCompanyInfo("minOrderQuantity", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                      placeholder="100"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Max Order Quantity
                    </label>
                    <input
                      type="number"
                      value={companyInfo.maxOrderQuantity}
                      onChange={(e) =>
                        updateCompanyInfo("maxOrderQuantity", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                      placeholder="10000"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Monthly Production Capacity
                    </label>
                    <input
                      type="number"
                      value={companyInfo.productionCapacity}
                      onChange={(e) =>
                        updateCompanyInfo("productionCapacity", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                      placeholder="50000"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* Locations */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Manufacturing Locations *
                  </label>
                  <button
                    type="button"
                    onClick={addLocation}
                    className="text-sm text-green-600 hover:text-green-800 flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Add Location
                  </button>
                </div>

                <div className="space-y-3">
                  {companyInfo.locations.map((location, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => updateLocation(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                        placeholder="City, Country"
                        required
                      />
                      {companyInfo.locations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLocation(index)}
                          className="px-3 py-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Manufacturing Capabilities
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Add your manufacturing capabilities and expertise
              </p>
            </div>

            {/* Add new capability */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-4">
                Add New Capability
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Capability Name *
                    </label>
                    <input
                      type="text"
                      value={newCapability.name}
                      onChange={(e) =>
                        setNewCapability({
                          ...newCapability,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., CNC Machining, 3D Printing"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Category *
                    </label>
                    <select
                      value={newCapability.category}
                      onChange={(e) =>
                        setNewCapability({
                          ...newCapability,
                          category: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select category</option>
                      {capabilityCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Experience Level
                    </label>
                    <select
                      value={newCapability.experienceLevel}
                      onChange={(e) =>
                        setNewCapability({
                          ...newCapability,
                          experienceLevel: e.target.value as
                            | "beginner"
                            | "intermediate"
                            | "expert",
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                    >
                      <option value="beginner">Beginner (1-2 years)</option>
                      <option value="intermediate">
                        Intermediate (3-5 years)
                      </option>
                      <option value="expert">Expert (5+ years)</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={addCapability}
                      disabled={!newCapability.name || !newCapability.category}
                      className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Capability
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newCapability.description}
                    onChange={(e) =>
                      setNewCapability({
                        ...newCapability,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                    placeholder="Describe this capability in detail..."
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Capabilities list */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-medium text-gray-700">
                  Your Capabilities ({capabilities.length})
                </h4>
                <p className="text-xs text-gray-500">
                  Brands will match with you based on these capabilities
                </p>
              </div>

              {capabilities.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No capabilities added yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Add your first capability above
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {capabilities.map((capability) => (
                    <div
                      key={capability.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-green-50 rounded-lg">
                            {getCategoryIcon(capability.category)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h5 className="font-medium text-gray-900">
                                {capability.name}
                              </h5>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${getExperienceColor(
                                  capability.experienceLevel
                                )}`}
                              >
                                {capability.experienceLevel}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {capability.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {capability.category}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeCapability(capability.id)}
                          className="text-gray-400 hover:text-red-600"
                          title="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Certifications & Quality Standards
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Add certifications to build trust with brands
              </p>
            </div>

            {/* Add new certification */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-4">
                Add Certification
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Certification Name *
                    </label>
                    <input
                      type="text"
                      value={newCertification.name}
                      onChange={(e) =>
                        setNewCertification({
                          ...newCertification,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., ISO 9001:2015"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Issuing Authority *
                    </label>
                    <input
                      type="text"
                      value={newCertification.issuingAuthority}
                      onChange={(e) =>
                        setNewCertification({
                          ...newCertification,
                          issuingAuthority: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., International Organization for Standardization"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Issue Date *
                    </label>
                    <input
                      type="date"
                      value={newCertification.issueDate}
                      onChange={(e) =>
                        setNewCertification({
                          ...newCertification,
                          issueDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Expiry Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={newCertification.expiryDate}
                      onChange={(e) =>
                        setNewCertification({
                          ...newCertification,
                          expiryDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                {/* File upload */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Upload Certificate (Optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="file"
                        onChange={(e) =>
                          setNewCertification({
                            ...newCertification,
                            file: e.target.files?.[0] || null,
                          })
                        }
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Click to upload certificate
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PDF, JPG, PNG, DOC up to 10MB
                        </p>
                      </div>
                    </label>
                    {newCertification.file && (
                      <div className="text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 inline mr-2" />
                        {newCertification.file.name}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={addCertification}
                  disabled={
                    !newCertification.name ||
                    !newCertification.issuingAuthority ||
                    !newCertification.issueDate
                  }
                  className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Certification
                </button>
              </div>
            </div>

            {/* Certifications list */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-medium text-gray-700">
                  Your Certifications ({certifications.length})
                </h4>
                <p className="text-xs text-gray-500">
                  Certifications increase your credibility with brands
                </p>
              </div>

              {certifications.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Award className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No certifications added yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Add your first certification above
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {certifications.map((cert) => (
                    <div
                      key={cert.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-green-50 rounded-lg">
                            <Award className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">
                              {cert.name}
                            </h5>
                            <p className="text-sm text-gray-600 mt-1">
                              Issued by: {cert.issuingAuthority}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-gray-500">
                                Issued:{" "}
                                {new Date(cert.issueDate).toLocaleDateString()}
                              </span>
                              {cert.expiryDate && (
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    new Date(cert.expiryDate) > new Date()
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {new Date(cert.expiryDate) > new Date()
                                    ? "Valid"
                                    : "Expired"}
                                  :{" "}
                                  {new Date(
                                    cert.expiryDate
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            {cert.fileUrl && (
                              <a
                                href={cert.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-800 mt-2"
                              >
                                <Upload className="h-3 w-3" />
                                View Certificate
                              </a>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeCertification(cert.id)}
                          className="text-gray-400 hover:text-red-600"
                          title="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-medium text-gray-900 mb-2">
              Setup Complete!
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Your manufacturer profile has been successfully set up. Brands can
              now discover you and invite you to bid on their projects.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-blue-50 rounded-lg">
                <Briefcase className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-medium">Browse Briefs</p>
                <p className="text-sm text-gray-600">
                  Find projects matching your capabilities
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <Factory className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium">Get Verified</p>
                <p className="text-sm text-gray-600">
                  Increase trust with quality certifications
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="font-medium">Start Earning</p>
                <p className="text-sm text-gray-600">
                  Submit proposals and win projects
                </p>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50"
              >
                Edit Profile
              </button>
              <a
                href="/manufacturer/briefs"
                className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
              >
                Browse Available Briefs
              </a>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        {step < 4 && (
          <div className="flex justify-between pt-8 border-t border-gray-200">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-5 py-2.5 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
              >
                ← Previous
              </button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
              >
                Continue to Next Step →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Complete Setup"
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
