import { getCurrentUser } from "@/lib/auth";
import ProposalCreationForm from "@/components/proposals/ProposalCreationForm";
import { ArrowLeft, FileText, AlertCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/prisma/prisma";

interface NewProposalPageProps {
  searchParams: Promise<{ briefId?: string }>;
}

export default async function NewProposalPage({
  searchParams,
}: NewProposalPageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;

  if (!user || user.type !== "MANUFACTURER") {
    redirect("/auth/login");
  }

  let brief = null;
  if (params.briefId) {
    brief = await prisma.brief.findUnique({
      where: {
        id: params.briefId,
        status: "PUBLISHED",
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            company: true,
            avatar: true,
          },
        },
      },
    });

    // Check if manufacturer already submitted a proposal
    if (brief) {
      const existingProposal = await prisma.proposal.findFirst({
        where: {
          briefId: brief.id,
          manufacturerId: user.id,
          status: { not: "WITHDRAWN" },
        },
      });

      if (existingProposal) {
        redirect(`/manufacturer/proposals/${existingProposal.id}`);
      }
    }
  }

  // Get manufacturer's recent proposals for context
  const recentProposals = await prisma.proposal.findMany({
    where: {
      manufacturerId: user.id,
      status: { in: ["ACCEPTED", "UNDER_REVIEW"] },
    },
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      price: true,
      timelineDays: true,
      status: true,
      brief: {
        select: {
          title: true,
          category: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/manufacturer/proposals"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Proposals
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Create New Proposal
              </h1>
              <p className="text-gray-600 mt-2">
                Submit a detailed proposal to win manufacturing projects
              </p>
            </div>

            <div className="text-sm text-gray-500">
              <FileText className="h-5 w-5 inline mr-1" />
              Draft auto-saved
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-gray-900">
                {recentProposals.filter((p) => p.status === "ACCEPTED").length}
              </div>
              <div className="text-sm text-gray-500">Accepted</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-gray-900">
                {
                  recentProposals.filter((p) => p.status === "UNDER_REVIEW")
                    .length
                }
              </div>
              <div className="text-sm text-gray-500">Under Review</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-gray-900">85%</div>
              <div className="text-sm text-gray-500">Response Rate</div>
            </div>
          </div>
        </div>

        {/* Alert if brief not found */}
        {params.briefId && !brief && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Brief Not Found</p>
                <p className="text-yellow-700 text-sm mt-1">
                  The brief you're trying to propose on may have been removed or
                  is no longer available. You can still create a general
                  proposal.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <ProposalCreationForm
          manufacturerId={user.id}
          brief={brief}
          recentProposals={recentProposals}
        />

        {/* Tips & Guidelines */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">
            Tips for Successful Proposals
          </h3>
          <ul className="space-y-3 text-blue-800">
            <li className="flex items-start gap-3">
              <div className="bg-white p-1 rounded mt-0.5">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              </div>
              <span>Be specific about your capabilities and timeline</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-white p-1 rounded mt-0.5">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              </div>
              <span>Include relevant certifications and quality standards</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-white p-1 rounded mt-0.5">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              </div>
              <span>Break down costs clearly and justify your pricing</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-white p-1 rounded mt-0.5">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              </div>
              <span>Provide examples of similar projects you've completed</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
