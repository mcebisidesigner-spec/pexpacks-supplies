"use client";

import { useCallback, useEffect, useState } from "react";
import { ShoppingCartIcon } from "@/components/ui/icons";
import { usePackTrayStore } from "@/store/usePackTrayStore";
import { useHasMounted } from "@/hooks/useHasMounted";
import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";

export function HeaderOrderIcon() {
  const hasMounted = useHasMounted();
  const packs = usePackTrayStore((s) => s.packs);
  const openTray = usePackTrayStore((s) => s.openTray);
  const [animate, setAnimate] = useState(false);

  const packCount = packs.length;

  useEffect(() => {
    if (packCount > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 600);
      return () => clearTimeout(timer);
    }
  }, [packCount]);

  const handleClick = useCallback(() => {
    openTray();
  }, [openTray]);

  if (!hasMounted) {
    return (
      <button
        type="button"
        className="relative w-10 h-10 min-w-10 min-h-10 border-0 rounded-full bg-transparent text-pex-navy cursor-pointer inline-grid place-items-center opacity-0 pointer-events-none"
        aria-label="Fill up your Backpack"
        disabled
      >
        <ShoppingCartIcon size={22} />
      </button>
    );
  }

  return (
    <Tooltip content="Fill up your Backpack" position="bottom">
      <button
        type="button"
        className={cn(
          "relative w-10 h-10 min-w-10 min-h-10 border-0 rounded-full bg-transparent text-pex-navy cursor-pointer inline-grid place-items-center transition-colors duration-200 hover:text-pex-keppel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pex-coral focus-visible:ring-offset-2",
          animate && "animate-[iconPop_0.5s_cubic-bezier(0.16,1,0.3,1)] motion-reduce:animate-none"
        )}
        onClick={handleClick}
        aria-label={`Fill up your Backpack (${packCount} pack${packCount === 1 ? "" : "s"})`}
      >
        <ShoppingCartIcon size={22} />
        <span
          className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 rounded-full bg-pex-coral text-white text-[10px] font-extrabold leading-4 text-center flex items-center justify-center pointer-events-none shadow-[0_1px_3px_rgba(0,0,0,0.15)] select-none"
          aria-hidden="true"
        >
          {packCount > 9 ? "9+" : packCount}
        </span>
      </button>
    </Tooltip>
  );
}
