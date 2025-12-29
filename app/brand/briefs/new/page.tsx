import BriefCreationForm from "@/components/brand/BriefCreationForm";
import { getCurrentUser } from "@/lib/auth";

const NewBriefPage = async () => {
  const user = await getCurrentUser();
  return (
    <div>
      <BriefCreationForm userId={user?.id!} />
    </div>
  );
};

export default NewBriefPage;
