import { ArrowUpRight, Quote } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { Container, Eyebrow } from "@/components/ui/container";
import { ResponsiveMedia, type MediaSource } from "@/components/ui/media";

export function EditorialStory({
  action,
  body,
  eyebrow,
  image,
  quote,
  title,
}: {
  action?: { href: string; label: string };
  body: string;
  eyebrow?: string;
  image?: MediaSource | null;
  quote?: string;
  title: string;
}) {
  return (
    <section className="overflow-hidden bg-[#f6e7e5] py-16 text-[#2b1e20] sm:py-20 lg:py-28">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)] lg:gap-16 xl:gap-24">
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[50%_50%_2rem_2rem] bg-[#e1c0bd] sm:aspect-[5/6]">
              <ResponsiveMedia
                media={image}
                sizes="(min-width: 1024px) 54vw, 100vw"
                className="object-[center_32%]"
              />
            </div>
            <span aria-hidden="true" className="absolute -bottom-6 -right-3 font-serif text-8xl leading-none text-[#c9788a]/65 sm:-right-8 sm:text-9xl">✦</span>
          </div>
          <div className="lg:py-8">
            {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
            <h2 className="mt-4 text-balance font-serif text-5xl leading-[0.92] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              {title}
            </h2>
            <p className="mt-6 max-w-xl text-pretty text-base leading-8 text-[#5f4b49]">{body}</p>
            {quote ? (
              <blockquote className="mt-8 border-l border-[#b56777] pl-5">
                <Quote aria-hidden="true" className="mb-3 text-[#b56777]" size={20} strokeWidth={1.4} />
                <p className="font-serif text-2xl italic leading-snug text-[#6a3544]">{quote}</p>
              </blockquote>
            ) : null}
            {action ? (
              <Link href={action.href} className={buttonStyles({ className: "mt-8", variant: "secondary" })}>
                {action.label} <ArrowUpRight aria-hidden="true" size={16} />
              </Link>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
