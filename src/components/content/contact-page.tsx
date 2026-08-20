import { Camera, Mail } from "lucide-react";

import { ContactForm } from "@/components/content/contact-form";
import { Container, Eyebrow } from "@/components/ui/container";
import type { Locale } from "@/lib/domain";
import { siteConfig } from "@/lib/site";

const copy = {
  it: {
    eyebrow: "Parliamo",
    title: "Siamo qui per aiutarti.",
    intro: "Domande su un gioiello, un ordine o un reso? Scrivici attraverso i nostri canali ufficiali: ti risponderemo con cura.",
    email: "Email",
    social: "Instagram",
    response: "Ti risponderemo appena possibile nei giorni lavorativi.",
    formTitle: "Mandaci un messaggio",
  },
  en: {
    eyebrow: "Let’s talk",
    title: "We’re here to help.",
    intro: "Questions about a piece, an order or a return? Get in touch through our official channels and we will be happy to help.",
    email: "Email",
    social: "Instagram",
    response: "We will reply as soon as possible on business days.",
    formTitle: "Send us a message",
  },
} satisfies Record<Locale, Record<string, string>>;

export function ContactPage({ locale }: { locale: Locale }) {
  const text = copy[locale];

  return (
    <main id="main-content" className="bg-ivory pb-24">
      <header className="border-b border-line bg-rose-soft/50 py-16 sm:py-24">
        <Container>
          <Eyebrow className="text-rose-deep">{text.eyebrow}</Eyebrow>
          <h1 className="mt-5 max-w-4xl font-serif text-6xl leading-[0.9] tracking-[-0.05em] sm:text-8xl">
            {text.title}
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-muted">{text.intro}</p>
        </Container>
      </header>

      <Container className="grid gap-12 py-12 sm:py-16 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
        <div className="space-y-8">
          <a
            href={`mailto:${siteConfig.supportEmail}`}
            className="group flex items-center gap-4 rounded-[1.5rem] border border-line bg-paper p-5 transition-colors hover:border-rose"
          >
            <span className="grid size-12 place-items-center rounded-full bg-rose-soft text-rose-deep">
              <Mail aria-hidden="true" size={20} />
            </span>
            <span>
              <small className="block uppercase tracking-[0.15em] text-muted">{text.email}</small>
              <strong className="mt-1 block break-all">{siteConfig.supportEmail}</strong>
            </span>
          </a>
          <a
            href={siteConfig.instagram}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-4 rounded-[1.5rem] border border-line bg-paper p-5 transition-colors hover:border-rose"
          >
            <span className="grid size-12 place-items-center rounded-full bg-rose-soft text-rose-deep">
              <Camera aria-hidden="true" size={20} />
            </span>
            <span>
              <small className="block uppercase tracking-[0.15em] text-muted">{text.social}</small>
              <strong className="mt-1 block">@sbrilluccica_______</strong>
            </span>
          </a>
          <p className="text-sm leading-6 text-muted">{text.response}</p>
        </div>

        <section className="rounded-[2rem] bg-paper p-6 shadow-[0_24px_70px_rgba(72,45,43,0.08)] sm:p-10">
          <h2 className="mb-8 font-serif text-4xl tracking-[-0.03em]">{text.formTitle}</h2>
          <ContactForm locale={locale} />
        </section>
      </Container>
    </main>
  );
}
