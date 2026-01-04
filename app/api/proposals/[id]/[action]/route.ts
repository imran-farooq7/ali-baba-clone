import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { getCurrentUser } from "@/lib/auth";

type Action = "submit" | "withdraw" | "accept" | "reject" | "counter";

// Handle proposal actions
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string; action: Action }> }
) {
  try {
    const { id, action } = await context.params;
    const user = await getCurrentUser();
    console.log(user);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get proposal with basic info
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        brief: {
          select: {
            id: true,
            title: true,
            brandId: true,
            status: true,
          },
        },
        manufacturer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            email: true,
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

    // Route to appropriate action handler
    switch (action) {
      case "submit":
        return await handleSubmit(proposal, user);
      case "withdraw":
        return await handleWithdraw(proposal, user);
      case "accept":
        return await handleAccept(proposal, user, await request.json());
      case "reject":
        return await handleReject(proposal, user, await request.json());
      case "counter":
        return await handleCounter(proposal, user, await request.json());
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Proposal action error:", error);
    return NextResponse.json(
      {
        error: `Failed to ${(await context.params).action} proposal`,
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Action: Submit proposal (Manufacturer only)
const handleSubmit = async (proposal: any, user: any) => {
  if (user.id !== proposal.manufacturerId) {
    return NextResponse.json(
      { error: "Only the proposal creator can submit it" },
      { status: 403 }
    );
  }

  if (proposal.status !== "DRAFT") {
    return NextResponse.json(
      { error: "Only draft proposals can be submitted" },
      { status: 400 }
    );
  }

  const updatedProposal = await prisma.proposal.update({
    where: { id: proposal.id },
    data: {
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
    include: {
      brief: {
        select: { title: true },
      },
      manufacturer: {
        select: { name: true, company: true },
      },
    },
  });

  // Create notification for brand
  // await createNotification(...)

  return NextResponse.json({
    success: true,
    proposal: updatedProposal,
    message: "Proposal submitted successfully",
  });
};

// Action: Withdraw proposal (Manufacturer only)
const handleWithdraw = async (proposal: any, user: any) => {
  if (user.id !== proposal.manufacturerId && user.type !== "ADMIN") {
    return NextResponse.json(
      { error: "Only the proposal creator can withdraw it" },
      { status: 403 }
    );
  }

  const allowedStatuses = ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "NEGOTIATION"];
  if (!allowedStatuses.includes(proposal.status)) {
    return NextResponse.json(
      { error: "Cannot withdraw proposal in current status" },
      { status: 400 }
    );
  }

  const updatedProposal = await prisma.proposal.update({
    where: { id: proposal.id },
    data: {
      status: "WITHDRAWN",
      decidedAt: new Date(),
    },
  });

  return NextResponse.json({
    success: true,
    proposal: updatedProposal,
    message: "Proposal withdrawn successfully",
  });
};

// Action: Accept proposal (Brand only)
const handleAccept = async (proposal: any, user: any, data: any) => {
  if (user.id !== proposal.brandId && user.type !== "ADMIN") {
    return NextResponse.json(
      { error: "Only the brand can accept proposals" },
      { status: 403 }
    );
  }

  const allowedStatuses = [
    "SUBMITTED",
    "UNDER_REVIEW",
    "NEGOTIATION",
    "COUNTERED",
  ];
  if (!allowedStatuses.includes(proposal.status)) {
    return NextResponse.json(
      { error: "Cannot accept proposal in current status" },
      { status: 400 }
    );
  }

  // Check if brief is still available
  if (proposal.brief.status !== "PUBLISHED") {
    return NextResponse.json(
      { error: "This brief is no longer available" },
      { status: 400 }
    );
  }

  // Start transaction
  const transaction = await prisma.$transaction(async (tx) => {
    // 1. Accept the proposal
    const acceptedProposal = await tx.proposal.update({
      where: { id: proposal.id },
      data: {
        status: "ACCEPTED",
        decidedAt: new Date(),
      },
    });

    // 2. Update brief status to MATCHED and link manufacturer
    await tx.brief.update({
      where: { id: proposal.briefId },
      data: {
        status: "MATCHED",
        manufacturerId: proposal.manufacturerId,
        bestProposalId: proposal.id,
      },
    });

    // 3. Reject all other proposals for this brief
    await tx.proposal.updateMany({
      where: {
        briefId: proposal.briefId,
        id: { not: proposal.id },
        status: {
          in: ["SUBMITTED", "UNDER_REVIEW", "NEGOTIATION", "COUNTERED"],
        },
      },
      data: {
        status: "REJECTED",
        decidedAt: new Date(),
      },
    });

    // 4. Create a conversation for the accepted project
    const conversation = await tx.conversation.create({
      data: {
        title: `Project: ${proposal.brief.title}`,
        briefId: proposal.briefId,
        proposalId: proposal.id,
        participants: {
          create: [
            { userId: proposal.brandId, userRole: "BRAND" },
            { userId: proposal.manufacturerId, userRole: "MANUFACTURER" },
          ],
        },
      },
    });

    // 5. Create initial system message
    await tx.message.create({
      data: {
        content: `Proposal accepted! Project "${proposal.brief.title}" is now active.`,
        type: "SYSTEM",
        senderId: user.id,
        conversationId: conversation.id,
      },
    });

    return { acceptedProposal, conversation };
  });

  // Create notifications
  // await createNotification(...) // For manufacturer
  // await createNotification(...) // For brand
  const createNotification = async (
    type: string,
    recipientId: string,
    title: string,
    message: string,
    options?: any
  ) => {
    // Call your notification API
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        recipientId,
        senderId: proposal.brandId,
        title,
        message,
        metadata: { proposalId: proposal.id },
        entityIds: { proposalId: proposal.id },
      }),
    });
  };

  // In handleAccept function, after transaction:
  await createNotification(
    "PROPOSAL_ACCEPTED",
    proposal.manufacturerId,
    "Proposal Accepted!",
    `Your proposal for "${proposal.brief.title}" has been accepted by ${proposal.brand.company}`,
    {
      proposalId: proposal.id,
      briefId: proposal.briefId,
    }
  );

  return NextResponse.json({
    success: true,
    proposal: transaction.acceptedProposal,
    conversation: transaction.conversation,
    message: "Proposal accepted successfully. Project conversation created.",
  });
};

// Action: Reject proposal (Brand only)
const handleReject = async (proposal: any, user: any, data: any) => {
  if (user.id !== proposal.brandId && user.type !== "ADMIN") {
    return NextResponse.json(
      { error: "Only the brand can reject proposals" },
      { status: 403 }
    );
  }

  const allowedStatuses = [
    "SUBMITTED",
    "UNDER_REVIEW",
    "NEGOTIATION",
    "COUNTERED",
  ];
  if (!allowedStatuses.includes(proposal.status)) {
    return NextResponse.json(
      { error: "Cannot reject proposal in current status" },
      { status: 400 }
    );
  }

  const updatedProposal = await prisma.proposal.update({
    where: { id: proposal.id },
    data: {
      status: "REJECTED",
      decidedAt: new Date(),
    },
  });

  // Create notification for manufacturer
  const createNotification = async (
    type: string,
    recipientId: string,
    title: string,
    message: string,
    options?: any
  ) => {
    // Call your notification API
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        recipientId,
        senderId: proposal.brandId,
        title,
        message,
        metadata: { proposalId: proposal.id },
        entityIds: { proposalId: proposal.id },
      }),
    });
  };
  // await createNotification(...)
  await createNotification(
    "PROPOSAL_REJECTED",
    proposal.manufacturerId,
    "Proposal Status Update",
    `Your proposal for "${proposal.brief.title}" was not selected`,
    {
      proposalId: proposal.id,
      briefId: proposal.briefId,
    }
  );

  return NextResponse.json({
    success: true,
    proposal: updatedProposal,
    message: "Proposal rejected successfully",
  });
};

// Action: Counter proposal (Brand only)
const handleCounter = async (proposal: any, user: any, data: any) => {
  if (user.id !== proposal.brandId && user.type !== "ADMIN") {
    return NextResponse.json(
      { error: "Only the brand can make counter offers" },
      { status: 403 }
    );
  }

  const allowedStatuses = ["SUBMITTED", "UNDER_REVIEW", "NEGOTIATION"];
  if (!allowedStatuses.includes(proposal.status)) {
    return NextResponse.json(
      { error: "Cannot counter proposal in current status" },
      { status: 400 }
    );
  }

  const { message, price, timelineDays, terms } = data;

  if (!message || !price || !timelineDays) {
    return NextResponse.json(
      { error: "Missing required fields for counter offer" },
      { status: 400 }
    );
  }

  // Create counter proposal
  const counterProposal = await prisma.proposal.create({
    data: {
      message,
      price: parseFloat(price),
      timelineDays: parseInt(timelineDays),
      terms: terms || {},
      attachments: data.attachments || [],
      status: "COUNTERED",
      briefId: proposal.briefId,
      manufacturerId: proposal.manufacturerId,
      brandId: proposal.brandId,
      counterProposalId: proposal.id, // Link to original
    },
    include: {
      brief: {
        select: { title: true },
      },
      manufacturer: {
        select: { name: true, company: true },
      },
    },
  });

  // Update original proposal status
  await prisma.proposal.update({
    where: { id: proposal.id },
    data: { status: "NEGOTIATION" },
  });

  // Create notification for manufacturer
  const createNotification = async (
    type: string,
    recipientId: string,
    title: string,
    message: string,
    options?: any
  ) => {
    // Call your notification API
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        recipientId,
        senderId: proposal.brandId,
        title,
        message,
        metadata: { proposalId: proposal.id },
        entityIds: { proposalId: proposal.id },
      }),
    });
  };
  // await createNotification(...)
  await createNotification(
    "PROPOSAL_COUNTERED",
    proposal.manufacturerId,
    "Counter Offer Received",
    `${proposal.brand.company} sent you a counter offer for "${proposal.brief.title}"`,
    {
      proposalId: proposal.id,
      briefId: proposal.briefId,
    }
  );
  // Create conversation message if conversation exists
  if (proposal.conversationId) {
    await prisma.message.create({
      data: {
        content: `New counter offer submitted: $${price} for ${timelineDays} days`,
        type: "PROPOSAL_UPDATE",
        senderId: user.id,
        conversationId: proposal.conversationId,
      },
    });
  }

  return NextResponse.json({
    success: true,
    counterProposal,
    message: "Counter offer submitted successfully",
  });
};
