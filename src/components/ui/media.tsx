import Image from "next/image";

import { cn } from "@/components/ui/cn";

export interface MediaSource {
  alt: string;
  blurDataURL?: string;
  height?: number;
  src: string;
  width?: number;
}

export function ResponsiveMedia({
  className,
  eager = false,
  media,
  sizes = "100vw",
}: {
  className?: string;
  eager?: boolean;
  media?: MediaSource | null;
  sizes?: string;
}) {
  if (!media?.src) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_65%_28%,#fff8f0_0_7%,transparent_8%),radial-gradient(circle_at_46%_52%,#c8878f_0_5%,transparent_6%),linear-gradient(145deg,#ead0cf_0%,#f8ebe3_52%,#d8a7ab_100%)]",
          className,
        )}
      >
        <span className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/65 shadow-[0_0_0_18px_rgba(255,255,255,0.16)]" />
      </div>
    );
  }

  return (
    <Image
      fill
      alt={media.alt}
      blurDataURL={media.blurDataURL}
      className={cn("object-cover", className)}
      placeholder={media.blurDataURL ? "blur" : "empty"}
      priority={eager}
      sizes={sizes}
      src={media.src}
    />
  );
}
