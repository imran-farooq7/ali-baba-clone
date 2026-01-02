import { ReactNode } from "react";
import "@/app/globals.css";

const ChatLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
};

export default ChatLayout;
