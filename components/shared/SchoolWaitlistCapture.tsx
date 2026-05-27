"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./SchoolWaitlistCapture.module.css";

export function SchoolWaitlistCapture() {
  const [schoolName, setSchoolName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!schoolName.trim() || !email.trim()) {
      setError("Please enter both a school name and email address.");
      return;
    }
    try {
      const supabase = createClient();
      await supabase.from("waitlist_entries").insert({
        school_name: schoolName.trim(),
        email: email.trim(),
      });
    } catch {}
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <p className={styles.success}>
        You&rsquo;re on the list. We&rsquo;ll notify {schoolName} when packs are ready.
      </p>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.label}>
        or you could leave your details and we&rsquo;ll notify you.
      </label>
      <div className={styles.row}>
        <input
          type="text"
          required
          placeholder="School name"
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
          className={styles.input}
        />
        <input
          type="email"
          required
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          Notify Me
        </button>
      </div>
      {error ? <p className={styles.error}>{error}</p> : null}
    </form>
  );
}
