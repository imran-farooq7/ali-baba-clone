// app/(auth)/login/page.tsx
import LoginForm from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - ManufacturHub",
  description: "Sign in to your ManufacturHub account",
};

export default function LoginPage() {
  return <LoginForm />;
}
