// app/(brand)/briefs/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  Calendar,
  DollarSign,
  MapPin,
  Package,
  Tag,
  Clock,
  FileText,
  Eye,
  MessageSquare,
  Download,
  CheckCircle,
  XCircle,
  Edit,
  Share2,
  Copy,
  Archive,
  BarChart,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
// import BriefActions from "@/components/briefs/BriefActions";
import { prisma } from "@/prisma/prisma";
import { BriefStatus } from "@/lib/generated/prisma/enums";
import BriefStatusBadge from "@/components/brand/BriefStatusBadge";
import ProposalsSection from "@/components/brand/ProposalsSection";
import AnalyticsSection from "@/components/brand/AnalyticsSection";
import ChatButton from "@/components/chat/ui/Chat-button";
import BriefAIAssistant from "@/components/brand/ai/BriefAIAssistant";

interface BriefDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BriefDetailPage({
  params,
}: BriefDetailPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }
  const { id } = await params;
  // Fetch brief with all related data
  const brief = await prisma.brief.findUnique({
    where: {
      id: id,
      brandId: user.id, // Ensure brand owns this brief
    },
    include: {
      brand: {
        select: {
          id: true,
          name: true,
          email: true,
          company: true,
          avatar: true,
        },
      },
      manufacturer: {
        select: {
          id: true,
          name: true,
          email: true,
          company: true,
          avatar: true,
        },
      },
      proposals: {
        include: {
          manufacturer: {
            select: {
              id: true,
              name: true,
              company: true,
              avatar: true,
              verified: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          proposals: true,
          bookmarkedBy: true,
        },
      },
    },
  });

  if (!brief) {
    notFound();
  }

  // Calculate analytics
  const analytics = {
    totalProposals: brief.proposals.length,
    acceptedProposals: brief.proposals.filter((p) => p.status === "ACCEPTED")
      .length,
    pendingProposals: brief.proposals.filter((p) =>
      ["DRAFT", "SUBMITTED", "UNDER_REVIEW"].includes(p.status)
    ).length,
    averagePrice:
      brief.proposals.length > 0
        ? brief.proposals.reduce((sum, p) => sum + p.price, 0) /
          brief.proposals.length
        : 0,
    daysSincePublished: brief.publishedAt
      ? formatDistanceToNow(new Date(brief.publishedAt), { addSuffix: true })
      : null,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                <Link href="/brand/dashboard" className="hover:text-blue-600">
                  Dashboard
                </Link>
                <span>/</span>
                <Link href="/brand/briefs" className="hover:text-blue-600">
                  Briefs
                </Link>
                <span>/</span>
                <span className="text-gray-700 truncate max-w-50">
                  {brief.title}
                </span>
              </nav>

              <div className="flex items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {brief.title}
                </h1>
                <BriefStatusBadge status={brief.status} />
              </div>

              <div className="flex items-center gap-6 mt-3 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Created {format(new Date(brief.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
                {brief.publishedAt && (
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>Published {analytics.daysSincePublished}</span>
                  </div>
                )}
              </div>
            </div>

            {/* <BriefActions brief={brief} /> */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Brief Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description Card */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Brief Details
                </h2>
                <button className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg">
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-700 whitespace-pre-line">
                    {brief.description}
                  </p>
                </div>

                {brief.aiEnhancedDescription && (
                  <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1 bg-blue-100 rounded">
                        <BarChart className="h-4 w-4 text-blue-600" />
                      </div>
                      <h4 className="text-sm font-medium text-blue-900">
                        AI-Enhanced Description
                      </h4>
                    </div>
                    <p className="text-blue-800 text-sm">
                      {brief.aiEnhancedDescription}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Requirements Card */}
            {brief.requirements &&
              Array.isArray(brief.requirements) &&
              brief.requirements.length > 0 && (
                <div className="bg-white rounded-xl border shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Requirements
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(brief.requirements as any[]).map(
                      (req: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 border rounded-lg"
                        >
                          <div className="p-2 bg-gray-100 rounded">
                            <CheckCircle className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 capitalize">
                              {req.type}
                            </h4>
                            <p className="text-sm text-gray-600">{req.value}</p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Proposals Section */}
            <ProposalsSection brief={brief} proposals={brief.proposals} />

            {/* Attachments */}
            {brief.attachments && brief.attachments.length > 0 && (
              <div className="bg-white rounded-xl border shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Attachments
                </h2>
                <div className="space-y-3">
                  {brief.attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded">
                          <FileText className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Attachment {index + 1}
                          </p>
                          <p className="text-sm text-gray-500 truncate max-w-75">
                            {attachment.split("/").pop()}
                          </p>
                        </div>
                      </div>
                      <Download className="h-4 w-4 text-gray-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <BriefAIAssistant briefData={brief} briefId={brief.id} />
            {/* Stats Card */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Stats
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Proposals</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {analytics.totalProposals}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Accepted</p>
                    <p className="text-xl font-semibold text-green-600">
                      {analytics.acceptedProposals}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm text-gray-500">Budget</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ${brief.budget.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm text-gray-500">Quantity</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {brief.quantity.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Details Card */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Brief Details
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded">
                    <Tag className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium text-gray-900">
                      {brief.category}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded">
                    <DollarSign className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Budget Range</p>
                    <p className="font-medium text-gray-900">
                      ${brief.budgetRangeMin?.toLocaleString() || "N/A"} - $
                      {brief.budgetRangeMax?.toLocaleString() || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded">
                    <Package className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Quantity</p>
                    <p className="font-medium text-gray-900">
                      {brief.quantity.toLocaleString()} units
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded">
                    <Clock className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Timeline</p>
                    <p className="font-medium text-gray-900">
                      {brief.timelineDays} days
                    </p>
                  </div>
                </div>

                {brief.location && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded">
                      <MapPin className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Preferred Location
                      </p>
                      <p className="font-medium text-gray-900">
                        {brief.location}
                      </p>
                    </div>
                  </div>
                )}

                {brief.expiresAt && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded">
                      <Calendar className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Expires</p>
                      <p className="font-medium text-gray-900">
                        {format(new Date(brief.expiresAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Brand Info */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Brand Information
              </h2>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  {brief.brand.avatar ? (
                    <img
                      src={brief.brand.avatar}
                      alt={brief.brand.name}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <span className="text-blue-600 font-semibold">
                      {brief.brand.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {brief.brand.name}
                  </p>
                  <p className="text-sm text-gray-500">{brief.brand.company}</p>
                  <p className="text-sm text-gray-500">{brief.brand.email}</p>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <ChatButton
                  briefId={brief.id}
                  participants={brief.proposals.map((p) => p.manufacturer.id)}
                  title={`Chat for ${brief.title}`}
                  className="w-full justify-center"
                />

                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  <Share2 className="h-4 w-4" />
                  Share Brief
                </button>

                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  <Copy className="h-4 w-4" />
                  Duplicate Brief
                </button>

                {brief.status !== BriefStatus.ARCHIVED && (
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                    <Archive className="h-4 w-4" />
                    Archive Brief
                  </button>
                )}
              </div>
            </div>

            {/* Analytics Card */}
            <AnalyticsSection analytics={analytics} />
          </div>
        </div>
      </div>
    </div>
  );
}
