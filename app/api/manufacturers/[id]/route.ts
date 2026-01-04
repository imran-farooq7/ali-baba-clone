import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Get current user - optional since viewing is public
    let currentUser;
    try {
      currentUser = await getCurrentUser();
    } catch {
      currentUser = null;
    }

    // Fetch manufacturer with all details
    // Note: Public info, no auth required for viewing
    const manufacturer = await prisma.user.findUnique({
      where: {
        id,
        type: "MANUFACTURER",
      },
      include: {
        sentProposals: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            price: true,
            createdAt: true,
            brief: {
              select: {
                id: true,
                title: true,
                brand: {
                  select: { name: true, company: true },
                },
              },
            },
          },
        },
        receivedBriefs: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            status: true,
            category: true,
            createdAt: true,
            brand: {
              select: { name: true, company: true },
            },
          },
        },
        _count: {
          select: {
            sentProposals: true,
            receivedBriefs: true,
            bookmarks: true,
          },
        },
      },
    });

    if (!manufacturer) {
      return NextResponse.json(
        { error: "Manufacturer not found" },
        { status: 404 }
      );
    }

    // Calculate stats
    const totalProposals = manufacturer._count.sentProposals;
    const acceptedProposals = manufacturer.sentProposals.filter(
      (p) => p.status === "ACCEPTED"
    ).length;
    const acceptanceRate =
      totalProposals > 0
        ? Math.round((acceptedProposals / totalProposals) * 100)
        : 0;

    // Prepare response based on viewer role
    const baseData = {
      id: manufacturer.id,
      email: manufacturer.email,
      name: manufacturer.name,
      company: manufacturer.company,
      avatar: manufacturer.avatar,
      website: manufacturer.website,
      description: manufacturer.description,
      type: manufacturer.type,
      verified: manufacturer.verified,
      capabilities: manufacturer.capabilities,
      certifications: manufacturer.certifications,
      minOrderQuantity: manufacturer.minOrderQuantity,
      maxOrderQuantity: manufacturer.maxOrderQuantity,
      productionCapacity: manufacturer.productionCapacity,
      locations: manufacturer.locations,
      industries: manufacturer.industries,
      capabilityDetails: manufacturer.capabilityDetails,
      certificationDetails: manufacturer.certificationDetails,
      metadata: manufacturer.metadata,
      createdAt: manufacturer.createdAt,
      updatedAt: manufacturer.updatedAt,
      stats: {
        totalProposals,
        acceptedProposals,
        acceptanceRate,
        totalBriefs: manufacturer._count.receivedBriefs,
        bookmarks: manufacturer._count.bookmarks,
        memberSince: new Date(manufacturer.createdAt).getFullYear(),
      },
    };

    // If manufacturer viewing own profile, include private data
    if (
      currentUser &&
      (currentUser.id === manufacturer.id || currentUser.type === "ADMIN")
    ) {
      return NextResponse.json({
        ...baseData,
        privateStats: {
          proposalsByStatus: manufacturer.sentProposals.reduce((acc, p) => {
            acc[p.status] = (acc[p.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          recentActivity: {
            proposals: manufacturer.sentProposals,
            briefs: manufacturer.receivedBriefs,
          },
        },
        viewType: currentUser.id === manufacturer.id ? "OWNER" : "ADMIN",
      });
    }

    // If brand viewing manufacturer
    if (currentUser?.type === "BRAND") {
      // Check if manufacturer is bookmarked by this brand
      const bookmark = await prisma.bookmark.findUnique({
        where: {
          userId_manufacturerId: {
            userId: currentUser.id,
            manufacturerId: manufacturer.id,
          },
        },
      });

      return NextResponse.json({
        ...baseData,
        isBookmarked: !!bookmark,
        viewType: "BRAND",
      });
    }

    // Default response for other users
    return NextResponse.json({
      ...baseData,
      viewType: "PUBLIC",
    });
  } catch (error: any) {
    console.error("Manufacturer API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch manufacturer", details: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/manufacturers/[id] - Update manufacturer profile
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const currentUser = await getCurrentUser();
    const data = await request.json();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow manufacturer to update their own profile (or admin)
    if (currentUser.id !== id && currentUser.type !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Allowed fields for update
    const allowedUpdates = {
      name: data.name,
      company: data.company,
      avatar: data.avatar,
      website: data.website,
      description: data.description,
      capabilities: data.capabilities,
      certifications: data.certifications,
      minOrderQuantity: data.minOrderQuantity,
      maxOrderQuantity: data.maxOrderQuantity,
      productionCapacity: data.productionCapacity,
      locations: data.locations,
      industries: data.industries,
      capabilityDetails: data.capabilityDetails,
      certificationDetails: data.certificationDetails,
    };

    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(allowedUpdates).filter(([_, value]) => value !== undefined)
    );

    const updatedManufacturer = await prisma.user.update({
      where: { id },
      data: cleanUpdates,
      select: {
        id: true,
        name: true,
        company: true,
        avatar: true,
        website: true,
        description: true,
        capabilities: true,
        certifications: true,
        minOrderQuantity: true,
        maxOrderQuantity: true,
        productionCapacity: true,
        locations: true,
        industries: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      manufacturer: updatedManufacturer,
    });
  } catch (error: any) {
    console.error("Manufacturer update error:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Manufacturer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update manufacturer", details: error.message },
      { status: 500 }
    );
  }
}
