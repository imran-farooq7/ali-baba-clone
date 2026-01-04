import { ReactNode } from "react";
import BrandDashboardLayout from "@/components/brand/BrandDashboardLayout";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import "@/app/globals.css";
import { Toaster } from "react-hot-toast";
import { AIAssistantProvider } from "@/context/AiAssistantWrapper";
import AiChatAssistant from "@/components/ai/AiChatAssistant";

const BrandLayout = async ({ children }: { children: ReactNode }) => {
  const user = await getCurrentUser();
  if (!user || user.type !== "BRAND") redirect("/login");
  return (
    <html>
      <body>
        <AIAssistantProvider>
          <BrandDashboardLayout user={user}>{children}</BrandDashboardLayout>;
          <AiChatAssistant />
          <Toaster />
        </AIAssistantProvider>
      </body>
    </html>
  );
};

export default BrandLayout;
