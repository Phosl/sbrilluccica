const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const siteConfig = {
  name: "Sbrilluccica",
  description: {
    it: "Gioielli indipendenti dal carattere luminoso, selezionati a Roma e ispirati agli incontri tra culture.",
    en: "Independent jewellery with a bright point of view, selected in Rome and inspired by encounters between cultures.",
  },
  url: configuredUrl ? configuredUrl.replace(/\/$/, "") : "http://localhost:3000",
  supportEmail: "sbrilluccica@gmail.com",
  instagram: "https://www.instagram.com/sbrilluccica_______/",
} as const;

export function absoluteUrl(path = "/"): string {
  return new URL(path, `${siteConfig.url}/`).toString();
}
