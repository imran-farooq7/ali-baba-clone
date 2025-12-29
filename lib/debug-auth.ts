// lib/auth/debug-auth.ts
// import { prisma } from "@/db/prisma";
import { createClient } from "@/lib/supabase/server";

export const debugGetCurrentUser = async () => {
  console.log("🔍 [DEBUG] Starting getCurrentUser...");

  try {
    // Step 1: Create Supabase client
    console.log("🔍 [DEBUG] Creating Supabase client...");
    const supabase = await createClient();
    console.log("✅ [DEBUG] Supabase client created");

    // Step 2: Get user from Supabase Auth
    console.log("🔍 [DEBUG] Getting user from Supabase Auth...");
    const {
      data: { user: supabaseUser },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("🔍 [DEBUG] Supabase Auth response:", {
      hasUser: !!supabaseUser,
      authError: authError?.message,
    });

    if (authError) {
      console.error("❌ [DEBUG] Supabase Auth error:", authError);
      return null;
    }

    if (!supabaseUser) {
      console.log("❌ [DEBUG] No Supabase user found");
      return null;
    }

    console.log("✅ [DEBUG] Supabase user found:", {
      id: supabaseUser.id,
      email: supabaseUser.email,
    });

    // Step 3: Try to get user from Prisma
    console.log("🔍 [DEBUG] Looking for user in Prisma...");
    // try {
    //   const prismaUser = await prisma.user.findUnique({
    //     where: { id: supabaseUser.id },
    //   });

    //   console.log("🔍 [DEBUG] Prisma response:", {
    //     foundUser: !!prismaUser,
    //     userId: supabaseUser.id,
    //   });

    //   if (prismaUser) {
    //     console.log("✅ [DEBUG] Returning existing Prisma user");
    //     return prismaUser;
    //   }

    //   // Step 4: Create new user if not found
    //   console.log("🔍 [DEBUG] Creating new user in Prisma...");
    //   const newUser = await prisma.user.create({
    //     data: {
    //       id: supabaseUser.id,
    //       email: supabaseUser.email || "",
    //       name: supabaseUser.user_metadata?.name || "User",
    //       type: "BRAND", // Default type
    //       company: supabaseUser.user_metadata?.company || null,
    //       avatar: supabaseUser.user_metadata?.avatar_url || null,
    //     },
    //   });

    //   console.log("✅ [DEBUG] New user created:", newUser.id);
    //   return newUser;
    // } catch (prismaError: any) {
    //   console.error("❌ [DEBUG] Prisma error:", {
    //     message: prismaError.message,
    //     code: prismaError.code,
    //     meta: prismaError.meta,
    //   });
    //   return null;
    // }
  } catch (error: any) {
    console.error("❌ [DEBUG] Uncaught error in getCurrentUser:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return null;
  }
};
