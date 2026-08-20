# Importazione del catalogo Wix

Questa pipeline legge esclusivamente fonti pubbliche ufficiali di
Sbrilluccica e produce un JSON di staging. Non scrive nel mock applicativo e
non inserisce dati in Supabase.

## Fonti e precedenza

1. [`store-products-sitemap.xml`](https://www.sbrilluccica.com/store-products-sitemap.xml):
   elenco completo degli URL, data di modifica e immagini dichiarate nel
   sitemap Wix.
2. JSON-LD `Product` della singola scheda: nome italiano, descrizione, SKU,
   prezzo, valuta, disponibilità e immagini.
3. Dati pubblici Wix incorporati nella stessa pagina: ID prodotto, opzioni,
   varianti, SKU variante e quantità pubblicata.

Nomi, prezzi o materiali non presenti in queste fonti restano assenti. La
categoria è solo una proposta basata sulle parole dello slug e del nome ed è
sempre marcata con `verified: false`. L'importer non crea traduzioni inglesi.

## Esecuzione

Serve Node 20 o successivo; non ci sono dipendenze aggiuntive.

```bash
node scripts/import-wix-catalog/index.mjs
```

Il risultato predefinito è
`scripts/import-wix-catalog/staging/wix-catalog.json`. Tutta la directory di
staging, inclusa la cache HTML, è ignorata da Git.

Lo stesso comando è già disponibile dallo script di progetto:

```bash
pnpm catalog:import
```

Smoke test su poche schede:

```bash
node scripts/import-wix-catalog/index.mjs --limit 5
```

Verifica mirata, ripetendo `--slug` quando serve:

```bash
node scripts/import-wix-catalog/index.mjs \
  --slug anello-artigianale-etnico-karma-onici-nere \
  --slug collana-taaron-1
```

La cache è versionata con il `lastmod` del sitemap; quando Wix aggiorna quella
data la pagina viene riscaricata. Usare `--refresh` per ignorarla comunque.
`--concurrency`, `--timeout-ms` e `--retries` regolano il recupero;
`--sitemap-file` usa un sitemap locale e, con la cache completa, consente una
verifica offline. `--help` elenca tutte le opzioni.

Il file viene scritto anche se alcune schede falliscono, ma il comando termina
con codice 1 quando gli errori superano `--max-failures` (zero per default).
Questo evita che pagine sparite o cambiate vengano scambiate per prodotti
importati correttamente.

## Struttura dello staging

Ogni elemento di `products` conserva sia lo slug Wix (`slug`) sia lo slug ASCII
compatibile con il vincolo Supabase (`targetSlug`). I due valori differiscono
solo quando lo slug ufficiale contiene caratteri non ammessi dallo schema.

I campi principali sono pensati per questa successiva mappatura, dopo la
revisione umana:

| Staging | Destinazione | Nota |
| --- | --- | --- |
| `targetSlug` | `products.slug` | Verificare prima collisioni e redirect dal vecchio URL |
| `sourceUrl` | `products.source_url` | URL ufficiale conservato per provenienza |
| `categoryCandidate.value` | `products.category` | Inferito, mai dichiarato verificato |
| `nameIt`, `descriptionIt` | `product_translations` (`it`) | Estratti dal JSON-LD |
| `images` | `product_media` | URL canonico Wix, resa, alt e dimensioni quando disponibili |
| `options`, `variants` | `product_variants` | Usare `targetSku`; SKU e stock provengono solo dai dati pubblici Wix |
| `price.amountInCents` | `product_variants.price_cents` | Conversione deterministica dalla valuta dichiarata |

`verification` indica la fonte usata campo per campo. `reviewFlags` raccoglie
le decisioni ancora aperte. La presenza di dati ufficiali non rende
automaticamente completa una scheda: categoria, traduzione inglese, testi SEO,
materiali strutturati e policy editoriali richiedono comunque revisione.

## Duplicati, varianti e conflitti

La pipeline non unisce mai prodotti.

- Gli slug terminanti in `-1`, `-2`, ecc. entrano in
  `variantCandidateGroups` con motivo `numbered-slug`.
- Prodotti con lo stesso nome normalizzato entrano in un gruppo separato con
  motivo `same-normalized-name`.
- `skuConflictGroups` segnala SKU variante incompatibili con l'unicità richiesta
  dallo schema Supabase; nessuno SKU viene riscritto.
- Se esiste una sola variante senza SKU proprio, `targetSku` può usare lo SKU
  prodotto verificato ed espone `targetSkuSource: "product-sku"`. Con più
  varianti non viene propagato, perché produrrebbe duplicati fittizi.
- `slugCollisionGroups` segnala eventuali collisioni create dalla
  normalizzazione ASCII; nessuno slug viene scelto automaticamente.
- Le pagine nel sitemap prive di JSON-LD `Product` finiscono in `failures` e non
  vengono riempite con dati dedotti da altre schede.

Per confermare una variante servono almeno nome/finitura coerenti, SKU distinti
e corrispondenza esplicita dei dati Wix. Un suffisso numerico, da solo, non è
prova sufficiente.

## Verifica live del 20 agosto 2026

La validazione completa ha letto 316 URL dal sitemap ufficiale:

- 302 schede con nome, prezzo, immagini, almeno una variante e quantità
  pubblica leggibili;
- 196 schede con opzioni esplicite (per esempio taglia);
- 14 URL nel sitemap senza JSON-LD `Product`, conservati in `failures`;
- 106 gruppi candidati variante: 34 da suffisso numerico e 72 da nome uguale;
- 18 slug ufficiali da normalizzare in ASCII, senza collisioni nella fotografia
  corrente;
- 17 gruppi di SKU variante duplicati, da risolvere prima dell'importazione
  Supabase;
- 22 varianti distribuite su 7 prodotti senza SKU univoco utilizzabile, da
  completare prima dell'importazione;
- nessun prezzo o immagine mancante fra le 302 schede estratte.

Gli URL che non esponevano un prodotto erano:

```text
andaakaar-anello-1
anello-artigianale-etnico-ayodhya-zircone-bianco
anello-artigianale-etnico-coral-ottone
anello-artigianale-etnico-karma-onici-verdi
anello-artigianale-etnico-leopard-simil-argento
anello-artigianale-etnico-patna-onice-nera
bracciale-artigianale-etnico-hierro-mini-ottone
collana-artigianale-etnica-kitaab-oro-bianco
collana-artigianale-etnica-small-third-eye-dorata
earcuf-h-ıỵ
earcuf-h-lạk
earcuf-h-lạk-1
saanp-ring-1
tris-bracciale
```

Questi numeri sono una fotografia della fonte pubblica, non un dato immutabile:
prima della migrazione finale va eseguito un nuovo import con `--refresh` e va
conservato il JSON approvato come artefatto di migrazione.

## Verifica del parser

I test sono autonomi e usano fixture ridotte, senza rete:

```bash
node --test scripts/import-wix-catalog/lib.test.mjs
```

Coprono sitemap, JSON-LD, opzioni/varianti, stock, prezzi in centesimi,
normalizzazione degli slug, gruppi candidati e conflitti SKU.
