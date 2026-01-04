// lib/auth-api.ts (NEW FILE)
import { NextRequest } from "next/server";
import { prisma } from "@/prisma/prisma";
import { createClient } from "@supabase/supabase-js";

export const getCurrentUserFromRequest = async (request: NextRequest) => {
  try {
    // Get token from Authorization header or cookies
    const token = getTokenFromRequest(request);

    if (!token) {
      console.log("No auth token found in request");
      return null;
    }

    // Create Supabase client with token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify token and get user
    const {
      data: { user: supabaseUser },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !supabaseUser) {
      console.log("Supabase auth error:", error?.message);
      return null;
    }

    // Get metadata and convert type to uppercase
    const metadata = supabaseUser.user_metadata || {};
    const userType = metadata.user_type?.toUpperCase() || "BRAND";

    // Validate type
    const validTypes = ["BRAND", "MANUFACTURER", "ADMIN"];
    const type = validTypes.includes(userType) ? userType : "BRAND";

    let dbUser = await prisma.user.findUnique({
      where: { id: supabaseUser.id },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: supabaseUser.id,
          email: supabaseUser.email || "",
          name: metadata.name || supabaseUser.email?.split("@")[0] || "User",
          type: type,
          company: metadata.company || null,
          avatar: metadata.avatar_url || metadata.avatar || null,
          preferredCategories: [],
          capabilities: [],
          certifications: [],
          locations: [],
          industries: [],
        },
      });
    }

    console.log(dbUser, "after creation prisma");
    return dbUser;
  } catch (error) {
    console.error("Error in getCurrentUserFromRequest:", error);
    return null;
  }
};

function getTokenFromRequest(request: NextRequest): string | null {
  // 1. Try Authorization header first
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // 2. Try Supabase cookie names
  const supabaseCookies = [
    "sb-access-token",
    "sb-<your-project-ref>-auth-token-code-verifier",
    "sb-<your-project-ref>-auth-token",
  ];

  for (const cookieName of supabaseCookies) {
    const cookie = request.cookies.get(cookieName);
    if (cookie?.value) {
      return cookie.value;
    }
  }

  return null;
}
