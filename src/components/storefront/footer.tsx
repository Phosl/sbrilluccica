import { Camera, Sparkles } from "lucide-react";
import Link from "next/link";

import type { Locale } from "@/lib/domain";

import type { StoreLink } from "@/components/storefront/models";
import { Container } from "@/components/ui/container";

export function StoreFooter({
  brandStatement,
  email,
  groups,
  instagramHref,
  legalNote,
  locale,
}: {
  brandStatement: string;
  email?: string;
  groups: Array<{ links: StoreLink[]; title: string }>;
  instagramHref?: string;
  legalNote?: string;
  locale: Locale;
}) {
  return (
    <footer className="bg-[#2b1e20] py-14 text-[#fffaf4] sm:py-16 lg:py-20">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(16rem,1.2fr)_minmax(0,1.8fr)] lg:gap-20">
          <div>
            <Link
              href={locale === "it" ? "/" : "/en"}
              className="inline-flex items-center gap-2 rounded-sm font-serif text-4xl tracking-[-0.045em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4cdd5] focus-visible:ring-offset-4 focus-visible:ring-offset-[#2b1e20]"
            >
              Sbrilluccica
              <Sparkles aria-hidden="true" className="text-[#d58da0]" size={20} strokeWidth={1.4} />
            </Link>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/70">{brandStatement}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {instagramHref ? (
                <a
                  href={instagramHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="grid size-11 place-items-center rounded-full border border-white/25 hover:border-[#d58da0] hover:text-[#f4cdd5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4cdd5]"
                >
                  <Camera aria-hidden="true" size={18} />
                </a>
              ) : null}
              {email ? (
                <a
                  href={`mailto:${email}`}
                  className="rounded-sm text-sm text-white/75 underline decoration-white/30 underline-offset-4 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4cdd5]"
                >
                  {email}
                </a>
              ) : null}
            </div>
          </div>

          <nav
            aria-label={locale === "it" ? "Link nel piè di pagina" : "Footer links"}
            className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3"
          >
            {groups.map((group) => (
              <div key={group.title}>
                <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#e7aebb]">
                  {group.title}
                </h2>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="rounded-sm py-1 text-sm text-white/72 transition-colors hover:text-white motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4cdd5]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/15 pt-6 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Sbrilluccica</p>
          {legalNote ? <p>{legalNote}</p> : null}
        </div>
      </Container>
    </footer>
  );
}
