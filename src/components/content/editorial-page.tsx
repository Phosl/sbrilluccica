import { Container, Eyebrow } from "@/components/ui/container";

export interface EditorialSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export function EditorialPage({
  eyebrow,
  intro,
  reviewNotice,
  sections,
  title,
}: {
  eyebrow: string;
  intro: string;
  reviewNotice?: string;
  sections: EditorialSection[];
  title: string;
}) {
  return (
    <main id="main-content" className="bg-ivory pb-24">
      <header className="border-b border-line bg-rose-soft/45 py-16 sm:py-24">
        <Container className="max-w-5xl">
          <Eyebrow className="text-rose-deep">{eyebrow}</Eyebrow>
          <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-[0.95] tracking-[-0.04em] sm:text-7xl">
            {title}
          </h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-muted sm:text-xl">
            {intro}
          </p>
        </Container>
      </header>

      <Container className="max-w-5xl py-12 sm:py-16">
        {reviewNotice ? (
          <aside className="mb-12 rounded-[1.5rem] border border-gold/45 bg-paper p-5 text-sm leading-6 text-muted sm:p-6">
            <strong className="block text-ink">Pre-pubblicazione</strong>
            {reviewNotice}
          </aside>
        ) : null}

        <div className="divide-y divide-line">
          {sections.map((section) => (
            <section
              key={section.heading}
              className="grid gap-5 py-9 first:pt-0 sm:grid-cols-[minmax(12rem,0.75fr)_minmax(0,1.7fr)] sm:gap-12 sm:py-12"
            >
              <h2 className="font-serif text-3xl leading-tight tracking-[-0.025em]">
                {section.heading}
              </h2>
              <div className="space-y-5 text-[1.03rem] leading-8 text-muted">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets?.length ? (
                  <ul className="list-disc space-y-2 pl-5 marker:text-rose">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          ))}
        </div>
      </Container>
    </main>
  );
}
