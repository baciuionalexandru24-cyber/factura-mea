# Sistem editorial Verifica Factura

Editeaza continutul principal in aceste fisiere:

- `content.json` pentru articole si stiri.
- `furnizori.json` pentru furnizori, oferte si preturi.
- `editorial-calendar.json` pentru strategie, cadenta saptamanala, backlog si template-uri social.

## Flux continut

Campuri recomandate pentru fiecare articol sau stire:

- `type`: `article` sau `news`
- `status`: `draft`, `review`, `approved`, `published`, `archived`
- `slug`: URL-ul paginii
- `title`, `excerpt`, `metaDescription`, `intro`
- `publishDate`
- `lastVerifiedAt`
- `author`
- `sources`
- `faq`
- `sections`

Doar intrarile cu `status: "published"` apar pe site, in sitemap si in RSS.

## Actualizare SEO

Ruleaza:

```bash
npm run generate:seo
```

Comanda ruleaza mai intai validatorul editorial, apoi genereaza automat:

- `public/sitemap.xml`
- `public/rss.xml`
- pagini HTML statice pentru rutele SEO importante:
  - `public/articole/.../index.html`
  - `public/stiri/.../index.html`
  - `public/furnizori/.../index.html`

La `npm run build`, generarea SEO ruleaza automat prin `prebuild`.

## Content engine si calendar editorial

Calendarul editorial este in:

```txt
src/data/editorial-calendar.json
```

Include:

- obiectivul principal si audienta;
- piloni de continut;
- cadenta saptamanala;
- backlog de articole, stiri, comparatii si pagini comerciale;
- template-uri pentru social media.

Pentru a genera asset-uri de social media din continutul publicat:

```bash
npm run generate:social
```

Comanda creeaza folderul intern:

```txt
editorial/
  social-calendar.json
  social-calendar.md
```

Aceste fisiere nu sunt pentru publicare directa pe site. Sunt materiale de lucru pentru TikTok/Reels/Shorts, Facebook, carusele si newsletter.

Pentru regenerarea completa:

```bash
npm run generate:all
```

Aceasta ruleaza validarea, genereaza SEO si creeaza asset-urile social.

## Validare editoriala

Ruleaza:

```bash
npm run validate:content
```

Validatorul opreste build-ul daca un material publicat are probleme critice:

- lipseste `title`, `excerpt`, `metaDescription` sau `intro`;
- lipseste `author.name`;
- lipseste `lastVerifiedAt`;
- lipsesc sursele sau URL-urile de sursa sunt invalide;
- lipsesc intrebarile FAQ;
- exista slug duplicat;
- exista caractere corupte de encoding, de tip `sÄƒ`, `Ã®`, `È›`;
- un furnizor are pret invalid, sursa lipsa sau data `actualizatLa` invalida.

Pentru materiale in lucru foloseste `status: "draft"` sau `status: "review"`. Doar `published` este validat strict si publicat in site, sitemap si RSS.

## De ce exista pagini HTML statice

Aplicatia ramane React pentru experienta interactiva, dar rutele importante au si HTML generat la build. Asta ajuta motoarele de cautare sa gaseasca titlul, descrierea, continutul, sursele si schema JSON-LD fara sa astepte randarea JavaScript.
