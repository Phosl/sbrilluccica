import type { Locale } from "./config";

export interface SiteCopy {
  announcement: string;
  nav: {
    newArrivals: string;
    shop: string;
    collections: string;
    story: string;
    journal: string;
    contact: string;
    account: string;
    wishlist: string;
    cart: string;
    menu: string;
    close: string;
  };
  home: {
    eyebrow: string;
    title: string;
    intro: string;
    primaryCta: string;
    secondaryCta: string;
    newEyebrow: string;
    newTitle: string;
    newBody: string;
    craftEyebrow: string;
    craftTitle: string;
    craftBody: string;
    craftCta: string;
    newsletterEyebrow: string;
    newsletterTitle: string;
    newsletterBody: string;
  };
  catalog: {
    eyebrow: string;
    title: string;
    intro: string;
    filter: string;
    sort: string;
    all: string;
    results: string;
    empty: string;
    newest: string;
    priceAscending: string;
    priceDescending: string;
  };
  product: {
    addToBag: string;
    addToWishlist: string;
    finish: string;
    quantity: string;
    details: string;
    care: string;
    shipping: string;
    shippingBody: string;
    returns: string;
    returnsBody: string;
    soldOut: string;
    related: string;
  };
  cart: {
    title: string;
    empty: string;
    continueShopping: string;
    subtotal: string;
    shippingNotice: string;
    checkout: string;
    remove: string;
  };
  account: {
    eyebrow: string;
    title: string;
    intro: string;
    email: string;
    magicLink: string;
    google: string;
    demoNotice: string;
  };
  newsletter: {
    email: string;
    submit: string;
    success: string;
    privacy: string;
  };
  footer: {
    shop: string;
    help: string;
    follow: string;
    shipping: string;
    returns: string;
    terms: string;
    privacy: string;
    accessibility: string;
    contact: string;
    copyright: string;
  };
  common: {
    loading: string;
    error: string;
    retry: string;
    demoMode: string;
    currency: string;
  };
}

const dictionaries: Record<Locale, SiteCopy> = {
  it: {
    announcement: "Spedizioni in Italia, UE, Regno Unito e USA · Resi entro 14 giorni",
    nav: {
      newArrivals: "Nuovi arrivi",
      shop: "Shop",
      collections: "Collezioni",
      story: "La nostra storia",
      journal: "Diario",
      contact: "Contatti",
      account: "Account",
      wishlist: "Preferiti",
      cart: "Carrello",
      menu: "Apri menu",
      close: "Chiudi menu",
    },
    home: {
      eyebrow: "Gioielli indipendenti · Roma",
      title: "Piccoli rituali, luce da indossare.",
      intro:
        "Una selezione di gioielli dal carattere luminoso, pensati per accompagnare ogni giorno e restare nel tempo.",
      primaryCta: "Scopri i nuovi arrivi",
      secondaryCta: "Esplora lo shop",
      newEyebrow: "Appena arrivati",
      newTitle: "Nuove forme di luce",
      newBody: "Finiture dorate e argentate, dettagli tattili, combinazioni da fare proprie.",
      craftEyebrow: "Il mondo Sbrilluccica",
      craftTitle: "Gioielli scelti con istinto, cura e un pizzico di meraviglia.",
      craftBody:
        "Sbrilluccica nasce a Roma dalla passione per gli oggetti che cambiano un gesto semplice. Ogni selezione mette insieme personalità, versatilità e bellezza quotidiana.",
      craftCta: "Conosci la nostra storia",
      newsletterEyebrow: "Posta luminosa",
      newsletterTitle: "Novità, ispirazioni e piccoli inviti.",
      newsletterBody: "Iscriviti per scoprire in anteprima nuovi gioielli e collezioni.",
    },
    catalog: {
      eyebrow: "Tutti i gioielli",
      title: "Lo shop",
      intro: "Trova il dettaglio che parla di te, tra nuovi arrivi e icone Sbrilluccica.",
      filter: "Filtra",
      sort: "Ordina",
      all: "Tutti",
      results: "prodotti",
      empty: "Nessun gioiello corrisponde ai filtri scelti.",
      newest: "Più recenti",
      priceAscending: "Prezzo crescente",
      priceDescending: "Prezzo decrescente",
    },
    product: {
      addToBag: "Aggiungi al carrello",
      addToWishlist: "Aggiungi ai preferiti",
      finish: "Finitura",
      quantity: "Quantità",
      details: "Dettagli",
      care: "Cura del gioiello",
      shipping: "Spedizione",
      shippingBody: "Tempi e costi vengono calcolati in base alla destinazione prima del pagamento.",
      returns: "Resi",
      returnsBody: "Puoi richiedere il reso entro 14 giorni dalla consegna.",
      soldOut: "Esaurito",
      related: "Potrebbe piacerti anche",
    },
    cart: {
      title: "Il tuo carrello",
      empty: "Il carrello è ancora vuoto.",
      continueShopping: "Continua lo shopping",
      subtotal: "Subtotale",
      shippingNotice: "Spedizione e imposte vengono calcolate al checkout.",
      checkout: "Vai al checkout",
      remove: "Rimuovi",
    },
    account: {
      eyebrow: "Il tuo spazio",
      title: "Accedi al tuo account",
      intro: "Ritrova ordini, indirizzi e preferiti. Puoi acquistare anche come ospite.",
      email: "Email",
      magicLink: "Ricevi il link di accesso",
      google: "Continua con Google",
      demoNotice: "Accesso dimostrativo: Supabase Auth verrà collegato in seguito.",
    },
    newsletter: {
      email: "Email",
      submit: "Iscriviti",
      success: "Grazie, sei nella lista.",
      privacy: "Iscrivendoti accetti l’informativa privacy.",
    },
    footer: {
      shop: "Shop",
      help: "Aiuto",
      follow: "Seguici",
      shipping: "Spedizioni",
      returns: "Resi e rimborsi",
      terms: "Termini e condizioni",
      privacy: "Privacy",
      accessibility: "Accessibilità",
      contact: "Contatti",
      copyright: "Sbrilluccica. Tutti i diritti riservati.",
    },
    common: {
      loading: "Caricamento…",
      error: "Qualcosa non ha funzionato.",
      retry: "Riprova",
      demoMode: "Modalità demo · Supabase non collegato",
      currency: "EUR",
    },
  },
  en: {
    announcement: "Shipping to Italy, the EU, UK and USA · 14-day returns",
    nav: {
      newArrivals: "New arrivals",
      shop: "Shop",
      collections: "Collections",
      story: "Our story",
      journal: "Journal",
      contact: "Contact",
      account: "Account",
      wishlist: "Wishlist",
      cart: "Bag",
      menu: "Open menu",
      close: "Close menu",
    },
    home: {
      eyebrow: "Independent jewellery · Rome",
      title: "Small rituals, light to wear.",
      intro:
        "A bright edit of jewellery designed to be lived in every day and loved for years to come.",
      primaryCta: "Discover new arrivals",
      secondaryCta: "Explore the shop",
      newEyebrow: "Just in",
      newTitle: "New forms of light",
      newBody: "Golden and silver finishes, tactile details and combinations to make your own.",
      craftEyebrow: "The Sbrilluccica world",
      craftTitle: "Jewellery chosen with instinct, care and a little wonder.",
      craftBody:
        "Sbrilluccica was born in Rome from a love for objects that transform a simple gesture. Every edit brings together personality, versatility and everyday beauty.",
      craftCta: "Read our story",
      newsletterEyebrow: "A little brightness, delivered",
      newsletterTitle: "New pieces, inspiration and invitations.",
      newsletterBody: "Sign up for an early look at new jewellery and collections.",
    },
    catalog: {
      eyebrow: "All jewellery",
      title: "Shop",
      intro: "Find the detail that feels like you, from new arrivals to Sbrilluccica signatures.",
      filter: "Filter",
      sort: "Sort",
      all: "All",
      results: "products",
      empty: "No jewellery matches the selected filters.",
      newest: "Newest",
      priceAscending: "Price: low to high",
      priceDescending: "Price: high to low",
    },
    product: {
      addToBag: "Add to bag",
      addToWishlist: "Add to wishlist",
      finish: "Finish",
      quantity: "Quantity",
      details: "Details",
      care: "Jewellery care",
      shipping: "Shipping",
      shippingBody: "Timing and costs are calculated for your destination before payment.",
      returns: "Returns",
      returnsBody: "You can request a return within 14 days of delivery.",
      soldOut: "Sold out",
      related: "You may also like",
    },
    cart: {
      title: "Your bag",
      empty: "Your bag is still empty.",
      continueShopping: "Continue shopping",
      subtotal: "Subtotal",
      shippingNotice: "Shipping and taxes are calculated at checkout.",
      checkout: "Go to checkout",
      remove: "Remove",
    },
    account: {
      eyebrow: "Your space",
      title: "Sign in to your account",
      intro: "Find orders, addresses and favourites. Guest checkout is always available.",
      email: "Email",
      magicLink: "Send me a sign-in link",
      google: "Continue with Google",
      demoNotice: "Demo sign-in: Supabase Auth will be connected later.",
    },
    newsletter: {
      email: "Email",
      submit: "Sign up",
      success: "Thank you, you’re on the list.",
      privacy: "By subscribing you agree to the privacy notice.",
    },
    footer: {
      shop: "Shop",
      help: "Help",
      follow: "Follow",
      shipping: "Shipping",
      returns: "Returns & refunds",
      terms: "Terms & conditions",
      privacy: "Privacy",
      accessibility: "Accessibility",
      contact: "Contact",
      copyright: "Sbrilluccica. All rights reserved.",
    },
    common: {
      loading: "Loading…",
      error: "Something went wrong.",
      retry: "Try again",
      demoMode: "Demo mode · Supabase not connected",
      currency: "EUR",
    },
  },
};

export function getCopy(locale: Locale): SiteCopy {
  return dictionaries[locale];
}
