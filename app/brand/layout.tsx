import { ReactNode } from "react";
import BrandDashboardLayout from "@/components/brand/BrandDashboardLayout";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

const BrandLayout = async ({ children }: { children: ReactNode }) => {
  const user = await getCurrentUser();
  if (!user || user.type !== "BRAND") redirect("/auth/login");
  return <BrandDashboardLayout user={user}>{children}</BrandDashboardLayout>;
};

export default BrandLayout;
