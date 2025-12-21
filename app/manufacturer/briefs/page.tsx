// app/(manufacturer)/briefs/page.tsx
import { getCurrentUser } from "@/lib/auth";
import ManufacturerDashboardLayout from "@/components/manufacturer/ManufacturerDashboardLayout";
import ManufacturerBriefList from "@/components/manufacturer/ManufacturerBriefList";
import { redirect } from "next/navigation";
import { prisma } from "@/db/client";

export default async function ManufacturerBriefsPage() {
  const user = await getCurrentUser();

  if (!user || user.type !== "manufacturer") {
    redirect("/auth/login");
  }

  const briefs = await prisma.brief.findMany({
    where: {
      status: "PUBLISHED",
      brand: {
        company: {
          not: null,
        },
      },
      // Add location/category matching logic here
    },
    include: {
      brand: {
        select: { name: true, company: true, id: true },
      },
      proposals: {
        where: { manufacturerId: user.id },
        select: { id: true, status: true },
      },
      _count: {
        select: { proposals: true },
      },
    },
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  return (
    <ManufacturerDashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Available Briefs</h1>
          <p className="text-gray-600">
            Browse manufacturing briefs and submit proposals
          </p>
        </div>
        <ManufacturerBriefList briefs={briefs} manufacturerId={user.id} />
      </div>
    </ManufacturerDashboardLayout>
  );
}
