"use client";
import { logout } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { log } from "console";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

const LogoutBtn = () => {
  const router = useRouter();
  const logoutUser = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Client logout error:", error.message);
        return { success: false, error: error.message };
      }

      // Clear local storage
      localStorage.removeItem("supabase.auth.token");

      // Clear any application-specific storage
      const appKeys = Object.keys(localStorage).filter(
        (key) => key.startsWith("manufactura-") || key.startsWith("brief-")
      );
      appKeys.forEach((key) => localStorage.removeItem(key));

      // Clear session storage
      sessionStorage.clear();
      router.refresh();
      return { success: true };
    } catch (error: any) {
      console.error("Client logout failed:", error);
      return { success: false, error: error.message };
    }
  };

  return (
    <button
      className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
      onClick={logoutUser}
    >
      <LogOut className="h-4 w-4" />
      <span className="text-sm">Sign out</span>
    </button>
  );
};

export default LogoutBtn;
