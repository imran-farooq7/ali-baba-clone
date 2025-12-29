import ProposalList from "@/components/proposals/ProposalList";
import { getCurrentUser } from "@/lib/auth";

const ProposalsPage = async () => {
  const user = await getCurrentUser();

  return <ProposalList brandId={user?.id!} />;
};

export default ProposalsPage;
