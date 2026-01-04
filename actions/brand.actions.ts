// app/actions/brands-simple.ts
"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/prisma/prisma";
import { redirect } from "next/navigation";

export interface SimpleBrand {
  id: string;
  name: string;
  company: string | null;
  description: string | null;
  website: string | null;
  verified: boolean;
  avatar: string | null;
  createdAt: Date;
  // Stats
  totalBriefs: number;
  activeBriefs: number;
  avgBriefBudget: number;
}

export async function getBrands(): Promise<SimpleBrand[]> {
  try {
    // Veri
    const user = await getCurrentUser();
    if (!user) {
      redirect("/login");
    }
    if (user.type !== "MANUFACTURER") {
      throw new Error("only manufacturer can view brand");
    }

    const brands = await prisma.user.findMany({
      where: {
        type: "BRAND",
      },
      select: {
        id: true,
        name: true,
        company: true,
        description: true,
        avatar: true,
        website: true,
        verified: true,
        createdAt: true,
        createdBriefs: {
          select: {
            id: true,
            budget: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform data to include statistics
    return brands.map((brand) => {
      const briefs = brand.createdBriefs || [];
      const totalBriefs = briefs.length;
      const activeBriefs = briefs.filter((brief) =>
        ["PUBLISHED", "IN_PROGRESS"].includes(brief.status)
      ).length;
      const avgBriefBudget =
        briefs.length > 0
          ? briefs.reduce((sum, brief) => sum + (brief.budget || 0), 0) /
            briefs.length
          : 0;

      return {
        id: brand.id,
        name: brand.name,
        company: brand.company,
        description: brand.description,
        avatar: brand.avatar,
        website: brand.website,
        verified: brand.verified,
        createdAt: brand.createdAt,
        totalBriefs,
        activeBriefs,
        avgBriefBudget,
      };
    });
  } catch (error) {
    console.error("Error fetching brands:", error);
    throw new Error("Failed to fetch brands");
  }
}

export async function getBrandById(
  brandId: string
): Promise<SimpleBrand | null> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      redirect("/login");
    }
    if (user.type !== "MANUFACTURER") {
      throw new Error("only manufacturer can view brand");
    }
    const brand = await prisma.user.findUnique({
      where: {
        id: brandId,
        type: "BRAND",
      },
      select: {
        id: true,
        name: true,
        company: true,
        description: true,
        avatar: true,
        website: true,
        email: true,
        verified: true,
        createdAt: true,
        createdBriefs: {
          select: {
            id: true,
            title: true,
            description: true,
            budget: true,
            quantity: true,
            timelineDays: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!brand) {
      return null;
    }

    const briefs = brand.createdBriefs || [];
    const totalBriefs = briefs.length;
    const activeBriefs = briefs.filter((brief) =>
      ["PUBLISHED", "IN_PROGRESS"].includes(brief.status)
    ).length;
    const avgBriefBudget =
      briefs.length > 0
        ? briefs.reduce((sum, brief) => sum + (brief.budget || 0), 0) /
          briefs.length
        : 0;

    return {
      id: brand.id,
      name: brand.name,
      company: brand.company,
      description: brand.description,
      avatar: brand.avatar,
      website: brand.website,
      verified: brand.verified,
      createdAt: brand.createdAt,
      totalBriefs,
      activeBriefs,
      avgBriefBudget,
      // Additional fields for detailed view
    };
  } catch (error) {
    console.error("Error fetching brand:", error);
    throw new Error("Failed to fetch brand");
  }
}
