import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ProposalStatus } from "@/lib/generated/prisma/enums";

// GET /api/proposals/[id] - Get single proposal
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        brief: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            quantity: true,
            budget: true,
            timelineDays: true,
            location: true,
            requirements: true,
            attachments: true,
            status: true,
            brand: {
              select: {
                id: true,
                name: true,
                company: true,
                avatar: true,
                email: true,
              },
            },
          },
        },
        manufacturer: {
          select: {
            id: true,
            name: true,
            company: true,
            avatar: true,
            email: true,
            verified: true,
            capabilities: true,
            certifications: true,
            description: true,
            website: true,
            locations: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            company: true,
            avatar: true,
            email: true,
          },
        },
        counterProposal: {
          select: {
            id: true,
            message: true,
            price: true,
            timelineDays: true,
            terms: true,
            status: true,
            createdAt: true,
            manufacturer: {
              select: {
                name: true,
                company: true,
                avatar: true,
              },
            },
          },
        },
        originalProposal: {
          select: {
            id: true,
            message: true,
            price: true,
            timelineDays: true,
            terms: true,
            status: true,
            createdAt: true,
          },
        },
        conversation: {
          select: {
            id: true,
            title: true,
            lastMessageAt: true,
            participants: {
              select: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to view this proposal
    const hasPermission =
      user.type === "ADMIN" ||
      user.id === proposal.manufacturerId ||
      user.id === proposal.brandId;

    if (!hasPermission) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if user has bookmarked this manufacturer
    let isManufacturerBookmarked = false;
    if (user.type === "BRAND") {
      const bookmark = await prisma.bookmark.findUnique({
        where: {
          userId_manufacturerId: {
            userId: user.id,
            manufacturerId: proposal.manufacturerId,
          },
        },
      });
      isManufacturerBookmarked = !!bookmark;
    }

    // Get negotiation history if this is a counter proposal
    let negotiationHistory: {
      id: string;
      type: string;
      status: ProposalStatus;
      price: number;
      timelineDays: number;
      message: string;
      submittedAt: Date;
      by: string;
      user: {
        name: string;
        avatar: string | null;
        company: string | null;
      };
    }[] = [];
    if (proposal.counterProposalId) {
      negotiationHistory = await getNegotiationHistory(proposal.id);
    }

    return NextResponse.json({
      ...proposal,
      permissions: {
        canEdit:
          user.id === proposal.manufacturerId && proposal.status === "DRAFT",
        canSubmit:
          user.id === proposal.manufacturerId && proposal.status === "DRAFT",
        canWithdraw:
          user.id === proposal.manufacturerId &&
          ["DRAFT", "SUBMITTED", "UNDER_REVIEW"].includes(proposal.status),
        canReview:
          user.id === proposal.brandId &&
          ["SUBMITTED", "UNDER_REVIEW", "NEGOTIATION"].includes(
            proposal.status
          ),
        canCounter:
          user.id === proposal.brandId &&
          ["SUBMITTED", "UNDER_REVIEW", "NEGOTIATION"].includes(
            proposal.status
          ),
        canAccept:
          user.id === proposal.brandId &&
          ["SUBMITTED", "UNDER_REVIEW", "NEGOTIATION", "COUNTERED"].includes(
            proposal.status
          ),
        canReject:
          user.id === proposal.brandId &&
          ["SUBMITTED", "UNDER_REVIEW", "NEGOTIATION", "COUNTERED"].includes(
            proposal.status
          ),
      },
      isManufacturerBookmarked,
      negotiationHistory,
    });
  } catch (error: any) {
    console.error("Proposal fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch proposal", details: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/proposals/[id] - Update proposal
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await getCurrentUser();
    const data = await request.json();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if proposal exists and user has permission
    const existingProposal = await prisma.proposal.findUnique({
      where: { id },
    });

    if (!existingProposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    // Only manufacturer can update their own proposal (when in DRAFT)
    if (
      user.id !== existingProposal.manufacturerId ||
      existingProposal.status !== "DRAFT"
    ) {
      return NextResponse.json(
        { error: "You can only update draft proposals" },
        { status: 403 }
      );
    }

    // Allowed updates for draft proposals
    const allowedUpdates = {
      message: data.message,
      price: data.price ? parseFloat(data.price) : undefined,
      timelineDays: data.timelineDays ? parseInt(data.timelineDays) : undefined,
      terms: data.terms,
      attachments: data.attachments,
    };

    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(allowedUpdates).filter(([_, value]) => value !== undefined)
    );

    const updatedProposal = await prisma.proposal.update({
      where: { id },
      data: cleanUpdates,
      include: {
        brief: {
          select: { title: true },
        },
        manufacturer: {
          select: { name: true, company: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      proposal: updatedProposal,
      message: "Proposal updated successfully",
    });
  } catch (error: any) {
    console.error("Proposal update error:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update proposal", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/proposals/[id] - Delete/withdraw proposal
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const proposal = await prisma.proposal.findUnique({
      where: { id },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    // Check permissions
    const canDelete =
      user.type === "ADMIN" ||
      (user.id === proposal.manufacturerId && proposal.status === "DRAFT");

    if (!canDelete) {
      return NextResponse.json(
        { error: "You can only delete draft proposals" },
        { status: 403 }
      );
    }

    // Actually delete only draft proposals, otherwise mark as withdrawn
    if (proposal.status === "DRAFT") {
      await prisma.proposal.delete({ where: { id } });

      // Decrement brief proposals count
      await prisma.brief.update({
        where: { id: proposal.briefId },
        data: { proposalsCount: { decrement: 1 } },
      });

      return NextResponse.json({
        success: true,
        message: "Proposal deleted successfully",
      });
    } else {
      // Mark as withdrawn
      await prisma.proposal.update({
        where: { id },
        data: { status: "WITHDRAWN" },
      });

      return NextResponse.json({
        success: true,
        message: "Proposal withdrawn successfully",
      });
    }
  } catch (error: any) {
    console.error("Proposal delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete proposal", details: error.message },
      { status: 500 }
    );
  }
}

// Pure function: Get negotiation history
const getNegotiationHistory = async (proposalId: string) => {
  const history = [];
  let currentProposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: {
      manufacturer: {
        select: { name: true, company: true, avatar: true },
      },
      brand: {
        select: { name: true, company: true, avatar: true },
      },
    },
  });

  // Go back through counter proposals
  while (currentProposal) {
    history.unshift({
      id: currentProposal.id,
      type: currentProposal.counterProposalId ? "COUNTER" : "ORIGINAL",
      status: currentProposal.status,
      price: currentProposal.price,
      timelineDays: currentProposal.timelineDays,
      message: currentProposal.message,
      submittedAt: currentProposal.submittedAt || currentProposal.createdAt,
      by: currentProposal.counterProposalId
        ? currentProposal.manufacturerId
          ? "MANUFACTURER"
          : "BRAND"
        : "MANUFACTURER",
      user: currentProposal.counterProposalId
        ? currentProposal.manufacturerId
          ? currentProposal.manufacturer
          : currentProposal.brand
        : currentProposal.manufacturer,
    });

    if (currentProposal.counterProposalId) {
      currentProposal = await prisma.proposal.findUnique({
        where: { id: currentProposal.counterProposalId },
        include: {
          manufacturer: {
            select: { name: true, company: true, avatar: true },
          },
          brand: {
            select: { name: true, company: true, avatar: true },
          },
        },
      });
    } else {
      currentProposal = null;
    }
  }

  return history;
};
