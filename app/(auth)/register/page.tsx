// app/(auth)/register/page.tsx
import RegisterForm from "@/components/auth/RegisterForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account - ManufacturHub",
  description: "Create a new account on ManufacturHub",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
