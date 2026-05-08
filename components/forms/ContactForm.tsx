"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { generalEmail } from "@/data/contact";
import styles from "@/components/marketing/Marketing.module.css";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`PexPacks enquiry: ${formData.get("type") ?? "General enquiry"}`);
    const body = encodeURIComponent(
      [
        `Name: ${formData.get("name") ?? ""}`,
        `Email: ${formData.get("email") ?? ""}`,
        `Phone: ${formData.get("phone") ?? ""}`,
        `Enquiry type: ${formData.get("type") ?? ""}`,
        "",
        `${formData.get("message") ?? ""}`
      ].join("\n")
    );

    setSubmitted(true);
    window.location.href = `mailto:${generalEmail}?subject=${subject}&body=${body}`;
  }

  return (
    <div className={styles.formCard}>
      <form onSubmit={handleSubmit}>
        <h2>Send an enquiry</h2>
        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>Name</span>
            <input name="name" placeholder="Your name" required />
          </label>
          <label className={styles.field}>
            <span>Email</span>
            <input name="email" type="email" placeholder="name@example.com" required />
          </label>
          <label className={styles.field}>
            <span>Phone</span>
            <input name="phone" type="tel" placeholder="+27" />
          </label>
          <label className={styles.field}>
            <span>Enquiry type</span>
            <select name="type" required defaultValue="">
              <option value="" disabled>
                Choose enquiry type
              </option>
              <option>Parent order</option>
              <option>School partnership</option>
              <option>Office pack</option>
              <option>PexPacks</option>
              <option>Sponsorship</option>
              <option>Supplier partnership</option>
              <option>General enquiry</option>
            </select>
          </label>
          <label className={`${styles.field} ${styles.formWide}`}>
            <span>Message</span>
            <textarea name="message" placeholder="Tell us what you need" required />
          </label>
        </div>
        <Button type="submit">Send enquiry</Button>
        {submitted ? (
          <p className={styles.statusMessage} role="status" aria-live="polite">
            Opening your email app so you can send this enquiry to PexPacks.
          </p>
        ) : null}
      </form>
    </div>
  );
}
