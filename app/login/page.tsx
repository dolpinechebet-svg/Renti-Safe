import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Staff sign in",
  description: "Secure sign-in for RentiSafe field agents and administrators.",
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return <section className="wrap" style={{ maxWidth: 580, padding: "52px 0" }}>
    <LoginForm />
  </section>;
}
