"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useNotification } from "@/components/ui/NotificationProvider";

export function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { notify } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;
    setLoading(true);

    try {
      const response = await fetch("/api/forms/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "newsletter-subscribe",
          fullName: "Newsletter Subscriber",
          email,
          consent: true,
          message: `New blog newsletter subscription request for: ${email}`,
        }),
      });
      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
      };
      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Something went wrong while subscribing.",
        );
      }
      notify({
        tone: "success",
        title: "You are subscribed",
        message:
          "Thanks — I will send useful school and stationery updates to your inbox.",
      });
      setSubmitted(true);
    } catch {
      notify({
        tone: "error",
        title: "Subscription not sent",
        message:
          "Please try again, or check the email address and your connection.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 shadow-sm max-w-3xl mx-auto text-center">
        <div className="py-4">
          <h3 className="text-2xl font-extrabold font-heading text-pex-navy m-0 mb-2">
            You&rsquo;re all set!
          </h3>
          <p className="text-slate-600 text-sm sm:text-base m-0">
            Thank you for subscribing. We&rsquo;ll send fresh resources and restock
            reminders straight to your inbox.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 shadow-sm max-w-3xl mx-auto text-center">
      <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-pex-navy m-0 mb-2">
        Stay Equipped
      </h2>
      <p className="text-slate-600 text-sm sm:text-base leading-relaxed m-0 mb-8 max-w-lg mx-auto">
        Get fresh resources and restock reminders delivered to your inbox.
      </p>

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto text-left">
        <label
          htmlFor="subscribe-email"
          className="block text-xs sm:text-sm font-extrabold text-pex-navy mb-2"
        >
          Email address
        </label>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch">
          <input
            id="subscribe-email"
            type="email"
            autoComplete="email"
            required
            placeholder="parent@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 h-12 sm:h-13 rounded-2xl border border-slate-300/80 bg-white px-4 text-sm sm:text-base text-pex-navy placeholder:text-slate-400 outline-none transition-all duration-150 focus:border-pex-keppel focus:ring-2 focus:ring-pex-keppel/20 shadow-2xs"
          />
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="h-12 sm:h-13 px-8 rounded-2xl text-sm sm:text-base font-extrabold shadow-md shadow-pex-coral/25 cursor-pointer shrink-0"
          >
            {loading ? "Subscribing..." : "Subscribe"}
          </Button>
        </div>
      </form>
    </div>
  );
}
