# Sistem editorial Verifica Factura

Editeaza continutul principal in aceste fisiere:

- `content.json` pentru articole si stiri.
- `furnizori.json` pentru furnizori, oferte si preturi.

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

Comanda genereaza automat:

- `public/sitemap.xml`
- `public/rss.xml`
- pagini HTML statice pentru rutele SEO importante:
  - `public/articole/.../index.html`
  - `public/stiri/.../index.html`
  - `public/furnizori/.../index.html`

La `npm run build`, generarea SEO ruleaza automat prin `prebuild`.

## De ce exista pagini HTML statice

Aplicatia ramane React pentru experienta interactiva, dar rutele importante au si HTML generat la build. Asta ajuta motoarele de cautare sa gaseasca titlul, descrierea, continutul, sursele si schema JSON-LD fara sa astepte randarea JavaScript.
