import Link from "next/link";
import styles from "@/app/checkout/Checkout.module.css";

export function TrustChecklist() {
  return (
    <ul className={styles.trustList} role="list">
      <li>Packed according to the school list</li>
      <li>We use brands as per school list</li>
      <li>
        <Link href="/terms">Read our terms and conditions</Link>
      </li>
    </ul>
  );
}
