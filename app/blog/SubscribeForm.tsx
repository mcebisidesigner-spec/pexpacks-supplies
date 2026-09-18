"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;
    setLoading(true);

    try {
      await fetch("/api/forms/newsletter", {
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
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white/85 backdrop-blur-md border border-white/40 rounded-[28px] sm:rounded-[32px] p-6 sm:p-12 shadow-[0_24px_48px_rgba(26,42,64,0.06)] max-w-[640px] mx-auto text-center">
        <div className="text-center py-3">
          <p className="text-emerald-600 font-extrabold text-lg m-0">
            You&rsquo;re in! Check your inbox soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/85 backdrop-blur-md border border-white/40 rounded-[28px] sm:rounded-[32px] p-6 sm:p-12 shadow-[0_24px_48px_rgba(26,42,64,0.06)] max-w-[640px] mx-auto text-center">
      <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#1a2a40] m-0 mb-2.5">Stay Equipped</h2>
      <p className="text-slate-600 text-sm sm:text-base leading-relaxed m-0 mb-7 max-w-[480px] mx-auto">
        Get fresh resources and restock reminders delivered to your inbox.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end max-w-[520px] mx-auto">
        <div className="flex-1 min-w-0 grid gap-1.5 text-left">
          <label htmlFor="subscribe-email" className="text-xs sm:text-sm font-bold text-slate-700 leading-tight">Email address</label>
          <input
            id="subscribe-email"
            type="email"
            autoComplete="email"
            required
            placeholder="parent@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3.5 text-[15px] text-slate-800 placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-teal-600 focus-visible:ring-2 focus-visible:ring-teal-600/20 transition-all"
          />
        </div>
        <Button type="submit" variant="primary" size="md" disabled={loading} className="w-full sm:w-auto shrink-0 min-h-[44px]">
          {loading ? "Subscribing..." : "Subscribe"}
        </Button>
      </form>
    </div>
  );
}
