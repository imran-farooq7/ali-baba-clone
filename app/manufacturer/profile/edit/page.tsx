import ManufacturerEditForm from "@/components/manufacturer/ManufacturerEditForm";
import { getCurrentUser } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ManufacturerEditPage() {
  const user = await getCurrentUser();

  if (!user || user.type !== "MANUFACTURER") {
    redirect("/auth/login");
  }

  // Fetch current manufacturer data
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/manufacturers/${user.id}`,
    {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch manufacturer data");
  }

  const manufacturerData = await response.json();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/manufacturer/profile"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Link>

          <h1 className="text-3xl font-bold text-gray-900">
            Edit Manufacturer Profile
          </h1>
          <p className="text-gray-600 mt-2">
            Update your company information, capabilities, and production
            details
          </p>
        </div>

        {/* Edit Form */}
        <ManufacturerEditForm manufacturer={manufacturerData} />
      </div>
    </div>
  );
}
