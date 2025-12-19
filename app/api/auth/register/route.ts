// app/api/auth/register/route.ts - COMPLETE
import { createUser } from "@/db/client";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password, name, type, company } = await request.json();
    const supabase = await createClient();

    // 1. Create auth user

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, type, company } },
    });

    if (authError) throw authError;

    // 2. Create database user
    const user = await createUser({ email, name, type, company });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
