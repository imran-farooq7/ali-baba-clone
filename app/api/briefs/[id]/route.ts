// app/api/briefs/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/prisma/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: briefId } = await params;

    // Check if brief exists and belongs to user
    const brief = await prisma.brief.findUnique({
      where: { id: briefId },
      include: { brand: true },
    });

    if (!brief) {
      return NextResponse.json({ error: "Brief not found" }, { status: 404 });
    }

    if (brief.brandId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized to delete this brief" },
        { status: 403 }
      );
    }

    // Delete brief (cascade will delete proposals)
    await prisma.brief.delete({
      where: { id: briefId },
    });

    return NextResponse.json({
      success: true,
      message: "Brief deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting brief:", error);
    return NextResponse.json(
      { error: "Failed to delete brief" },
      { status: 500 }
    );
  }
}
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: briefId } = await params;
    const body = await request.json();

    // Validate required fields
    if (
      !body.title ||
      !body.description ||
      !body.category ||
      !body.budget ||
      !body.quantity
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if brief exists
    const existingBrief = await prisma.brief.findUnique({
      where: { id: briefId },
    });

    if (!existingBrief) {
      return NextResponse.json({ error: "Brief not found" }, { status: 404 });
    }

    // Only allow updates for DRAFT or PUBLISHED briefs
    if (!["DRAFT", "PUBLISHED"].includes(existingBrief.status)) {
      return NextResponse.json(
        { error: "Cannot edit brief in current status" },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: any = {
      title: body.title,
      description: body.description,
      category: body.category,
      quantity: body.quantity,
      budget: body.budget,
      timelineDays: body.timelineDays || null,
      location: body.location || null,
      budgetRangeMin: body.budgetRangeMin || null,
      budgetRangeMax: body.budgetRangeMax || null,
      updatedAt: new Date(),
    };

    // Handle requirements (JSON field)
    if (body.requirements && Array.isArray(body.requirements)) {
      updateData.requirements = body.requirements;
    }

    // Handle AI enhanced description
    if (body.aiEnhancedDescription) {
      updateData.aiEnhancedDescription = body.aiEnhancedDescription;
    }

    // Update the brief
    const updatedBrief = await prisma.brief.update({
      where: { id: briefId },
      data: updateData,
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      brief: {
        id: updatedBrief.id,
        title: updatedBrief.title,
        description: updatedBrief.description,
        aiEnhancedDescription: updatedBrief.aiEnhancedDescription,
        category: updatedBrief.category,
        quantity: updatedBrief.quantity,
        budget: updatedBrief.budget,
        timelineDays: updatedBrief.timelineDays,
        location: updatedBrief.location,
        status: updatedBrief.status,
        proposalsCount: updatedBrief.proposalsCount,
        viewsCount: updatedBrief.viewsCount,
        createdAt: updatedBrief.createdAt,
        updatedAt: updatedBrief.updatedAt,
        brand: updatedBrief.brand,
      },
    });
  } catch (error) {
    console.error("Error updating brief:", error);
    return NextResponse.json(
      { error: "Failed to update brief", details: String(error) },
      { status: 500 }
    );
  }
}
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const brief = await prisma.brief.findUnique({
      where: { id },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
          },
        },
        proposals: {
          select: {
            id: true,
            status: true,
            price: true,
            timelineDays: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
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
      return NextResponse.json({ error: "Brief not found" }, { status: 404 });
    }

    // Transform for frontend
    const transformedBrief = {
      id: brief.id,
      title: brief.title,
      description: brief.description,
      aiEnhancedDescription: brief.aiEnhancedDescription,
      category: brief.category,
      quantity: brief.quantity,
      budget: brief.budget,
      budgetRangeMin: brief.budgetRangeMin,
      budgetRangeMax: brief.budgetRangeMax,
      timelineDays: brief.timelineDays,
      location: brief.location,
      status: brief.status,
      requirements: brief.requirements,
      aiSuggestions: brief.aiSuggestions,
      attachments: brief.attachments,
      proposalsCount: brief._count.proposals,
      viewsCount: brief.viewsCount,
      bookmarksCount: brief._count.bookmarkedBy,
      createdAt: brief.createdAt,
      updatedAt: brief.updatedAt,
      publishedAt: brief.publishedAt,
      expiresAt: brief.expiresAt,
      brand: brief.brand,
      recentProposals: brief.proposals,
    };

    return NextResponse.json(transformedBrief);
  } catch (error) {
    console.error("Error fetching brief:", error);
    return NextResponse.json(
      { error: "Failed to fetch brief" },
      { status: 500 }
    );
  }
}
