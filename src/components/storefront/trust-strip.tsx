import { BadgeCheck, Gem, PackageCheck, ShieldCheck } from "lucide-react";

import { Container } from "@/components/ui/container";

const iconSet = [Gem, PackageCheck, ShieldCheck, BadgeCheck] as const;

export function TrustStrip({ items }: { items: Array<{ body?: string; title: string }> }) {
  return (
    <section className="border-y border-[#dfc9c4] bg-[#f6e7e5] text-[#2b1e20]">
      <Container>
        <ul className="grid grid-cols-2 divide-x divide-y divide-[#dfc9c4] md:grid-cols-4 md:divide-y-0">
          {items.slice(0, 4).map((item, index) => {
            const Icon = iconSet[index];
            return (
              <li key={`${item.title}-${index}`} className="flex min-h-28 items-center gap-3 px-4 py-5 sm:px-6">
                <Icon aria-hidden="true" className="shrink-0 text-[#8b4255]" size={21} strokeWidth={1.35} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em]">{item.title}</p>
                  {item.body ? <p className="mt-1 text-xs leading-5 text-[#705e5b]">{item.body}</p> : null}
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
