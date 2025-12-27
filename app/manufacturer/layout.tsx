import { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import ManufacturerDashboardLayout from "@/components/manufacturer/ManufacturerDashboardLayout";

const ManufacturerLayout = async ({ children }: { children: ReactNode }) => {
  const user = await getCurrentUser();
  if (!user || user.type !== "MANUFACTURER") redirect("/auth/login");
  return (
    <ManufacturerDashboardLayout user={user}>
      {children}
    </ManufacturerDashboardLayout>
  );
};

export default ManufacturerLayout;
