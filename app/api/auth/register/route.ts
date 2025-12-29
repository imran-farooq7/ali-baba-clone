// app/api/auth/register/route.ts - UPDATED
import { prisma } from "@/prisma/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { supabaseUserId, email, name, company, type } = data;

    if (!supabaseUserId || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert type to uppercase to match UserType enum
    const userType = type?.toUpperCase() || "BRAND";

    // Validate type is one of the enum values
    const validTypes = ["BRAND", "MANUFACTURER", "ADMIN"];
    if (!validTypes.includes(userType)) {
      return NextResponse.json({ error: "Invalid user type" }, { status: 400 });
    }

    // Create user in Prisma database
    const user = await prisma.user.create({
      data: {
        id: supabaseUserId,
        email,
        name,
        company: company || null,
        type: userType, // Now uppercase
        // Set default values for required arrays
        preferredCategories: [],
        capabilities: [],
        certifications: [],
        locations: [],
        industries: [],
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.type,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);

    // Handle unique constraint violations
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create user profile", details: error.message },
      { status: 500 }
    );
  }
}
