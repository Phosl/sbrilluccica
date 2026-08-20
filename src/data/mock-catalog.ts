import type {
  CollectionRecord,
  Locale,
  LocalizedText,
  ProductCategory,
  ProductMediaRecord,
  ProductRecord,
  ProductTranslation,
  ProductVariantRecord,
} from "../lib/domain";
import { money } from "../lib/domain";

const WIX_MEDIA_ROOT = "https://static.wixstatic.com/media";
const SITE_ROOT = "https://www.sbrilluccica.com";
const MOCK_PUBLISHED_AT = "2026-08-20T08:00:00.000Z";

interface MockProductSeed {
  id: string;
  slug: string;
  category: ProductCategory;
  name: string;
  englishName?: string;
  priceInCents: number;
  imageIds: string[];
  collectionSlug: string;
  featured?: boolean;
  isNew?: boolean;
  stock?: number;
  variants?: Array<{
    id: string;
    sku: string;
    name: LocalizedText;
    option: string;
    stock: number;
  }>;
}

function localized(it: string, en: string): LocalizedText {
  return { it, en };
}

function createTranslation(
  seed: MockProductSeed,
  locale: Locale,
): ProductTranslation {
  const name = locale === "it" ? seed.name : (seed.englishName ?? seed.name);
  const categoryCopy: Record<ProductCategory, LocalizedText> = {
    necklaces: localized(
      "Una collana dal carattere deciso, scelta per dare ritmo anche al look più essenziale.",
      "A characterful necklace selected to bring rhythm to even the simplest look.",
    ),
    earrings: localized(
      "Un paio di orecchini luminosi, pensato per accompagnare gesti e movimento.",
      "A bright pair of earrings designed to move with you.",
    ),
    rings: localized(
      "Un anello protagonista, da indossare da solo o insieme ai propri preferiti.",
      "A statement ring to wear alone or alongside your favourites.",
    ),
    bracelets: localized(
      "Un bracciale dalla presenza materica, facile da abbinare e sovrapporre.",
      "A tactile bracelet that is easy to style and stack.",
    ),
    accessories: localized(
      "Un accessorio selezionato per aggiungere un dettaglio luminoso.",
      "An accessory selected to add a bright finishing touch.",
    ),
  };
  const shortDescription = categoryCopy[seed.category][locale];

  return {
    name,
    shortDescription,
    description:
      locale === "it"
        ? `${name} fa parte della selezione Sbrilluccica. Questa scheda usa nome, prezzo e immagini del catalogo ufficiale; materiali, misure e cura saranno completati durante l’importazione definitiva.`
        : `${name} is part of the Sbrilluccica selection. This preview uses the name, price and imagery from the official catalogue; materials, measurements and care will be completed during the final import.`,
    materials: null,
    measurements: null,
    care: null,
    seoTitle: `${name} | Sbrilluccica`,
    seoDescription: shortDescription,
  };
}

function createMedia(
  seed: MockProductSeed,
  sourcePageUrl: string,
): ProductMediaRecord[] {
  return seed.imageIds.map((imageId, index) => ({
    id: `${seed.id}-media-${index + 1}`,
    kind: "image",
    url: `${WIX_MEDIA_ROOT}/${imageId}`,
    alt: localized(
      `${seed.name}, vista ${index + 1}`,
      `${seed.englishName ?? seed.name}, view ${index + 1}`,
    ),
    width: 1200,
    height: 1800,
    position: index,
    source: {
      kind: "official-wix",
      pageUrl: sourcePageUrl,
    },
  }));
}

function createVariants(seed: MockProductSeed): ProductVariantRecord[] {
  if (seed.variants) {
    return seed.variants.map((variant) => ({
      id: variant.id,
      productId: seed.id,
      sku: variant.sku,
      name: variant.name,
      options: { finish: variant.option },
      price: money(seed.priceInCents),
      compareAtPrice: null,
      stockOnHand: variant.stock,
      stockReserved: 0,
      lowStockThreshold: 2,
      active: true,
    }));
  }

  return [
    {
      id: `${seed.id}-variant-default`,
      productId: seed.id,
      sku: `SBR-${seed.slug.toUpperCase().replaceAll(/[^A-Z0-9]+/g, "-")}`,
      name: localized("Unica", "One size"),
      options: {},
      price: money(seed.priceInCents),
      compareAtPrice: null,
      stockOnHand: seed.stock ?? 8,
      stockReserved: 0,
      lowStockThreshold: 2,
      active: true,
    },
  ];
}

function createProduct(seed: MockProductSeed): ProductRecord {
  const sourceUrl = `${SITE_ROOT}/product-page/${seed.slug}`;

  return {
    id: seed.id,
    slug: seed.slug,
    status: "published",
    category: seed.category,
    translations: {
      it: createTranslation(seed, "it"),
      en: createTranslation(seed, "en"),
    },
    media: createMedia(seed, sourceUrl),
    variants: createVariants(seed),
    collectionSlugs: [seed.collectionSlug],
    tags: [seed.category, "sbrilluccica"],
    featured: seed.featured ?? false,
    isNew: seed.isNew ?? false,
    publishedAt: MOCK_PUBLISHED_AT,
    updatedAt: MOCK_PUBLISHED_AT,
    sourceUrl,
    contentStatus: "mock",
  };
}

export const mockProductRecords: ProductRecord[] = [
  createProduct({
    id: "10000000-0000-4000-8000-000000000001",
    slug: "collana-dukaan",
    category: "necklaces",
    name: "Collana Dukaan",
    priceInCents: 3800,
    imageIds: ["cbc8f4_348bd8b43948446cb182fd91a536d706~mv2.jpg"],
    collectionSlug: "collane-artigianali-etniche",
    featured: true,
    isNew: true,
    stock: 6,
  }),
  createProduct({
    id: "10000000-0000-4000-8000-000000000002",
    slug: "collana-taaron",
    category: "necklaces",
    name: "Collana Taaron",
    priceInCents: 4500,
    imageIds: [
      "cbc8f4_a61e2d14b7594aff88738daa66af2ca8~mv2.jpg",
      "cbc8f4_36c1721770464fd8b2e041d611ec6b5c~mv2.jpg",
    ],
    collectionSlug: "collane-artigianali-etniche",
    featured: true,
    stock: 3,
  }),
  createProduct({
    id: "10000000-0000-4000-8000-000000000003",
    slug: "orecchini-kolam",
    category: "earrings",
    name: "Orecchini Kolam",
    englishName: "Kolam Earrings",
    priceInCents: 2800,
    imageIds: [
      "cbc8f4_f2cdc1ecc0cf421a8da8e1977bd7419d~mv2.jpg",
      "cbc8f4_3d514cf920c8403491f3b14841fc87cd~mv2.jpg",
    ],
    collectionSlug: "orecchini-artigianali-etnici",
    featured: true,
    isNew: true,
    stock: 10,
  }),
  createProduct({
    id: "10000000-0000-4000-8000-000000000004",
    slug: "kalpana-anello",
    category: "rings",
    name: "Kalpana Anello",
    englishName: "Kalpana Ring",
    priceInCents: 3800,
    imageIds: [
      "cbc8f4_c488cdbf90e841f6a220fb24ee6214f4~mv2.jpg",
      "cbc8f4_f40320a824b84ddb980dfd73b38439bd~mv2.jpg",
      "cbc8f4_200b667af41d4ba699d07debab647d73~mv2.jpg",
    ],
    collectionSlug: "anelli-artigianali-etnici",
    featured: true,
    isNew: true,
    variants: [
      {
        id: "20000000-0000-4000-8000-000000000041",
        sku: "SBR-KALPANA-TURCHESE",
        name: localized("Turchese", "Turquoise"),
        option: "turquoise",
        stock: 4,
      },
      {
        id: "20000000-0000-4000-8000-000000000042",
        sku: "SBR-KALPANA-NERO",
        name: localized("Nero", "Black"),
        option: "black",
        stock: 2,
      },
      {
        id: "20000000-0000-4000-8000-000000000043",
        sku: "SBR-KALPANA-BIANCO",
        name: localized("Bianco", "White"),
        option: "white",
        stock: 5,
      },
    ],
  }),
  createProduct({
    id: "10000000-0000-4000-8000-000000000005",
    slug: "taara-bracciale",
    category: "bracelets",
    name: "Taara Bracciale",
    englishName: "Taara Bracelet",
    priceInCents: 2500,
    imageIds: [
      "cbc8f4_49526265804e4a36a47018969f288112~mv2.jpg",
      "cbc8f4_c1301e5167944f8696d416385b4f7493~mv2.jpg",
    ],
    collectionSlug: "braccialetti-artigianali-etnici",
    featured: true,
    isNew: true,
    stock: 12,
  }),
  createProduct({
    id: "10000000-0000-4000-8000-000000000006",
    slug: "vasant-bracciale",
    category: "bracelets",
    name: "Vasant Bracciale",
    englishName: "Vasant Bracelet",
    priceInCents: 4500,
    imageIds: ["cbc8f4_9ec1ab0544fc436c8769185e7528a267~mv2.jpg"],
    collectionSlug: "braccialetti-artigianali-etnici",
    featured: false,
    stock: 4,
  }),
  createProduct({
    id: "10000000-0000-4000-8000-000000000007",
    slug: "samaan-anello",
    category: "rings",
    name: "Samaan Anello",
    englishName: "Samaan Ring",
    priceInCents: 4000,
    imageIds: ["cbc8f4_4e9034b39f584346b0802874f6cba1fd~mv2.jpg"],
    collectionSlug: "anelli-artigianali-etnici",
    featured: false,
    stock: 1,
  }),
  createProduct({
    id: "10000000-0000-4000-8000-000000000008",
    slug: "orecchino-ariyon",
    category: "earrings",
    name: "Orecchino Ariyon",
    englishName: "Ariyon Earring",
    priceInCents: 2700,
    imageIds: [
      "cbc8f4_095a1935730441c2908eab03d0d2a3c9~mv2.jpg",
      "cbc8f4_a2b63a890c744fb7a0f14fdbbe2b028e~mv2.jpg",
    ],
    collectionSlug: "orecchini-artigianali-etnici",
    featured: true,
    stock: 7,
  }),
];

interface CollectionSeed {
  id: string;
  slug: string;
  categoryName: LocalizedText;
  description: LocalizedText;
  imageId: string;
  position: number;
}

function createCollection(seed: CollectionSeed): CollectionRecord {
  const sourcePageUrl = `${SITE_ROOT}/category/${seed.slug}`;
  const heroImage: ProductMediaRecord = {
    id: `${seed.id}-hero`,
    kind: "image",
    url: `${WIX_MEDIA_ROOT}/${seed.imageId}`,
    alt: seed.categoryName,
    width: 1600,
    height: 2100,
    position: 0,
    source: { kind: "official-wix", pageUrl: sourcePageUrl },
  };

  return {
    id: seed.id,
    slug: seed.slug,
    published: true,
    position: seed.position,
    translations: {
      it: {
        name: seed.categoryName.it,
        description: seed.description.it,
        seoTitle: `${seed.categoryName.it} | Sbrilluccica`,
        seoDescription: seed.description.it,
      },
      en: {
        name: seed.categoryName.en,
        description: seed.description.en,
        seoTitle: `${seed.categoryName.en} | Sbrilluccica`,
        seoDescription: seed.description.en,
      },
    },
    heroImage,
  };
}

export const mockCollectionRecords: CollectionRecord[] = [
  createCollection({
    id: "30000000-0000-4000-8000-000000000001",
    slug: "collane-artigianali-etniche",
    categoryName: localized("Collane", "Necklaces"),
    description: localized(
      "Collane che accendono il look, una alla volta.",
      "Necklaces that light up a look, one at a time.",
    ),
    imageId: "cbc8f4_3f1c7ef3d7124c8fa008976e49d80cb0~mv2.jpg",
    position: 1,
  }),
  createCollection({
    id: "30000000-0000-4000-8000-000000000002",
    slug: "orecchini-artigianali-etnici",
    categoryName: localized("Orecchini", "Earrings"),
    description: localized(
      "Piccoli gesti di luce da portare ogni giorno.",
      "Small gestures of light to wear every day.",
    ),
    imageId: "cbc8f4_73b540e180444b7fba3ebd0495b27eac~mv2.jpg",
    position: 2,
  }),
  createCollection({
    id: "30000000-0000-4000-8000-000000000003",
    slug: "anelli-artigianali-etnici",
    categoryName: localized("Anelli", "Rings"),
    description: localized(
      "Anelli da mescolare, sovrapporre e rendere propri.",
      "Rings to mix, stack and make your own.",
    ),
    imageId: "cbc8f4_4d14b4cb84ec479394367dd6aa15f02d~mv2.jpg",
    position: 3,
  }),
  createCollection({
    id: "30000000-0000-4000-8000-000000000004",
    slug: "braccialetti-artigianali-etnici",
    categoryName: localized("Bracciali", "Bracelets"),
    description: localized(
      "Forme e dettagli da indossare insieme.",
      "Shapes and details designed to be worn together.",
    ),
    imageId: "cbc8f4_dd5b35ea79a449a4ba7a36bccbab1505~mv2.jpg",
    position: 4,
  }),
];
