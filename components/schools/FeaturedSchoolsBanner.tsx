import { SectionHeader } from "@/components/marketing/SectionHeader";
import type { SchoolSearchRecord } from "@/lib/schools/types";
import { FeaturedSchoolCard } from "./FeaturedSchoolCard";

type FeaturedSchoolsBannerProps = {
  schools: SchoolSearchRecord[];
};

export function FeaturedSchoolsBanner({ schools }: FeaturedSchoolsBannerProps) {
  return (
    <section
      className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-[clamp(24px,4vw,56px)] py-12 lg:py-14"
      aria-labelledby="featured-schools-heading"
    >
      <div className="w-full max-w-[1280px] mx-auto px-0 mb-8 sm:mb-10">
        <SectionHeader
          eyebrow="Most popular"
          title="Popular schools"
          text="Start with one of our popular school pack pages, or search for your school above."
          headingId="featured-schools-heading"
        />
      </div>
      <div className="w-full max-w-[1280px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-[22px]">
        {schools.map((school, index) => (
          <FeaturedSchoolCard
            school={school}
            position={index + 1}
            key={school.id}
          />
        ))}
      </div>
    </section>
  );
}

