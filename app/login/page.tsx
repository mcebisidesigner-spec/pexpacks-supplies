import type { Metadata } from "next";
import Link from "next/link";
import { login } from "./actions";
import { buildMetadata } from "@/lib/seo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>Pexpacks Portal</span>
          <h1 className={styles.title}>Admin Login</h1>
          <p className={styles.subtitle}>
            Sign in with your Supabase administrator credentials to access the portal.
          </p>
        </div>

        {error ? (
          <div className={styles.errorAlert} role="alert">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={styles.alertIcon}>
              <path d="M12 9v4m0 4h.01M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9Z" />
            </svg>
            <span>{decodeURIComponent(error)}</span>
          </div>
        ) : null}

        {message ? (
          <div className={styles.infoAlert} role="status">
            <span>{decodeURIComponent(message)}</span>
          </div>
        ) : null}

        <form action={login} className={styles.form}>
          <div className={styles.fieldGroup}>
            <Input
              id="email"
              name="email"
              type="email"
              label="Email Address"
              placeholder="admin@pexpacks.co.za"
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.fieldGroup}>
            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="••••••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" size="lg" className={styles.submitBtn}>
            Sign In to Portal →
          </Button>
        </form>

        <div className={styles.footer}>
          <p>
            <Link href="/contact" className={styles.link}>
              Forgot Password?
            </Link>
          </p>
          <p style={{ marginTop: "0.5rem" }}>
            Do you need an account?{" "}
            <Link href="/contact" className={styles.link}>
              Contact Administrator
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
