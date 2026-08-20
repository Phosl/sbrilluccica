# Sbrilluccica

Nuovo e-commerce bilingue di Sbrilluccica, costruito con Next.js App Router e pensato per Vercel. Il progetto funziona subito con un catalogo dimostrativo basato su contenuti e immagini provenienti dal sito ufficiale; Supabase, Stripe, Resend e gli strumenti di tracciamento restano inattivi finché non vengono configurati.

## Stato del progetto

- Italiano sulle URL storiche senza prefisso; inglese sotto `/en`.
- Catalogo, ricerca, filtri, varianti, wishlist, carrello e checkout dimostrativo funzionanti in locale.
- Area cliente e amministrazione disponibili in modalità demo.
- Schema Supabase, RLS e migrazioni pronti ma non applicati a un database remoto.
- Stripe, Resend, Usercentrics, GA4 e Meta non inviano dati se le relative variabili non sono presenti.
- Le pagine legali sono bozze redazionali: prima della pubblicazione vanno completate e validate con i dati reali dell'attività.

## Avvio locale

Richiede Node.js 24 e pnpm.

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

Il sito è disponibile su `http://localhost:3000`.

## Controlli

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

`pnpm check` esegue l'intera sequenza.

## Collegare i servizi

1. Crea il progetto Supabase e applica in ordine le migrazioni in `supabase/migrations` seguendo `supabase/README.md`.
2. Imposta `DATA_PROVIDER=supabase` solo dopo avere implementato e verificato l'adapter dati: oggi la modalità supportata è `mock` e il valore `supabase` fallisce intenzionalmente in modo esplicito.
3. Configura le chiavi Stripe e le mappe server-side `STRIPE_PRICE_MAP` e `STRIPE_SHIPPING_RATE_MAP`; abilita webhook e verifica prezzi, imposte, promozioni e le quattro zone di spedizione in ambiente di test.
4. Configura Resend con dominio e mittente verificati.
5. Inserisci gli identificativi pubblici Usercentrics, GA4 e Meta solo dopo avere completato la configurazione del consenso.
6. Imposta `NEXT_PUBLIC_SITE_URL` con l'URL definitivo prima della build di produzione. Su Vercel, se non è presente, viene usato automaticamente il dominio di produzione del progetto.

Tutte le variabili previste sono documentate in `.env.example`. Nessuna chiave segreta deve essere esposta con il prefisso `NEXT_PUBLIC_`.

## Importare il catalogo Wix

La procedura di staging è documentata in `docs/catalog-import.md`. L'import non accorpa automaticamente prodotti omonimi: genera candidati da revisionare, così finiture e SKU non vengono persi per errore.

## Percorsi principali

- `/`, `/shop`, `/product-page/[slug]`, `/category/[slug]`
- `/cart`, `/wishlist`, `/account`, `/checkout`
- `/our-story`, `/contact` e pagine informative/legali
- `/admin` per la console amministrativa demo
- equivalenti inglesi sotto `/en`

Le immagini ufficiali incluse e la relativa provenienza sono elencate in `docs/asset-provenance.md`.
