import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

type FooterHappyPayLinkProps = {
  className?: string;
};

export function FooterHappyPayLink({ className }: FooterHappyPayLinkProps) {
  return (
    <Link
      href="/happy-pay"
      className={cn(
        "relative inline-flex items-start justify-center flex-none leading-none no-underline m-0 p-0 focus-visible:outline-2 focus-visible:outline-[var(--pex-coral,#ff6f59)] focus-visible:outline-offset-4 focus-visible:rounded-full after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:min-w-12 after:min-h-12",
        className
      )}
      aria-label="Happy Pay - buy now, pay later"
    >
      <Image
        src="/images/happypay-logo-yellow.svg"
        alt="Happy Pay"
        width={90}
        height={24}
        className="block w-full h-auto m-0 p-0"
      />
    </Link>
  );
}

