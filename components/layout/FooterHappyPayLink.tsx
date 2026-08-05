import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import styles from "./Footer.module.css";

type FooterHappyPayLinkProps = {
  className?: string;
};

export function FooterHappyPayLink({ className }: FooterHappyPayLinkProps) {
  return (
    <Link
      href="/happy-pay"
      className={clsx(styles.happyPayLink, className)}
      aria-label="Happy Pay - buy now, pay later"
    >
      <Image
        src="/images/happypay-logo-yellow.svg"
        alt="Happy Pay"
        width={90}
        height={24}
        className={styles.happyPayLogo}
      />
    </Link>
  );
}
