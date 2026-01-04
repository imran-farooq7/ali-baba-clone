import { prisma } from "@/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ids = searchParams.get("ids");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const capability = searchParams.get("capability");
    const industry = searchParams.get("industry");
    const verified = searchParams.get("verified");
    const minRating = parseFloat(searchParams.get("minRating") || "0");

    // Build Prisma where clause for MANUFACTURER users
    const where: any = {
      type: "MANUFACTURER",
    };

    if (ids) {
      const idArray = ids.split(",");
      where.id = { in: idArray };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { locations: { has: search } },
      ];
    }

    if (capability && capability !== "all") {
      where.capabilities = { has: capability };
    }

    if (industry && industry !== "all") {
      where.industries = { has: industry };
    }

    if (verified === "true") {
      where.verified = true;
    }

    // Note: Your schema doesn't have 'rating' field on User model
    // We'll calculate matchScore instead

    // Fetch manufacturer users with related data
    const manufacturers = await prisma.user.findMany({
      where,
      take: limit,
      orderBy: {
        // You might want to sort by matchScore if you add it
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            sentProposals: true, // Proposals submitted by this manufacturer
            receivedBriefs: true, // Briefs this manufacturer can see
            bookmarks: true, // How many users bookmarked this manufacturer
          },
        },
        // Optional: include bookmarks for current user
        bookmarks: {
          where: {
            // You'll need to pass current user ID
            // id: currentUserId
          },
          select: {
            id: true,
          },
        },
      },
    });

    // Transform to match your Manufacturer type
    const transformedManufacturers = manufacturers.map((user) => {
      // Calculate match score based on various factors
      const matchScore = calculateMatchScore(user);

      // Calculate rating based on completed projects (you'll need to implement this)
      const rating = calculateManufacturerRating(user.id); // This would need a separate query

      // Check if current user bookmarked this manufacturer
      const isBookmarked = user.bookmarks.length > 0;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company || user.name, // Fallback to name if no company
        avatar: user.avatar || null,
        description: user.description || null,
        capabilities: user.capabilities || [],
        certifications: user.certifications || [],
        minOrderQuantity: user.minOrderQuantity || null,
        maxOrderQuantity: user.maxOrderQuantity || null,
        productionCapacity: user.productionCapacity || null,
        locations: user.locations || [],
        industries: user.industries || [],
        verified: user.verified || false,
        rating: 4.0, // Default rating
        matchScore: matchScore,
        isBookmarked: isBookmarked,
      };
    });

    // Sort by matchScore if available
    // transformedManufacturers.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json(transformedManufacturers);
  } catch (error) {
    console.error("Error fetching manufacturers:", error);
    return NextResponse.json(
      { error: "Failed to fetch manufacturers", details: String(error) },
      { status: 500 }
    );
  }
}

// Helper function to calculate match score
function calculateMatchScore(user: any): number {
  let score = 50; // Base score

  // Add points for verification
  if (user.verified) score += 15;

  // Add points for capabilities
  score += Math.min(user.capabilities.length * 2, 20);

  // Add points for certifications
  score += Math.min(user.certifications.length * 3, 15);

  // Add points for production capacity
  if (user.productionCapacity && user.productionCapacity > 1000) score += 10;

  // Add points for multiple locations
  if (user.locations.length > 1) score += 5;

  // Ensure score doesn't exceed 100
  return Math.min(score, 100);
}

// You'll need to implement this based on your business logic
async function calculateManufacturerRating(userId: string): Promise<number> {
  // This would query completed projects and calculate average rating
  // For now, return a default
  return 4.0;
}

// POST endpoint to save comparisons (add to your route.ts)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, manufacturerIds, comparisonData, name } = body;

    // Store in AI Assistant Logs for now, or create a separate model
    const savedComparison = await prisma.aiAssistantLog.create({
      data: {
        userId,
        prompt: "Manufacturer Comparison",
        response: JSON.stringify({
          manufacturerIds,
          comparisonData,
          name,
          type: "COMPARISON_SAVE",
        }),
        metadata: {
          type: "manufacturer_comparison",
          manufacturerIds,
          timestamp: new Date().toISOString(),
        },
        model: "system",
      },
    });

    return NextResponse.json({
      success: true,
      comparisonId: savedComparison.id,
      message: "Comparison saved successfully",
    });
  } catch (error) {
    console.error("Error saving comparison:", error);
    return NextResponse.json(
      { error: "Failed to save comparison" },
      { status: 500 }
    );
  }
}
8;
