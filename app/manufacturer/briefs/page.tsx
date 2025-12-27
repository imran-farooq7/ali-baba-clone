// app/(manufacturer)/briefs/page.tsx
import ManufacturerBriefList from "@/components/manufacturer/ManufacturerBriefList";
import { prisma } from "@/db/client";
import { getCurrentUser } from "@/lib/auth";

export default async function ManufacturerBriefsPage() {
  const user = await getCurrentUser();

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
        where: { manufacturerId: user?.id },
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Available Briefs</h1>
        <p className="text-gray-600">
          Browse manufacturing briefs and submit proposals
        </p>
      </div>
      <ManufacturerBriefList briefs={briefs} manufacturerId={user?.id!} />
    </div>
  );
}
