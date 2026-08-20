import Image from "next/image";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { Container, Eyebrow } from "@/components/ui/container";
import type { Locale } from "@/lib/domain";
import { localizedPath } from "@/lib/i18n/config";

const copy = {
  it: {
    eyebrow: "Dal viaggio alla forma",
    title: "Sbrilluccica è un incontro.",
    intro:
      "Tra il gusto di Gaia, la curiosità per culture lontane e il sapere di artigiani indiani nasce un modo personale di vivere il gioiello.",
    originLabel: "L’origine",
    originTitle: "Viaggi, moda e simboli da portare con sé.",
    originBody: [
      "Sbrilluccica nasce dalla passione di Gaia per i viaggi e la moda. Negli anni trascorsi a esplorare l’Asia, l’artigianato diventa un modo concreto per conoscere persone, gesti e culture.",
      "All’inizio c’erano ciondoli legati a tradizioni diverse, accostati in collane uniche come piccolo manifesto di convivenza. Da quella ricerca il progetto si è allargato, senza perdere il piacere della contaminazione.",
    ],
    todayLabel: "Oggi",
    todayTitle: "Un dialogo tra idee e mani esperte.",
    todayBody: [
      "Le collezioni nascono dall’incontro fra l’intuizione stilistica di Gaia e l’abilità di artigiani e maestri orafi indiani. Ogni pezzo cerca una presenza riconoscibile: luminoso, facile da mescolare, mai troppo serio.",
      "Nel nuovo store materiali, misure, finiture e cura saranno raccontati in modo uniforme e verificabile. Nessuna etichetta generica: le informazioni entrano online quando sono state confermate.",
    ],
    quote: "Brillare, gioire e diffondere buone vibrazioni.",
    cta: "Scopri i gioielli",
    imageAltOne: "Mani con anelli Sbrilluccica affacciate da una parete chiara",
    imageAltTwo: "Gioielli Sbrilluccica indossati in un ritratto di campagna",
    imageAltThree: "Collana e anelli Sbrilluccica indossati su un abito nero",
  },
  en: {
    eyebrow: "From travel to form",
    title: "Sbrilluccica is an encounter.",
    intro:
      "Gaia’s eye, curiosity for distant cultures and the skill of Indian artisans meet in a personal way of wearing jewellery.",
    originLabel: "The beginning",
    originTitle: "Travel, fashion and symbols to carry with you.",
    originBody: [
      "Sbrilluccica grew from Gaia’s love of travel and fashion. During years spent exploring Asia, craft became a tangible way to understand people, gestures and cultures.",
      "It began with pendants linked to different traditions, combined into one-of-a-kind necklaces as small symbols of coexistence. The project has grown from that search without losing its joy in mixing influences.",
    ],
    todayLabel: "Today",
    todayTitle: "A conversation between ideas and expert hands.",
    todayBody: [
      "Collections emerge from the meeting of Gaia’s styling instincts and the ability of Indian artisans and goldsmiths. Each piece seeks a distinctive presence: bright, easy to mix and never too serious.",
      "In the new store, materials, dimensions, finishes and care will follow one consistent and verifiable format. No vague labels: information is published once it has been confirmed.",
    ],
    quote: "Shine, rejoice and share good vibrations.",
    cta: "Discover the jewellery",
    imageAltOne: "Hands wearing Sbrilluccica rings around a pale wall",
    imageAltTwo: "Sbrilluccica jewellery worn in an editorial portrait",
    imageAltThree: "A Sbrilluccica necklace and rings worn with a black dress",
  },
} satisfies Record<Locale, Record<string, string | string[]>>;

export function BrandStory({ locale }: { locale: Locale }) {
  const text = copy[locale];

  return (
    <main id="main-content" className="overflow-hidden bg-ivory">
      <section className="relative min-h-[72svh] bg-ink text-paper">
        <Image
          src="/images/sbrilluccica-hero.jpg"
          alt={text.imageAltThree as string}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_32%] opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/35 to-transparent" />
        <Container className="relative flex min-h-[72svh] items-end py-14 sm:items-center sm:py-24">
          <div className="max-w-4xl">
            <Eyebrow className="text-rose-soft">{text.eyebrow as string}</Eyebrow>
            <h1 className="mt-5 font-serif text-[clamp(4rem,10vw,9rem)] leading-[0.82] tracking-[-0.055em]">
              {text.title as string}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-paper/85 sm:text-xl">
              {text.intro as string}
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-24 lg:py-32">
        <Container className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div className="relative grid grid-cols-5 gap-3">
            <div className="relative col-span-4 aspect-[3/4] overflow-hidden rounded-[2rem] bg-rose-soft">
              <Image
                src="/images/gaia-portrait-01.jpg"
                alt={text.imageAltOne as string}
                fill
                sizes="(min-width: 1024px) 45vw, 80vw"
                className="object-cover"
              />
            </div>
            <div className="relative col-span-3 col-start-3 -mt-24 aspect-[3/4] overflow-hidden rounded-[1.5rem] border-[0.6rem] border-ivory bg-sage">
              <Image
                src="/images/gaia-portrait-02.jpg"
                alt={text.imageAltTwo as string}
                fill
                sizes="(min-width: 1024px) 28vw, 55vw"
                className="object-cover"
              />
            </div>
          </div>
          <div className="pt-3 lg:sticky lg:top-28">
            <Eyebrow className="text-rose-deep">{text.originLabel as string}</Eyebrow>
            <h2 className="mt-5 font-serif text-5xl leading-[0.98] tracking-[-0.04em] sm:text-6xl">
              {text.originTitle as string}
            </h2>
            <div className="mt-7 space-y-5 text-lg leading-8 text-muted">
              {(text.originBody as string[]).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-rose-deep py-16 text-paper sm:py-24 lg:py-32">
        <Container className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <Eyebrow className="text-rose-soft">{text.todayLabel as string}</Eyebrow>
            <h2 className="mt-5 font-serif text-5xl leading-[0.98] tracking-[-0.04em] sm:text-6xl">
              {text.todayTitle as string}
            </h2>
            <div className="mt-7 space-y-5 text-lg leading-8 text-paper/80">
              {(text.todayBody as string[]).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-ink/30">
            <Image
              src="/images/sbrilluccica-world.jpg"
              alt={text.imageAltThree as string}
              fill
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      <section className="bg-paper py-20 text-center sm:py-28">
        <Container className="max-w-5xl">
          <p aria-hidden="true" className="text-3xl text-gold">✦</p>
          <blockquote className="mt-6 font-serif text-[clamp(3rem,7vw,6.8rem)] leading-[0.92] tracking-[-0.05em] text-ink">
            “{text.quote as string}”
          </blockquote>
          <Link
            href={localizedPath(locale, "/shop")}
            className={buttonStyles({ className: "mt-10", size: "lg" })}
          >
            {text.cta as string}
          </Link>
        </Container>
      </section>
    </main>
  );
}
