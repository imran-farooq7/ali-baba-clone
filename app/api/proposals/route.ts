// app/api/proposals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/prisma/prisma";
import { ProposalStatus } from "@/lib/generated/prisma/enums";

// GET /api/proposals - Get proposals with filters
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userType = searchParams.get("userType"); // 'brand' or 'manufacturer'
    const status = searchParams.get("status");
    const briefId = searchParams.get("briefId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (userType === "brand") {
      where.brandId = user.id;
    } else if (userType === "manufacturer") {
      where.manufacturerId = user.id;
    }

    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    if (briefId) {
      where.briefId = briefId;
    }

    // Get proposals with pagination
    const [proposals, total] = await Promise.all([
      prisma.proposal.findMany({
        where,
        include: {
          brief: {
            select: {
              id: true,
              title: true,
              budget: true,
              brand: {
                select: { id: true, name: true, company: true, avatar: true },
              },
            },
          },
          manufacturer: {
            select: { id: true, name: true, company: true, avatar: true },
          },
          brand: {
            select: { id: true, name: true, company: true, avatar: true },
          },
          counterProposal: {
            select: { id: true, price: true, status: true },
          },
          _count: {
            select: { originalProposal: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.proposal.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: proposals,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching proposals:", error);
    return NextResponse.json(
      { error: "Failed to fetch proposals" },
      { status: 500 }
    );
  }
}

// POST /api/proposals - Create new proposal
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.type !== "MANUFACTURER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const {
      briefId,
      message,
      price,
      timelineDays,
      terms,
      attachments = [],
      status = "DRAFT",
    } = data;

    // Validate required fields
    if (!briefId || !message || !price || !timelineDays) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get brief to validate
    const brief = await prisma.brief.findUnique({
      where: { id: briefId },
      include: { brand: true },
    });

    if (!brief) {
      return NextResponse.json({ error: "Brief not found" }, { status: 404 });
    }

    // Check if brief is published
    if (brief.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Brief is not available for proposals" },
        { status: 400 }
      );
    }

    // Check if manufacturer already submitted a proposal
    const existingProposal = await prisma.proposal.findFirst({
      where: {
        briefId,
        manufacturerId: user.id,
        status: { in: ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "NEGOTIATION"] },
      },
    });

    if (existingProposal) {
      return NextResponse.json(
        { error: "You already have a proposal for this brief" },
        { status: 400 }
      );
    }

    // Create proposal
    const proposal = await prisma.proposal.create({
      data: {
        message,
        price: parseFloat(price),
        timelineDays: parseInt(timelineDays),
        terms: terms || {},
        attachments,
        status: status as ProposalStatus,
        briefId,
        manufacturerId: user.id,
        brandId: brief.brandId,
        currency: "USD",
        submittedAt: status === "SUBMITTED" ? new Date() : null,
      },
      include: {
        brief: {
          select: { title: true, brand: { select: { name: true } } },
        },
        manufacturer: {
          select: { name: true, company: true },
        },
      },
    });

    // Update brief proposals count
    await prisma.brief.update({
      where: { id: briefId },
      data: { proposalsCount: { increment: 1 } },
    });

    return NextResponse.json(
      {
        success: true,
        data: proposal,
        message:
          status === "SUBMITTED"
            ? "Proposal submitted successfully!"
            : "Proposal saved as draft",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating proposal:", error);
    return NextResponse.json(
      { error: "Failed to create proposal" },
      { status: 500 }
    );
  }
}
