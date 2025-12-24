// app/(manufacturer)/profile/page.tsx
import { getCurrentUser } from "@/lib/auth";
import ManufacturerDashboardLayout from "@/components/manufacturer/ManufacturerDashboardLayout";
import CertificationUpload from "@/components/manufacturer/CertificationUpload";
import { AlertCircle, CheckCircle } from "lucide-react";
import { redirect } from "next/navigation";
import CapabilitySetupForm from "@/components/manufacturer/CapabilitySetupForm";

export default async function ManufacturerProfilePage() {
  const user = await getCurrentUser();

  if (!user || user.type !== "MANUFACTURER") {
    redirect("/auth/login");
  }

  return (
    <ManufacturerDashboardLayout user={user}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Profile & Capabilities
          </h1>
          <p className="text-gray-600 mt-2">
            Complete your manufacturer profile to get verified and attract more
            brands
            {!user.verified && (
              <span className="ml-2 inline-flex items-center gap-1 text-yellow-600">
                <AlertCircle className="h-4 w-4" />
                Verification pending
              </span>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main form - 2/3 width */}
          <div className="lg:col-span-2">
            <CapabilitySetupForm manufacturerId={user.id} />
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Progress summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-4">Setup Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Company Info</span>
                    <span className="text-green-600">Complete</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: "100%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Capabilities</span>
                    <span className="text-green-600">
                      {user.capabilities?.length || 0} added
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          ((user.capabilities?.length || 0) / 3) * 100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Certifications</span>
                    <span className="text-green-600">
                      {user.certifications?.length || 0} added
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          ((user.certifications?.length || 0) / 1) * 100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Benefits of Completion
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Higher search ranking for brands</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Verified badge on your profile</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>AI-powered matching with briefs</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Quick file upload */}
            <CertificationUpload manufacturerId={user.id} />
          </div>
        </div>
      </div>
    </ManufacturerDashboardLayout>
  );
}
