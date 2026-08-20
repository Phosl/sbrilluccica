import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import {
  toMediaSource,
  type CollectionTileData,
} from "@/components/storefront/models";
import { cn } from "@/components/ui/cn";
import { Container, SectionHeading } from "@/components/ui/container";
import { ResponsiveMedia } from "@/components/ui/media";

export function CollectionTiles({
  collections,
  eyebrow,
  title,
}: {
  collections: CollectionTileData[];
  eyebrow?: string;
  title: string;
}) {
  return (
    <section className="bg-[#fffaf4] py-16 sm:py-20 lg:py-28">
      <Container>
        <SectionHeading eyebrow={eyebrow}>{title}</SectionHeading>
        <div className="mt-9 grid auto-rows-[18rem] gap-3 sm:grid-cols-2 sm:auto-rows-[22rem] lg:grid-cols-3 lg:auto-rows-[19rem] lg:gap-5">
          {collections.slice(0, 5).map((collection, index) => (
            <Link
              key={collection.id}
              href={collection.href}
              className={cn(
                "group relative isolate overflow-hidden rounded-[1.75rem] bg-[#e5cbc5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4255] focus-visible:ring-offset-4",
                index === 0 && "sm:row-span-2 lg:col-span-2",
              )}
            >
              <ResponsiveMedia
                media={toMediaSource(collection.heroImage)}
                sizes={index === 0 ? "(min-width: 1024px) 65vw, (min-width: 640px) 50vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
                className="transition-transform duration-700 ease-out group-hover:scale-[1.035] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2b1e20]/75 via-[#2b1e20]/5 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white sm:p-7">
                <div>
                  <h3 className="font-serif text-4xl leading-none tracking-tight sm:text-5xl">
                    {collection.name}
                  </h3>
                  {collection.description ? (
                    <p className="mt-2 max-w-md text-sm leading-6 text-white/85">
                      {collection.description}
                    </p>
                  ) : null}
                </div>
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-white/70 bg-white/10 backdrop-blur-sm transition-colors group-hover:bg-white group-hover:text-[#8b4255] motion-reduce:transition-none">
                  <ArrowUpRight aria-hidden="true" size={18} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
