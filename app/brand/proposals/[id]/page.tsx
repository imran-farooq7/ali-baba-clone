// app/(brand)/proposals/[id]/page.tsx
import ProposalDetail from "@/components/proposals/proposal-details";

export default async function BrandProposalDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <ProposalDetail />;
}
