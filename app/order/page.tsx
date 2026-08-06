import { Metadata } from "next";
import styles from "./OrderPage.module.css";
import heroStyles from "@/components/marketing/HeroBase.module.css";
import { OrderForm } from "./OrderForm";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

import { buildWhatsAppHref } from "@/data/contact";

export const metadata: Metadata = {
  title: "Order a Custom Pack | Pexpacks",
  description: "Upload your school stationery list and we will send you a custom quote.",
};

const WHATSAPP_URL = buildWhatsAppHref("Hi Pexpacks! I'd like to order a custom stationery pack. Here is my list:");

export default function OrderPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        
        {/* Left Side: The Pitch */}
        <div className={styles.pitchSection}>
          <p className={heroStyles.eyebrow}>Custom stationery concierge</p>
          <h1>Let us pack it for you.</h1>
          
          <div className={styles.searchPromo}>
            <p>
              <strong>Wait! Did you check if we already have your school?</strong><br/>
              We have hundreds of standard packs ready to go. <Link href="/schools" className={styles.searchLink}>Search for your school pack here.</Link>
            </p>
          </div>

          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepIcon}>1</div>
              <div className={styles.stepContent}>
                <h3>Upload or Type</h3>
                <p>Snap a photo of your school list or type it out.</p>
              </div>
            </div>
            
            <div className={styles.step}>
              <div className={styles.stepIcon}>2</div>
              <div className={styles.stepContent}>
                <h3>Get a Quote</h3>
                <p>We review your list and send a custom quote to your WhatsApp within 2 hours.</p>
              </div>
            </div>
            
            <div className={styles.step}>
              <div className={styles.stepIcon}>3</div>
              <div className={styles.stepContent}>
                <h3>Packed & Delivered</h3>
                <p>Approve the quote, pay securely, and your custom pack arrives at your door.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: The Form */}
        <div className={styles.formColumn}>
          <OrderForm />

          <div className={styles.whatsappFallback}>
            <p>In a rush or prefer chatting?</p>
            <Button 
              href={WHATSAPP_URL} 
              variant="outline" 
              size="md"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp us your list instead
            </Button>
          </div>
        </div>
        
      </div>
    </main>
  );
}
