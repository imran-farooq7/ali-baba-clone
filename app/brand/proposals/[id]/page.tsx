// app/(brand)/proposals/[id]/page.tsx
import BrandDashboardLayout from "@/components/brand/BrandDashboardLayout";
import ProposalDetail from "@/components/proposals/proposal-details";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function BrandProposalDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user || user.type !== "BRAND") redirect("/auth/login");

  return (
    <BrandDashboardLayout user={user}>
      <ProposalDetail />
    </BrandDashboardLayout>
  );
}
