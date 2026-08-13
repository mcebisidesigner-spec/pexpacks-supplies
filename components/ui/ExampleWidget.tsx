"use client";

import { ShoppingBag, School, ShieldCheck, CheckCircle2 } from "lucide-react";

export function ExampleWidget() {
  return (
    <div className="flex items-center gap-2">
      <School className="w-5 h-5 text-indigo-600" />
      <ShoppingBag className="w-5 h-5 text-emerald-600" />
      <ShieldCheck className="w-5 h-5 text-amber-600" />
      <CheckCircle2 className="w-5 h-5 text-blue-600" />
    </div>
  );
}
