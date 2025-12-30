import { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import ManufacturerDashboardLayout from "@/components/manufacturer/ManufacturerDashboardLayout";
import "@/app/globals.css";

const ManufacturerLayout = async ({ children }: { children: ReactNode }) => {
  const user = await getCurrentUser();
  if (!user || user.type !== "MANUFACTURER") redirect("/login");
  return (
    <html>
      <body>
        <ManufacturerDashboardLayout user={user}>
          {children}
        </ManufacturerDashboardLayout>
      </body>
    </html>
  );
};

export default ManufacturerLayout;
