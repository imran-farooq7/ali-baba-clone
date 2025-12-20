// lib/auth.ts
import { prisma } from "@/db/client";
import { createClient } from "./supabase/server";

// Fetch current user from Supabase and your Prisma database
export const getCurrentUser = async () => {
  try {
    const supabase = await createClient();

    // Get the authenticated user from Supabase Auth
    const {
      data: { user: supabaseUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !supabaseUser) {
      console.error("Auth error or no user found:", authError?.message);
      return null;
    }

    // Get the corresponding user from your Prisma database
    // Use the Supabase user ID as the connection
    const prismaUser = await prisma.user.findUnique({
      where: { id: supabaseUser.id },
    });

    if (!prismaUser) {
      // If user doesn't exist in your Prisma prisma, create one
      // This happens on first login
      const newUser = await prisma.user.create({
        data: {
          id: supabaseUser.id,
          email: supabaseUser.email || "",
          name: supabaseUser.user_metadata?.name || "User",
          type: supabaseUser.user_metadata?.type || "brand",
          company: supabaseUser.user_metadata?.company || null,
          avatar: supabaseUser.user_metadata?.avatar_url || null,
        },
      });
      return newUser;
    }

    return prismaUser;
  } catch (error) {
    console.error("Error getting current user:", error);
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
  return user?.type === "brand";
};

export const isManufacturer = async () => {
  const user = await getCurrentUser();
  return user?.type === "manufacturer";
};

// Redirect if not authenticated (for middleware)
export const redirectIfUnauthenticated = async () => {
  const user = await getCurrentUser();

  if (!user) {
    return { redirect: { destination: "/auth/login", permanent: false } };
  }

  return { props: { user } };
};
