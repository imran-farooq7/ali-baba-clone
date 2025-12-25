// app/api/proposals/[id]/[action]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/db/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  const { id: proposalId } = await params;
  const { action } = await params;
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        brief: true,
        manufacturer: true,
      },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    let result;
    let message = "";

    switch (action) {
      case "submit":
        // Manufacturer submits a draft proposal
        if (proposal.manufacturerId !== user.id) {
          return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }
        if (proposal.status !== "DRAFT") {
          return NextResponse.json(
            { error: "Only draft proposals can be submitted" },
            { status: 400 }
          );
        }

        result = await prisma.proposal.update({
          where: { id: proposalId },
          data: {
            status: "SUBMITTED",
            submittedAt: new Date(),
          },
        });
        message = "Proposal submitted successfully";
        break;

      case "withdraw":
        // Manufacturer withdraws their proposal
        if (proposal.manufacturerId !== user.id) {
          return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }
        if (!["DRAFT", "SUBMITTED", "UNDER_REVIEW"].includes(proposal.status)) {
          return NextResponse.json(
            { error: "Cannot withdraw proposal in current status" },
            { status: 400 }
          );
        }

        result = await prisma.proposal.update({
          where: { id: proposalId },
          data: {
            status: "WITHDRAWN",
            decidedAt: new Date(),
          },
        });
        message = "Proposal withdrawn successfully";
        break;

      case "accept":
        // Brand accepts a proposal
        if (proposal.brandId !== user.id) {
          return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }
        if (
          proposal.status !== "SUBMITTED" &&
          proposal.status !== "NEGOTIATION"
        ) {
          return NextResponse.json(
            {
              error: "Only submitted or negotiation proposals can be accepted",
            },
            { status: 400 }
          );
        }

        // Use transaction to update multiple records
        result = await prisma.$transaction(async (tx) => {
          // Update proposal status
          const updatedProposal = await tx.proposal.update({
            where: { id: proposalId },
            data: {
              status: "ACCEPTED",
              decidedAt: new Date(),
            },
          });

          // Update brief status and link to accepted proposal
          await tx.brief.update({
            where: { id: proposal.briefId },
            data: {
              status: "MATCHED",
              manufacturerId: proposal.manufacturerId,
              bestProposalId: proposalId,
            },
          });

          // Reject all other proposals for this brief
          await tx.proposal.updateMany({
            where: {
              briefId: proposal.briefId,
              id: { not: proposalId },
              status: { in: ["SUBMITTED", "UNDER_REVIEW", "NEGOTIATION"] },
            },
            data: {
              status: "REJECTED",
              decidedAt: new Date(),
            },
          });

          return updatedProposal;
        });
        message = "Proposal accepted successfully!";
        break;

      case "reject":
        // Brand rejects a proposal
        if (proposal.brandId !== user.id) {
          return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }
        if (
          proposal.status !== "SUBMITTED" &&
          proposal.status !== "UNDER_REVIEW"
        ) {
          return NextResponse.json(
            { error: "Cannot reject proposal in current status" },
            { status: 400 }
          );
        }

        result = await prisma.proposal.update({
          where: { id: proposalId },
          data: {
            status: "REJECTED",
            decidedAt: new Date(),
          },
        });
        message = "Proposal rejected";
        break;

      case "counter":
        // Brand or manufacturer makes a counter offer
        const counterData = await request.json();
        const { counterPrice, counterTimeline, counterMessage, counterTerms } =
          counterData;

        // Check permissions
        const canCounter =
          proposal.brandId === user.id || proposal.manufacturerId === user.id;
        if (!canCounter) {
          return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        // Check if proposal can be countered
        if (
          !["SUBMITTED", "UNDER_REVIEW", "NEGOTIATION"].includes(
            proposal.status
          )
        ) {
          return NextResponse.json(
            { error: "Cannot counter proposal in current status" },
            { status: 400 }
          );
        }

        // Create counter proposal
        const counterProposal = await prisma.proposal.create({
          data: {
            message: counterMessage || "Counter offer",
            price: counterPrice || proposal.price,
            timelineDays: counterTimeline || proposal.timelineDays,
            terms: counterTerms || proposal.terms,
            status: "COUNTERED",
            briefId: proposal.briefId,
            manufacturerId: proposal.manufacturerId,
            brandId: proposal.brandId,
            currency: proposal.currency,
            submittedAt: new Date(),
            counterProposalId: proposalId,
          },
        });

        // Update original proposal status
        result = await prisma.proposal.update({
          where: { id: proposalId },
          data: {
            status: "NEGOTIATION",
            counterPrice: counterPrice || proposal.price,
            counterTimeline: counterTimeline || proposal.timelineDays,
            counterMessage: counterMessage,
            counterTerms: counterTerms || proposal.terms,
          },
        });

        message = "Counter offer sent successfully";
        result = { ...result, counterProposal };
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result,
      message,
    });
  } catch (error) {
    console.error(`Error performing ${action} on proposal:`, error);
    return NextResponse.json(
      { error: `Failed to ${action} proposal` },
      { status: 500 }
    );
  }
}
