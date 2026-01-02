import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/proposals - Get proposals with filters
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    console.log(user, "user");
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const briefId = searchParams.get("briefId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build where clause based on user type and filters
    let whereClause: any = {};

    if (user.type === "MANUFACTURER") {
      whereClause.manufacturerId = user.id;
    } else if (user.type === "BRAND") {
      whereClause.brandId = user.id;
    } else if (user.type !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Apply filters
    if (status) {
      whereClause.status = status;
    }

    if (briefId) {
      whereClause.briefId = briefId;
    }

    // Fetch proposals with related data
    const [proposals, total] = await Promise.all([
      prisma.proposal.findMany({
        where: whereClause,
        include: {
          brief: {
            select: {
              id: true,
              title: true,
              category: true,
              status: true,
              brand: {
                select: { name: true, company: true, avatar: true },
              },
            },
          },
          manufacturer: {
            select: {
              id: true,
              name: true,
              company: true,
              avatar: true,
              verified: true,
            },
          },
          brand: {
            select: {
              id: true,
              name: true,
              company: true,
              avatar: true,
            },
          },
          counterProposal: {
            select: {
              id: true,
              status: true,
              price: true,
              timelineDays: true,
            },
          },
          originalProposal: {
            select: {
              id: true,
              status: true,
              price: true,
              timelineDays: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.proposal.count({ where: whereClause }),
    ]);

    // Calculate stats for the current user
    const stats = await calculateProposalStats(user.id, user.type);

    return NextResponse.json({
      proposals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats,
      filters: {
        status: status || "all",
        briefId: briefId || null,
      },
    });
  } catch (error: any) {
    console.error("Proposals fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch proposals", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/proposals - Create new proposal
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.type !== "MANUFACTURER") {
      return NextResponse.json(
        { error: "Unauthorized. Only manufacturers can create proposals." },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { briefId, message, price, timelineDays, terms, attachments } = data;

    // Validate required fields
    if (!briefId || !message || !price || !timelineDays) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if brief exists and is published
    const brief = await prisma.brief.findUnique({
      where: { id: briefId, status: "PUBLISHED" },
      include: { brand: true },
    });

    if (!brief) {
      return NextResponse.json(
        { error: "Brief not found or not published" },
        { status: 404 }
      );
    }

    // Check if manufacturer already submitted a proposal for this brief
    const existingProposal = await prisma.proposal.findFirst({
      where: {
        briefId,
        manufacturerId: user.id,
        status: { not: "WITHDRAWN" },
      },
    });

    if (existingProposal) {
      return NextResponse.json(
        { error: "You have already submitted a proposal for this brief" },
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
        attachments: attachments || [],
        status: "DRAFT",
        briefId,
        manufacturerId: user.id,
        brandId: brief.brandId,
      },
      include: {
        brief: {
          select: {
            title: true,
            brand: {
              select: { name: true, company: true },
            },
          },
        },
        manufacturer: {
          select: {
            name: true,
            company: true,
            avatar: true,
          },
        },
      },
    });

    // Increment brief proposals count
    await prisma.brief.update({
      where: { id: briefId },
      data: { proposalsCount: { increment: 1 } },
    });

    // Create notification for brand (you'll implement this later)
    // await createNotification(...)

    return NextResponse.json({
      success: true,
      proposal,
      message: "Proposal created successfully",
    });
  } catch (error: any) {
    console.error("Proposal creation error:", error);

    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Invalid brief or manufacturer" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create proposal", details: error.message },
      { status: 500 }
    );
  }
}

// Pure function: Calculate proposal stats
const calculateProposalStats = async (userId: string, userType: string) => {
  let whereClause: any = {};

  if (userType === "MANUFACTURER") {
    whereClause.manufacturerId = userId;
  } else if (userType === "BRAND") {
    whereClause.brandId = userId;
  }

  const proposals = await prisma.proposal.groupBy({
    by: ["status"],
    where: whereClause,
    _count: { _all: true },
    _avg: { price: true },
  });

  const total = proposals.reduce((sum, p) => sum + (p._count?._all || 0), 0);

  const stats = {
    total,
    byStatus: proposals.reduce(
      (acc, p) => ({
        ...acc,
        [p.status]: p._count?._all,
      }),
      {}
    ),
    averageValue: proposals[0]?._avg?.price || 0,
    conversionRate: 0, // Will calculate from accepted/total
  };

  if (total > 0) {
    const accepted =
      proposals.find((p) => p.status === "ACCEPTED")?._count?._all || 0;
    stats.conversionRate = Math.round((accepted / total) * 100);
  }

  return stats;
};
