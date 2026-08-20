import { ArrowUpRight } from "lucide-react";

import { Container, SectionHeading } from "@/components/ui/container";
import { ResponsiveMedia, type MediaSource } from "@/components/ui/media";

export function SocialGallery({
  eyebrow,
  handle,
  images,
  profileHref,
  title,
}: {
  eyebrow?: string;
  handle: string;
  images: Array<MediaSource & { href?: string }>;
  profileHref: string;
  title: string;
}) {
  return (
    <section className="bg-[#fffaf4] py-16 text-[#2b1e20] sm:py-20 lg:py-28">
      <Container>
        <div className="flex items-end justify-between gap-6">
          <SectionHeading eyebrow={eyebrow}>{title}</SectionHeading>
          <a
            href={profileHref}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-sm text-xs font-bold uppercase tracking-[0.14em] text-[#8b4255] underline decoration-[#d3a5ae] underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4255] sm:inline-flex"
          >
            {handle} <ArrowUpRight aria-hidden="true" size={15} />
          </a>
        </div>
        <div className="mt-9 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 lg:gap-5">
          {images.slice(0, 4).map((image, index) => {
            const tile = (
              <div className="relative aspect-square overflow-hidden rounded-[1.25rem] bg-[#eadbd5]">
                <ResponsiveMedia
                  media={image}
                  sizes="(min-width: 640px) 25vw, 50vw"
                  className="transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
                <div className="absolute inset-0 bg-[#5b2937]/0 transition-colors group-hover:bg-[#5b2937]/10 motion-reduce:transition-none" />
              </div>
            );
            return image.href ? (
              <a
                key={`${image.src}-${index}`}
                href={image.href}
                target="_blank"
                rel="noreferrer"
                className="group rounded-[1.25rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4255] focus-visible:ring-offset-4"
              >
                {tile}
              </a>
            ) : (
              <div key={`${image.src}-${index}`} className="group">
                {tile}
              </div>
            );
          })}
        </div>
        <a
          href={profileHref}
          target="_blank"
          rel="noreferrer"
          className="mt-7 inline-flex items-center gap-2 rounded-sm text-xs font-bold uppercase tracking-[0.14em] text-[#8b4255] underline decoration-[#d3a5ae] underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4255] sm:hidden"
        >
          {handle} <ArrowUpRight aria-hidden="true" size={15} />
        </a>
      </Container>
    </section>
  );
}
