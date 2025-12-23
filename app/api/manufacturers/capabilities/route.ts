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

    // Validate required fields
    if (!companyInfo.companyName || !companyInfo.description) {
      return NextResponse.json(
        { error: "Company name and description are required" },
        { status: 400 }
      );
    }

    // Prepare capabilities data
    const capabilityNames = capabilities.map((c: any) => c.name);
    const capabilityDetails = capabilities.map((c: any) => ({
      name: c.name,
      description: c.description,
      category: c.category,
      experienceLevel: c.experienceLevel,
    }));

    // Prepare certifications data
    const certificationNames = certifications.map((c: any) => c.name);
    const certificationDetails = certifications.map((c: any) => ({
      name: c.name,
      issuingAuthority: c.issuingAuthority,
      issueDate: c.issueDate,
      expiryDate: c.expiryDate,
      fileUrl: c.fileUrl,
    }));

    // Update manufacturer profile
    const updatedManufacturer = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: companyInfo.companyName, // Using company name as display name
        company: companyInfo.companyName,
        description: companyInfo.description,
        website: companyInfo.website || null,
        capabilities: capabilityNames,
        certifications: certificationNames,
        minOrderQuantity: companyInfo.minOrderQuantity
          ? parseInt(companyInfo.minOrderQuantity)
          : null,
        maxOrderQuantity: companyInfo.maxOrderQuantity
          ? parseInt(companyInfo.maxOrderQuantity)
          : null,
        productionCapacity: companyInfo.productionCapacity
          ? parseInt(companyInfo.productionCapacity)
          : null,
        locations: companyInfo.locations.filter(
          (loc: string) => loc.trim() !== ""
        ),
        industries: companyInfo.industries,

        // Store detailed data in JSON fields
        capabilityDetails: capabilityDetails,
        certificationDetails: certificationDetails,

        // Mark as verified if they have certifications
        verified: certifications.length > 0,

        // Additional metadata
        metadata: {
          employeeCount: companyInfo.employees,
          foundedYear: companyInfo.foundedYear,
          setupComplete: true,
          setupCompletedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      manufacturer: {
        id: updatedManufacturer.id,
        company: updatedManufacturer.company,
        verified: updatedManufacturer.verified,
        capabilities: updatedManufacturer.capabilities.length,
        certifications: updatedManufacturer.certifications.length,
      },
      message: "Manufacturer profile updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating manufacturer capabilities:", error);

    // Handle Prisma errors
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A manufacturer with this name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update manufacturer profile: " + error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch existing capabilities
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.type !== "manufacturer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const manufacturer = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        capabilities: true,
        certifications: true,
        company: true,
        description: true,
        website: true,
        minOrderQuantity: true,
        maxOrderQuantity: true,
        productionCapacity: true,
        locations: true,
        industries: true,
        capabilityDetails: true,
        certificationDetails: true,
        verified: true,
      },
    });

    if (!manufacturer) {
      return NextResponse.json(
        { error: "Manufacturer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: manufacturer,
    });
  } catch (error) {
    console.error("Error fetching manufacturer capabilities:", error);
    return NextResponse.json(
      { error: "Failed to fetch manufacturer data" },
      { status: 500 }
    );
  }
}
