import { ArrowRight, CheckCircle2, Mail } from "lucide-react";

import type { Locale } from "@/lib/domain";

import { cn } from "@/components/ui/cn";

type NewsletterAction = string | ((formData: FormData) => void | Promise<void>);

export function Newsletter({
  action,
  body,
  consentLabel,
  emailLabel,
  locale,
  status,
  title,
}: {
  action?: NewsletterAction;
  body: string;
  consentLabel?: React.ReactNode;
  emailLabel?: string;
  locale: Locale;
  status?: { message: string; type: "error" | "success" };
  title: string;
}) {
  const inputLabel = emailLabel ?? (locale === "it" ? "La tua email" : "Your email");
  const submitLabel = locale === "it" ? "Iscriviti" : "Subscribe";

  return (
    <section className="bg-[#8b4255] px-4 py-14 text-white sm:px-6 sm:py-16 lg:px-10">
      <div className="mx-auto grid w-full max-w-[82rem] gap-8 md:grid-cols-[minmax(0,0.85fr)_minmax(22rem,1.15fr)] md:items-end md:gap-12">
        <div>
          <Mail aria-hidden="true" className="text-[#f4cdd5]" size={25} strokeWidth={1.4} />
          <h2 className="mt-5 max-w-xl text-balance font-serif text-4xl leading-[0.95] tracking-[-0.04em] sm:text-5xl">
            {title}
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/80 sm:text-base">{body}</p>
        </div>
        <form action={action} className="w-full">
          <label htmlFor="newsletter-email" className="sr-only">
            {inputLabel}
          </label>
          <div className="flex items-center gap-2 rounded-full border border-white/55 bg-white/10 p-1.5 pl-5 focus-within:ring-2 focus-within:ring-white focus-within:ring-offset-2 focus-within:ring-offset-[#8b4255]">
            <input
              id="newsletter-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder={inputLabel}
              className="min-h-11 min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/65"
            />
            <button
              type="submit"
              aria-label={submitLabel}
              className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-[#8b4255] transition-transform hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#8b4255]"
            >
              <ArrowRight aria-hidden="true" size={18} />
            </button>
          </div>
          {consentLabel ? (
            <label className="mt-4 flex cursor-pointer items-start gap-3 text-xs leading-5 text-white/78">
              <input
                type="checkbox"
                name="consent"
                required
                className="mt-0.5 size-4 shrink-0 rounded border-white/50 bg-transparent accent-white"
              />
              <span>{consentLabel}</span>
            </label>
          ) : null}
          {status ? (
            <p
              role={status.type === "error" ? "alert" : "status"}
              className={cn(
                "mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-xs",
                status.type === "error" ? "bg-[#51202d]" : "bg-white/15",
              )}
            >
              {status.type === "success" ? <CheckCircle2 aria-hidden="true" size={15} /> : null}
              {status.message}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
