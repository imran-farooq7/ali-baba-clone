// app/(manufacturer)/proposals/[id]/page.tsx
import { getCurrentUser } from "@/lib/auth";
import ManufacturerDashboardLayout from "@/components/manufacturer/ManufacturerDashboardLayout";
import { redirect } from "next/navigation";
import ProposalDetail from "@/components/proposals/proposal-details";

export default async function ManufacturerProposalDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user || user.type !== "MANUFACTURER") redirect("/auth/login");

  return <ProposalDetail />;
}
