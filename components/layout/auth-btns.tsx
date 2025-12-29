// components/auth/auth-buttons.tsx

import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { getCurrentUser, logout } from "@/lib/auth";
import LogoutBtn from "../auth/logout-btn";

export async function AuthButtons() {
  const user = await getCurrentUser();
  const isBrandOrManufacturer =
    user?.type === "BRAND" ? "brand" : "manufacturer";
  if (!user) {
    return (
      <div className="flex items-center space-x-3">
        <Link
          href="/login"
          className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
        >
          Sign in
        </Link>

        <Link
          href="/register"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          Get Started
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <Link
        href={` /${isBrandOrManufacturer}/dashboard`}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        <User className="h-4 w-4" />
        <span className="text-sm font-medium">Dashboard</span>
      </Link>

      <LogoutBtn />
    </div>
  );
}
