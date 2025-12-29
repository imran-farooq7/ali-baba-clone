// app/(brand)/briefs/page.tsx
import { getCurrentUser } from "@/lib/auth";
import BriefList from "@/components/brand/BriefList";
import { redirect } from "next/navigation";
import { prisma } from "@/prisma/prisma";

export default async function BriefsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch briefs for this brand
  const briefs = await prisma.brief.findMany({
    where: { brandId: user.id },
    include: {
      proposals: {
        select: { id: true, status: true },
      },
      _count: {
        select: { proposals: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Briefs</h1>
        <p className="text-gray-600">
          Manage your manufacturing briefs and proposals
        </p>
      </div>

      <BriefList briefs={briefs} brandId={user.id} />
    </div>
  );
}
