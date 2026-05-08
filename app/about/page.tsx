import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { buildMetadata } from "@/lib/seo";
import page from "@/styles/Page.module.css";

export const metadata: Metadata = buildMetadata(
  "About",
  "PexPacks helps South African families, schools and businesses order ready-to-use school and office stationery packs.",
  "/about"
);

export default function AboutPage() {
  return (
    <>
      <section className={page.pageHero}>
        <div className={page.pageHeroNarrow}>
          <p>About PexPacks</p>
          <h1>A simple digital office for stationery packs</h1>
          <p className={page.pageHeroText}>
            PexPacks helps parents, learners, schools, teachers, offices and small businesses order practical
            stationery packs without the last-minute rush.
          </p>
        </div>
      </section>
      <section className={page.section}>
        <div className={`${page.sectionInner} ${page.twoColumn}`}>
          <div className={page.infoCard}>
            <h2>Everything they need to start learning</h2>
            <p>
              We prepare school stationery packs from Grade R to Grade 12 according to the relevant school list and grade
              requirements.
            </p>
            <p>
              We also support home offices and SMEs with ready-to-order office stationery packs for recurring supply needs.
            </p>
            <Button href="/schools">Find your school pack</Button>
          </div>
          <div className={page.imageCard}>
            <Image
              src="/images/stationery-brand.webp"
              alt="PexPacks stationery products arranged on a desk"
              width={1536}
              height={768}
              sizes="(max-width: 860px) 100vw, 45vw"
            />
          </div>
        </div>
      </section>
    </>
  );
}
