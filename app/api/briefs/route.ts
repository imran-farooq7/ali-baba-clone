// app/api/briefs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/prisma/prisma";
import { BriefStatus } from "@/lib/generated/prisma/enums";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Get all briefs for this brand (no pagination)
    const briefs = await prisma.brief.findMany({
      where: { brandId: user.id },
      include: {
        proposals: {
          select: { id: true, status: true },
        },
        _count: {
          select: { proposals: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: briefs,
    });
  } catch (error) {
    console.error("Error fetching briefs:", error);
    return NextResponse.json(
      { error: "Failed to fetch briefs" },
      { status: 500 }
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a brand
    if (user.type !== "BRAND") {
      return NextResponse.json(
        { error: "Only brands can create briefs" },
        { status: 403 }
      );
    }

    const data = await request.json();
    console.log(data, "from frontend");

    // Validate required fields
    const requiredFields = [
      "title",
      "description",
      "category",
      "quantity",
      "budget",
      "timelineDays",
    ];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create the brief
    const brief = await prisma.brief.create({
      data: {
        title: data.title,
        description: data.description,
        aiEnhancedDescription: data.aiEnhancedDescription || null,
        category: data.category,
        quantity: parseInt(data.quantity),
        budget: parseFloat(data.budget),
        budgetRangeMin: data.budgetRangeMin
          ? parseFloat(data.budgetRangeMin)
          : null,
        budgetRangeMax: data.budgetRangeMax
          ? parseFloat(data.budgetRangeMax)
          : null,
        timelineDays: parseInt(data.timelineDays),
        location: data.location || null,
        requirements: data.requirements || [],
        attachments: data.attachments || [],
        status: data.status || BriefStatus.DRAFT,
        brandId: user.id,
        // Optional fields with defaults
        eligibilityScore: data.eligibilityScore || null,
        publishedAt: data.status === BriefStatus.PUBLISHED ? new Date() : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Brief created successfully",
        data: brief,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating brief:", error);

    // Handle validation errors
    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Invalid brand or reference error" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create brief", details: error.message },
      { status: 500 }
    );
  }
}
