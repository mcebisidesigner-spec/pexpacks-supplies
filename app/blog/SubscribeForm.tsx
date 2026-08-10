"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import styles from "./Blog.module.css";

export function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className={styles.subscribeCard}>
        <div className={styles.subscribeSuccess}>
          <p className={styles.subscribeSuccessText}>
            You&rsquo;re in! Check your inbox soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.subscribeCard}>
      <h2 className={styles.subscribeTitle}>Stay Equipped</h2>
      <p className={styles.subscribeText}>
        Get fresh resources and restock reminders delivered to your inbox.
      </p>
      <form onSubmit={handleSubmit} className={styles.subscribeForm}>
        <div className={styles.subscribeField}>
          <label htmlFor="subscribe-email">Email address</label>
          <input
            id="subscribe-email"
            type="email"
            autoComplete="email"
            required
            placeholder="parent@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Button type="submit" variant="primary" size="md">
          Subscribe
        </Button>
      </form>
    </div>
  );
}
