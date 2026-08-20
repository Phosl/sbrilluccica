import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { Container, Eyebrow } from "@/components/ui/container";
import { ResponsiveMedia, type MediaSource } from "@/components/ui/media";

export function StoreHero({
  body,
  eyebrow,
  image,
  primaryAction,
  secondaryAction,
  title,
}: {
  body: string;
  eyebrow?: string;
  image?: MediaSource | null;
  primaryAction: { href: string; label: string };
  secondaryAction?: { href: string; label: string };
  title: string;
}) {
  return (
    <section className="relative isolate min-h-[min(52rem,calc(100svh-4.6rem))] overflow-hidden bg-[#be7785] text-white sm:min-h-[44rem]">
      <ResponsiveMedia
        eager
        media={image}
        sizes="100vw"
        className="scale-[1.01] object-[center_38%]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(37,20,25,0.72)_0%,rgba(47,25,31,0.38)_46%,rgba(47,25,31,0.05)_78%)] sm:bg-[linear-gradient(90deg,rgba(37,20,25,0.7)_0%,rgba(47,25,31,0.28)_55%,rgba(47,25,31,0.02)_82%)]" />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#2b1e20]/30 to-transparent" />
      <Container className="relative flex min-h-[min(52rem,calc(100svh-4.6rem))] items-end py-12 sm:min-h-[44rem] sm:items-center sm:py-20">
        <div className="max-w-3xl">
          {eyebrow ? <Eyebrow className="mb-5 text-[#f5d7dd]">{eyebrow}</Eyebrow> : null}
          <h1 className="text-balance font-serif text-[clamp(3.5rem,9vw,8.6rem)] leading-[0.82] tracking-[-0.055em] drop-shadow-sm">
            {title}
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-white/90 sm:text-lg sm:leading-8">
            {body}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={primaryAction.href} className={buttonStyles({ size: "lg", variant: "light" })}>
              {primaryAction.label}
            </Link>
            {secondaryAction ? (
              <Link
                href={secondaryAction.href}
                className={buttonStyles({
                  size: "lg",
                  variant: "inverse",
                })}
              >
                {secondaryAction.label}
              </Link>
            ) : null}
          </div>
        </div>
      </Container>
      <span
        aria-hidden="true"
        className="absolute bottom-7 right-8 hidden font-serif text-sm italic tracking-wide text-white/80 sm:block"
      >
        ✦ Sbrilluccica
      </span>
    </section>
  );
}
