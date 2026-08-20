import type { HTMLAttributes } from "react";

import { cn } from "@/components/ui/cn";

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[90rem] px-4 sm:px-6 lg:px-10 xl:px-14",
        className,
      )}
      {...props}
    />
  );
}

export function Eyebrow({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-[0.68rem] font-semibold uppercase tracking-[0.25em] text-[#8b4255]",
        className,
      )}
      {...props}
    />
  );
}

export function SectionHeading({
  align = "left",
  children,
  className,
  eyebrow,
}: {
  align?: "left" | "center";
  children: React.ReactNode;
  className?: string;
  eyebrow?: string;
}) {
  return (
    <div className={cn(align === "center" && "text-center", className)}>
      {eyebrow ? <Eyebrow className="mb-3">{eyebrow}</Eyebrow> : null}
      <h2 className="text-balance font-serif text-4xl leading-[0.96] tracking-[-0.035em] text-[#2b1e20] sm:text-5xl lg:text-6xl">
        {children}
      </h2>
    </div>
  );
}
