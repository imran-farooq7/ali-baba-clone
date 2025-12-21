// app/(manufacturer)/profile/page.tsx
import { getCurrentUser } from "@/lib/auth";
import ManufacturerDashboardLayout from "@/components/manufacturer/ManufacturerDashboardLayout";
import CertificationUpload from "@/components/manufacturer/CertificationUpload";
import { redirect } from "next/navigation";

export default async function ManufacturerProfilePage() {
  const user = await getCurrentUser();

  if (!user || user.type !== "manufacturer") {
    redirect("/auth/login");
  }

  return (
    <ManufacturerDashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Profile & Capabilities
          </h1>
          <p className="text-gray-600">
            Complete your profile to get verified and attract more brands
          </p>
        </div>
        <CapabilitySetupForm manufacturerId={user.id} />
        <CertificationUpload manufacturerId={user.id} />
      </div>
    </ManufacturerDashboardLayout>
  );
}
