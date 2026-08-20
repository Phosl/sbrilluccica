import { AlertCircle, PackageOpen, RotateCw, Sparkles } from "lucide-react";

import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";

const icons = {
  empty: PackageOpen,
  error: AlertCircle,
  loading: RotateCw,
  success: Sparkles,
};

export function StatusPanel({
  action,
  body,
  className,
  title,
  variant = "empty",
}: {
  action?: { href: string; label: string };
  body: string;
  className?: string;
  title: string;
  variant?: keyof typeof icons;
}) {
  const Icon = icons[variant];
  return (
    <section
      aria-live={variant === "error" ? "assertive" : "polite"}
      className={cn(
        "flex min-h-72 flex-col items-center justify-center rounded-[2rem] border border-[#dfc9c4] bg-[#fffaf4] px-6 py-12 text-center",
        className,
      )}
    >
      <span className="grid size-14 place-items-center rounded-full bg-[#f4dfe0] text-[#8b4255]">
        <Icon
          aria-hidden="true"
          className={variant === "loading" ? "animate-spin motion-reduce:animate-none" : undefined}
          size={24}
          strokeWidth={1.5}
        />
      </span>
      <h2 className="mt-5 font-serif text-3xl tracking-tight text-[#2b1e20]">{title}</h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-[#705e5b]">{body}</p>
      {action ? (
        <a className={buttonStyles({ className: "mt-7", variant: "secondary" })} href={action.href}>
          {action.label}
        </a>
      ) : null}
    </section>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      aria-label="Caricamento prodotti"
      aria-busy="true"
      className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4"
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="animate-pulse motion-reduce:animate-none">
          <div className="aspect-[4/5] rounded-[1.25rem] bg-[#eadbd5]" />
          <div className="mt-4 h-3 w-2/3 rounded-full bg-[#eadbd5]" />
          <div className="mt-2 h-3 w-1/3 rounded-full bg-[#eadbd5]" />
        </div>
      ))}
    </div>
  );
}
