// components/brand/BriefList.tsx
"use client";

import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  Briefcase,
  Calendar,
  CheckCircle,
  Edit,
  Eye,
  Package,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import BriefStatusBadge from "./BriefStatusBadge";
import { Status } from "@/app/generated/prisma/enums";

interface Brief {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  quantity: number;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
  proposals: Array<{
    id: string;
    status: string;
  }>;
  _count?: {
    proposals: number;
  };
}

interface BriefListProps {
  briefs: Brief[];
  brandId: string;
}

export default function BriefList({ briefs, brandId }: BriefListProps) {
  const [selectedBriefs, setSelectedBriefs] = useState<string[]>([]);

  // Delete brief
  const handleDeleteBrief = async (briefId: string) => {
    if (!confirm("Are you sure you want to delete this brief?")) return;

    try {
      const response = await fetch(`/api/briefs/${briefId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh the page after deletion
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting brief:", error);
      alert("Failed to delete brief");
    }
  };

  // Update brief status
  const handleUpdateStatus = async (briefId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/briefs/${briefId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  // Toggle brief selection
  const toggleBriefSelection = (briefId: string) => {
    setSelectedBriefs((prev) =>
      prev.includes(briefId)
        ? prev.filter((id) => id !== briefId)
        : [...prev, briefId]
    );
  };

  // Select all briefs
  const toggleSelectAll = () => {
    if (selectedBriefs.length === briefs.length) {
      setSelectedBriefs([]);
    } else {
      setSelectedBriefs(briefs.map((b) => b.id));
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get proposal count
  const getProposalCount = (brief: Brief) => {
    return brief._count?.proposals || brief.proposals?.length || 0;
  };

  // Get active proposals count
  const getActiveProposalsCount = (brief: Brief) => {
    return brief.proposals?.filter((p) => p.status === "pending").length || 0;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your Briefs</h2>
            <p className="text-sm text-gray-500">
              {briefs.length} brief{briefs.length !== 1 ? "s" : ""} •{" "}
              {briefs.filter((b) => b.status === "PUBLISHED").length} active
            </p>
          </div>

          <div>
            <Link
              href="/brand/briefs/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
            >
              Create New Brief
            </Link>
          </div>
        </div>

        {/* Bulk actions */}
        {selectedBriefs.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedBriefs.length > 0}
                onChange={toggleSelectAll}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                {selectedBriefs.length} brief
                {selectedBriefs.length !== 1 ? "s" : ""} selected
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  selectedBriefs.forEach((id) =>
                    handleUpdateStatus(id, "published")
                  )
                }
                className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
              >
                Publish Selected
              </button>
              <button
                onClick={() =>
                  selectedBriefs.forEach((id) => handleDeleteBrief(id))
                }
                className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Briefs table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={
                    briefs.length > 0 && selectedBriefs.length === briefs.length
                  }
                  onChange={toggleSelectAll}
                  className="h-4 w-4 text-blue-600 rounded"
                />
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Brief Details
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Budget
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Proposals
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Created
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {briefs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="text-gray-400">
                    <Briefcase className="mx-auto h-12 w-12" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No briefs found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by creating your first brief
                    </p>
                    <div className="mt-6">
                      <Link
                        href="/brand/briefs/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Create Your First Brief
                      </Link>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              briefs.map((brief) => (
                <tr key={brief.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedBriefs.includes(brief.id)}
                      onChange={() => toggleBriefSelection(brief.id)}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          <Link
                            href={`/brand/briefs/${brief.id}`}
                            className="hover:text-blue-600"
                          >
                            {brief.title}
                          </Link>
                        </div>
                        <div className="text-sm text-gray-500">
                          {brief.category}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 flex items-center">
                          <Package className="h-3 w-3 mr-1" />
                          {brief.quantity.toLocaleString()} units
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <BriefStatusBadge status={brief.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(brief.budget)}
                    </div>
                    <div className="text-xs text-gray-500">Budget</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        {getProposalCount(brief)}
                      </div>
                      {getActiveProposalsCount(brief) > 0 && (
                        <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          {getActiveProposalsCount(brief)} new
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">Total proposals</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {formatDistanceToNow(new Date(brief.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <Link
                        href={`/brand/briefs/${brief.id}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      {brief.status === "DRAFT" && (
                        <>
                          <Link
                            href={`/brand/briefs/${brief.id}/edit`}
                            className="text-gray-600 hover:text-gray-900"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() =>
                              handleUpdateStatus(brief.id, "published")
                            }
                            className="text-green-600 hover:text-green-900"
                            title="Publish"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {brief.status === "PUBLISHED" && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(brief.id, "cancelled")
                          }
                          className="text-red-600 hover:text-red-900"
                          title="Cancel"
                        >
                          <AlertCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteBrief(brief.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
