// lib/auth.ts

import { prisma } from "@/prisma/prisma";
import { createClient } from "./supabase/server";

// Fetch current user from Supabase and your Prisma database
// lib/auth.ts - UPDATE THIS PART
export const getCurrentUser = async () => {
  try {
    const supabase = await createClient();

    const {
      data: { user: supabaseUser },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Supabase auth error:", error);
      return null;
    }

    if (!supabaseUser) {
      console.warn("No Supabase user found - user is not logged in");
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
    if (dbUser === null) {
      dbUser = await prisma.user.create({
        data: {
          id: supabaseUser.id,
          email: supabaseUser.email || "",
          name: metadata.name || supabaseUser.email?.split("@")[0] || "User",
          type: type, // Already uppercase
          company: metadata.company || null,
          avatar: metadata.avatar_url || metadata.avatar || null,
          // Default arrays
          preferredCategories: [],
          capabilities: [],
          certifications: [],
          locations: [],
          industries: [],
        },
      });
    }
    return dbUser;
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
};

// Check if user is authenticated
export const requireAuth = async () => {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  return user;
};

// Check user role/type
export const isBrand = async () => {
  const user = await getCurrentUser();
  return user?.type === "BRAND";
};

export const isManufacturer = async () => {
  const user = await getCurrentUser();
  return user?.type === "MANUFACTURER";
};
export const logout = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
};

// Redirect if not authenticated (for middleware)
export const redirectIfUnauthenticated = async () => {
  const user = await getCurrentUser();

  if (!user) {
    return { redirect: { destination: "/auth/login", permanent: false } };
  }

  return { props: { user } };
};
