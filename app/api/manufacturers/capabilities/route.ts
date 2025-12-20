// app/api/manufacturers/capabilities/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/db/client";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.type !== "manufacturer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { capabilities, certifications, companyInfo } = body;

    // Update manufacturer capabilities
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        capabilities: capabilities.map((c: any) => c.name),
        certifications: certifications.map((c: any) => c.name),
        company: companyInfo.companyName,
        minOrderQuantity: parseInt(companyInfo.minOrderQuantity) || null,
        maxOrderQuantity: parseInt(companyInfo.maxOrderQuantity) || null,
        productionCapacity: parseInt(companyInfo.productionCapacity) || null,
        // Mark as verified if they have certifications
        verified: certifications.length > 0,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Capabilities updated successfully",
    });
  } catch (error) {
    console.error("Error updating capabilities:", error);
    return NextResponse.json(
      { error: "Failed to update capabilities" },
      { status: 500 }
    );
  }
}
