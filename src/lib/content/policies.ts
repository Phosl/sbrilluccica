import type { Locale } from "@/lib/domain";
import type { EditorialSection } from "@/components/content/editorial-page";
import { siteConfig } from "@/lib/site";

export type PolicySlug =
  | "shipping-policy"
  | "refund-policy"
  | "terms-conditions"
  | "privacy-policy"
  | "accessibility-statement";

export interface PolicyContent {
  eyebrow: string;
  title: string;
  intro: string;
  reviewNotice: string;
  sections: EditorialSection[];
}

const reviewNotice = {
  it: "Questa pagina è una bozza editoriale coerente con il flusso del nuovo store. Prima del passaggio del dominio devono essere inseriti i dati completi del titolare, verificate tariffe e procedure e ottenuta una revisione legale.",
  en: "This page is an editorial draft aligned with the new store flow. The controller’s full business details, final rates and procedures must be added and legally reviewed before the domain is switched.",
} satisfies Record<Locale, string>;

const policies: Record<Locale, Record<PolicySlug, Omit<PolicyContent, "reviewNotice">>> = {
  it: {
    "shipping-policy": {
      eyebrow: "Assistenza ordini",
      title: "Spedizioni",
      intro: "Informazioni chiare prima di pagare, aggiornamenti essenziali dopo l’ordine.",
      sections: [
        {
          heading: "Destinazioni",
          paragraphs: [
            "Il nuovo store è predisposto per quattro zone: Italia, Unione Europea, Regno Unito e Stati Uniti. La disponibilità effettiva e il costo vengono mostrati al checkout in base all’indirizzo.",
          ],
        },
        {
          heading: "Preparazione e consegna",
          paragraphs: [
            "L’ordine viene preparato dopo la conferma del pagamento. Tempi stimati, eventuali soglie di spedizione gratuita e corriere vengono mostrati prima dell’acquisto e riepilogati nell’email di conferma.",
            "Per Regno Unito e Stati Uniti possono essere applicati dazi o oneri locali non inclusi nel prezzo, secondo la normativa della destinazione.",
          ],
        },
        {
          heading: "Tracciamento",
          paragraphs: [
            "Quando il pacco parte, il codice di tracciamento viene inserito manualmente dall’amministrazione e inviato via email. Per assistenza scrivi indicando il numero d’ordine.",
          ],
        },
      ],
    },
    "refund-policy": {
      eyebrow: "Assistenza ordini",
      title: "Resi e rimborsi",
      intro: "Una procedura unica e comprensibile, senza condizioni contraddittorie.",
      sections: [
        {
          heading: "Diritto di recesso",
          paragraphs: [
            "Se acquisti come consumatore puoi comunicare la volontà di recedere entro 14 giorni dalla consegna, fatti salvi i casi esclusi dalla legge. Scrivi al servizio clienti prima di spedire il prodotto.",
          ],
        },
        {
          heading: "Condizioni del prodotto",
          paragraphs: [
            "Il gioiello deve essere restituito integro, non indossato oltre quanto necessario per valutarlo e completo della confezione ricevuta. I prodotti personalizzati o realizzati su richiesta possono essere esclusi dal recesso nei limiti previsti dalla legge.",
          ],
        },
        {
          heading: "Rimborso",
          paragraphs: [
            "Dopo la ricezione e la verifica del reso, il rimborso viene disposto sul metodo di pagamento originario nei tempi previsti dalla normativa applicabile. Le istruzioni e l’indirizzo di reso vengono comunicati dal servizio clienti.",
          ],
        },
      ],
    },
    "terms-conditions": {
      eyebrow: "Informazioni legali",
      title: "Termini e condizioni",
      intro: "Le regole essenziali per usare il sito e acquistare i prodotti Sbrilluccica.",
      sections: [
        {
          heading: "Il contratto",
          paragraphs: [
            "Il contratto di vendita si conclude quando l’ordine viene accettato e confermato. Il semplice invio dell’ordine non garantisce la disponibilità: se un articolo non fosse disponibile, il cliente viene informato e ogni importo già incassato viene rimborsato.",
          ],
        },
        {
          heading: "Prezzi e pagamento",
          paragraphs: [
            "I prezzi sono espressi in euro e includono le imposte applicabili, salvo diversa indicazione. Spedizione, eventuali imposte della destinazione e totale finale sono mostrati prima del pagamento. Il checkout è gestito da Stripe; i dati completi della carta non transitano nei sistemi Sbrilluccica.",
          ],
        },
        {
          heading: "Prodotti",
          paragraphs: [
            "Colori e proporzioni possono apparire leggermente diversi a seconda dello schermo. Le caratteristiche contrattuali sono quelle indicate nella scheda prodotto al momento dell’ordine. Disponibilità e stock vengono verificati anche lato server.",
          ],
        },
        {
          heading: "Contatti e legge applicabile",
          paragraphs: [
            `Per domande sul contratto puoi scrivere a ${siteConfig.supportEmail}. Restano salvi i diritti inderogabili riconosciuti al consumatore e gli strumenti di tutela previsti dalla normativa applicabile.`,
          ],
        },
      ],
    },
    "privacy-policy": {
      eyebrow: "Informazioni legali",
      title: "Privacy",
      intro: "Quali dati servono allo store, perché vengono usati e come esercitare i tuoi diritti.",
      sections: [
        {
          heading: "Dati trattati",
          paragraphs: [
            "Per gestire acquisti e assistenza possono essere trattati dati di contatto, indirizzi, dettagli dell’ordine, comunicazioni e informazioni tecniche strettamente necessarie alla sicurezza del sito. I dati completi di pagamento sono trattati dal fornitore di pagamento.",
          ],
        },
        {
          heading: "Finalità e basi giuridiche",
          paragraphs: ["I dati vengono usati solo per finalità definite e con la relativa base giuridica."],
          bullets: [
            "eseguire il contratto, consegnare gli ordini e gestire resi e assistenza;",
            "adempiere agli obblighi fiscali, contabili e di legge;",
            "prevenire abusi e proteggere lo store sulla base del legittimo interesse;",
            "inviare newsletter e attivare analisi o pubblicità soltanto con il consenso richiesto.",
          ],
        },
        {
          heading: "Fornitori e trasferimenti",
          paragraphs: [
            "La configurazione prevista usa Supabase per dati e autenticazione, Stripe per i pagamenti, Resend per le email e Vercel per l’hosting. Usercentrics gestisce le preferenze; GA4 e Meta Pixel restano disattivati finché non viene espresso il consenso. Contratti, localizzazione e garanzie sui trasferimenti devono essere verificati nella configurazione finale.",
          ],
        },
        {
          heading: "Diritti e contatti",
          paragraphs: [
            `Puoi chiedere accesso, rettifica, cancellazione, limitazione, portabilità o opposizione scrivendo a ${siteConfig.supportEmail}. Puoi inoltre revocare un consenso e presentare reclamo all’autorità di controllo competente.`,
          ],
        },
      ],
    },
    "accessibility-statement": {
      eyebrow: "Esperienza inclusiva",
      title: "Accessibilità",
      intro: "Stiamo progettando il nuovo Sbrilluccica perché sia comprensibile e utilizzabile da più persone possibile.",
      sections: [
        {
          heading: "Il nostro obiettivo",
          paragraphs: [
            "Il progetto mira ai criteri WCAG 2.2 livello AA. Questo è un obiettivo di lavoro, non una dichiarazione di conformità già certificata. Prima della pubblicazione sono previsti test da tastiera, con lettore di schermo, zoom e dispositivi mobili.",
          ],
        },
        {
          heading: "Cosa abbiamo previsto",
          paragraphs: ["La nuova interfaccia include fin dall’architettura:"],
          bullets: [
            "struttura semantica e un titolo principale per pagina;",
            "testi alternativi descrittivi per le immagini di prodotto;",
            "focus visibile, navigazione da tastiera e supporto al movimento ridotto;",
            "contrasto, ingrandimento del testo e messaggi di stato accessibili.",
          ],
        },
        {
          heading: "Segnalazioni",
          paragraphs: [
            `Se incontri una barriera, scrivi a ${siteConfig.supportEmail} indicando pagina, dispositivo e problema. Risponderemo con una soluzione o un’alternativa accessibile.`,
          ],
        },
      ],
    },
  },
  en: {
    "shipping-policy": {
      eyebrow: "Order support",
      title: "Shipping",
      intro: "Clear information before payment and essential updates after ordering.",
      sections: [
        {
          heading: "Destinations",
          paragraphs: [
            "The new store is prepared for four zones: Italy, the European Union, the United Kingdom and the United States. Actual availability and cost are shown at checkout for the delivery address.",
          ],
        },
        {
          heading: "Dispatch and delivery",
          paragraphs: [
            "Orders are prepared after payment confirmation. Estimated timing, free-shipping thresholds and carrier details are shown before purchase and repeated in the confirmation email.",
            "Local duties or charges may apply to UK and US deliveries under destination-country rules and may not be included in the price.",
          ],
        },
        {
          heading: "Tracking",
          paragraphs: [
            "Once a parcel leaves, the team adds its tracking code manually and sends it by email. Please include your order number when requesting assistance.",
          ],
        },
      ],
    },
    "refund-policy": {
      eyebrow: "Order support",
      title: "Returns & refunds",
      intro: "One clear procedure, without contradictory conditions.",
      sections: [
        {
          heading: "Right of withdrawal",
          paragraphs: [
            "Consumers may give notice of withdrawal within 14 days of delivery, subject to statutory exclusions. Contact customer care before sending an item back.",
          ],
        },
        {
          heading: "Item condition",
          paragraphs: [
            "Jewellery must be returned intact, unworn beyond what is needed to inspect it and with the packaging supplied. Bespoke or personalised goods may be excluded where permitted by law.",
          ],
        },
        {
          heading: "Refund",
          paragraphs: [
            "After the return is received and checked, the refund is issued to the original payment method within the period required by applicable law. Customer care provides the instructions and return address.",
          ],
        },
      ],
    },
    "terms-conditions": {
      eyebrow: "Legal information",
      title: "Terms & conditions",
      intro: "The essential rules for using the website and purchasing Sbrilluccica products.",
      sections: [
        {
          heading: "The contract",
          paragraphs: [
            "A sales contract is formed when an order is accepted and confirmed. Submitting an order does not itself guarantee availability; if an item cannot be supplied, the customer is informed and any amount collected is refunded.",
          ],
        },
        {
          heading: "Prices and payment",
          paragraphs: [
            "Prices are shown in euros and include applicable taxes unless stated otherwise. Shipping, destination taxes and the final total are displayed before payment. Stripe handles checkout; full card details do not pass through Sbrilluccica systems.",
          ],
        },
        {
          heading: "Products",
          paragraphs: [
            "Colour and scale may vary slightly by screen. The contractual characteristics are those displayed on the product page at the time of ordering. Availability and stock are also checked on the server.",
          ],
        },
        {
          heading: "Contact and applicable law",
          paragraphs: [
            `For contract questions, email ${siteConfig.supportEmail}. Mandatory consumer rights and remedies under applicable law remain unaffected.`,
          ],
        },
      ],
    },
    "privacy-policy": {
      eyebrow: "Legal information",
      title: "Privacy",
      intro: "What data the store needs, why it is used and how to exercise your rights.",
      sections: [
        {
          heading: "Data processed",
          paragraphs: [
            "To manage purchases and support, the store may process contact details, addresses, order details, communications and technical information strictly needed for security. Full payment details are processed by the payment provider.",
          ],
        },
        {
          heading: "Purposes and legal bases",
          paragraphs: ["Data is used only for defined purposes and with the corresponding legal basis."],
          bullets: [
            "perform the contract, deliver orders and manage returns and support;",
            "meet tax, accounting and legal obligations;",
            "prevent abuse and protect the store on the basis of legitimate interests;",
            "send newsletters and enable analytics or advertising only with the required consent.",
          ],
        },
        {
          heading: "Providers and transfers",
          paragraphs: [
            "The planned setup uses Supabase for data and authentication, Stripe for payments, Resend for email and Vercel for hosting. Usercentrics manages preferences; GA4 and Meta Pixel remain off until consent is given. Contracts, locations and transfer safeguards must be checked in the final configuration.",
          ],
        },
        {
          heading: "Rights and contact",
          paragraphs: [
            `You may request access, correction, erasure, restriction, portability or object by emailing ${siteConfig.supportEmail}. You may also withdraw consent and complain to the competent supervisory authority.`,
          ],
        },
      ],
    },
    "accessibility-statement": {
      eyebrow: "Inclusive experience",
      title: "Accessibility",
      intro: "We are designing the new Sbrilluccica to be understandable and usable by as many people as possible.",
      sections: [
        {
          heading: "Our target",
          paragraphs: [
            "The project targets WCAG 2.2 Level AA. This is a working goal, not a claim of certified compliance. Keyboard, screen-reader, zoom and mobile testing is planned before launch.",
          ],
        },
        {
          heading: "What is built in",
          paragraphs: ["The new interface includes from its architecture:"],
          bullets: [
            "semantic structure and one main heading per page;",
            "descriptive alternative text for product imagery;",
            "visible focus, keyboard navigation and reduced-motion support;",
            "contrast, text enlargement and accessible status messages.",
          ],
        },
        {
          heading: "Feedback",
          paragraphs: [
            `If you encounter a barrier, email ${siteConfig.supportEmail} with the page, device and issue. We will respond with a fix or an accessible alternative.`,
          ],
        },
      ],
    },
  },
};

export function getPolicyContent(locale: Locale, slug: PolicySlug): PolicyContent {
  return { ...policies[locale][slug], reviewNotice: reviewNotice[locale] };
}
