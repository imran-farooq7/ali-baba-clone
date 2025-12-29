// app/api/proposals/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/db/prisma";
import { ProposalStatus } from "@/app/generated/prisma/enums";

// GET /api/proposals/[id] - Get single proposal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: proposalId } = await params;

    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        brief: {
          select: {
            id: true,
            title: true,
            description: true,
            budget: true,
            quantity: true,
            category: true,
            status: true,
            brand: {
              select: { id: true, name: true, company: true, avatar: true },
            },
          },
        },
        manufacturer: {
          select: {
            id: true,
            name: true,
            company: true,
            avatar: true,
            capabilities: true,
            certifications: true,
            description: true,
            verified: true,
          },
        },
        brand: {
          select: { id: true, name: true, company: true, avatar: true },
        },
        counterProposal: {
          select: {
            id: true,
            price: true,
            timelineDays: true,
            message: true,
            status: true,
            createdAt: true,
          },
        },
        originalProposal: {
          select: {
            id: true,
            price: true,
            timelineDays: true,
            message: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    // Check permissions
    if (proposal.manufacturerId !== user.id && proposal.brandId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: proposal,
    });
  } catch (error) {
    console.error("Error fetching proposal:", error);
    return NextResponse.json(
      { error: "Failed to fetch proposal" },
      { status: 500 }
    );
  }
}

// PUT /api/proposals/[id] - Update proposal
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: proposalId } = await params;
    const data = await request.json();
    const { message, price, timelineDays, terms, attachments, status } = data;

    // Get existing proposal
    const existingProposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
    });

    if (!existingProposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    // Check permissions (only manufacturer can update their proposal)
    if (existingProposal.manufacturerId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Cannot update submitted/accepted proposals
    if (
      ["SUBMITTED", "ACCEPTED", "REJECTED"].includes(existingProposal.status)
    ) {
      return NextResponse.json(
        { error: "Cannot update proposal in current status" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (message !== undefined) updateData.message = message;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (timelineDays !== undefined)
      updateData.timelineDays = parseInt(timelineDays);
    if (terms !== undefined) updateData.terms = terms;
    if (attachments !== undefined) updateData.attachments = attachments;

    if (status && status !== existingProposal.status) {
      updateData.status = status as ProposalStatus;
      if (status === "SUBMITTED") {
        updateData.submittedAt = new Date();
      }
    }

    const proposal = await prisma.proposal.update({
      where: { id: proposalId },
      data: updateData,
      include: {
        brief: {
          select: { title: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: proposal,
      message: "Proposal updated successfully",
    });
  } catch (error) {
    console.error("Error updating proposal:", error);
    return NextResponse.json(
      { error: "Failed to update proposal" },
      { status: 500 }
    );
  }
}

// DELETE /api/proposals/[id] - Delete proposal
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: proposalId } = await params;

    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    // Check permissions
    if (proposal.manufacturerId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Can only delete DRAFT proposals
    if (proposal.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Can only delete draft proposals" },
        { status: 400 }
      );
    }

    await prisma.proposal.delete({
      where: { id: proposalId },
    });

    // Update brief proposals count
    await prisma.brief.update({
      where: { id: proposal.briefId },
      data: { proposalsCount: { decrement: 1 } },
    });

    return NextResponse.json({
      success: true,
      message: "Proposal deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting proposal:", error);
    return NextResponse.json(
      { error: "Failed to delete proposal" },
      { status: 500 }
    );
  }
}
