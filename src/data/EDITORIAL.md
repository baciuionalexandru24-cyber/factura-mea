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

La `npm run build`, generarea SEO ruleaza automat prin `prebuild`.
