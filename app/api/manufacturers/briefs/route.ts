// app/api/manufacturers/briefs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.type !== "MANUFACTURER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const minBudget = searchParams.get("minBudget");
    const maxBudget = searchParams.get("maxBudget");

    // Get manufacturer's capabilities
    const manufacturer = await prisma.user.findUnique({
      where: { id: user.id },
      select: { capabilities: true },
    });

    // Build where clause for briefs
    const where: any = {
      status: "published",
      // Add AI matching logic here based on manufacturer capabilities
    };

    if (category && category !== "all") {
      where.category = category;
    }

    if (minBudget) {
      where.budget = { gte: parseInt(minBudget) };
    }

    if (maxBudget) {
      where.budget = { ...where.budget, lte: parseInt(maxBudget) };
    }

    const briefs = await prisma.brief.findMany({
      where,
      include: {
        brand: {
          select: { name: true, company: true, avatar: true },
        },
        proposals: {
          where: { manufacturerId: user.id },
          select: { id: true, status: true },
        },
        _count: {
          select: { proposals: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Add AI matching scores (simplified)
    const briefsWithScores = briefs.map((brief) => ({
      ...brief,
      eligibilityScore: manufacturer?.capabilities.includes(brief.category)
        ? 85
        : 45,
    }));

    return NextResponse.json({
      success: true,
      data: briefsWithScores,
    });
  } catch (error) {
    console.error("Error fetching manufacturer briefs:", error);
    return NextResponse.json(
      { error: "Failed to fetch briefs" },
      { status: 500 }
    );
  }
}
