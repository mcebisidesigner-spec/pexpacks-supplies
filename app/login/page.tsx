import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { LoginForm } from "./LoginForm";
import styles from "./login.module.css";

export const metadata: Metadata = buildMetadata(
  "Admin Login | Pexpacks",
  "Sign in to the Pexpacks administrator portal to manage orders and form submissions.",
  "/login"
);

type LoginPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, message } = await searchParams;

  return (
    <div className={styles.container}>
      <LoginForm error={error} message={message} />
    </div>
  );
}
