# Codex handoff - Verifica Factura

Acest fisier este pentru continuarea proiectului pe alt PC sau intr-un chat Codex nou.

## Context proiect

Repository GitHub: `baciuionalexandru24-cyber/factura-mea`

Aplicatie React pentru verificare/informare facturi energie electrica in Romania. Directia produsului este:

- continut SEO corect si usor de intretinut;
- articole si stiri bazate pe surse oficiale;
- pagini pentru furnizori, articole si stiri;
- automatizare editoriala pentru programare, publicare, sitemap, RSS si social calendar;
- mentinerea credibilitatii prin verificare umana inainte de publicarea stirilor sensibile.

## Ce s-a construit pana acum

### 1. Content engine

Continutul principal este in:

- `src/data/content.json`
- `src/data/furnizori.json`
- `src/data/editorial-calendar.json`
- `src/data/news-sources.json`
- `src/data/EDITORIAL.md`

Articolele si stirile folosesc campuri SEO/editoriale precum:

- `type`
- `status`
- `title`
- `slug`
- `excerpt`
- `metaDescription`
- `publishDate`
- `lastVerifiedAt`
- `author`
- `sources`
- `faq`
- `sections`

Statusuri folosite:

- `draft`
- `review`
- `approved`
- `scheduled`
- `published`
- `archived`

### 2. Pagini si SEO

Aplicatia include:

- homepage;
- pagina `/furnizori`;
- pagina `/stiri`;
- pagini individuale pentru articole;
- pagini individuale pentru stiri;
- pagini individuale pentru furnizori;
- JSON-LD pentru homepage, articole, stiri si furnizori;
- CTA-uri de tip "Verifica factura ta";
- evenimente GA4 pentru click-uri, formular si interactiuni importante.

### 3. Generare automata asset-uri

Scripturile principale sunt in `scripts/`:

- `generate-content-assets.cjs`
- `generate-social-assets.cjs`
- `validate-editorial-content.cjs`
- `publish-scheduled-content.cjs`
- `schedule-approved-content.cjs`
- `import-news-drafts.cjs`

Acestea genereaza:

- `public/sitemap.xml`
- `public/rss.xml`
- `public/articole/`
- `public/stiri/`
- `public/furnizori/`
- `editorial/social-calendar.json`
- `editorial/social-calendar.md`

### 4. Automatizare GitHub Actions

Workflow:

- `.github/workflows/editorial-automation.yml`

Ruleaza automat zilnic si poate fi pornit manual din GitHub:

GitHub repo -> Actions -> Editorial automation -> Run workflow

Daca automatizarea produce modificari, GitHub face commit automat cu:

`github-actions[bot]`

## Comenzi importante

| Comanda | Cand se foloseste | Ce face |
| --- | --- | --- |
| `npm run validate:content` | Dupa editari in JSON | Verifica structura, surse, FAQ, date si encoding |
| `npm run import:news` | Cand vrei drafturi noi de stiri | Citeste sursele monitorizate si creeaza drafturi in `review` |
| `npm run schedule:approved` | Dupa ce continutul este pus pe `approved` | Alege automat data si trece continutul in `scheduled` |
| `npm run publish:scheduled` | Manual rar sau automat in Actions | Publica materialele programate ajunse la data publicarii |
| `npm run automate:editorial` | Flux editorial fara regenerare completa | Importa stiri, programeaza approved si publica scheduled |
| `npm run generate:all` | Comanda principala dupa modificari | Programeaza, publica, valideaza, regenereaza SEO si social |
| `npm run build` | Inainte de deploy sau in platforma de deploy | Ruleaza prebuild si apoi build-ul React |

## Cum se publica un articol nou

1. Se adauga un item nou in `src/data/content.json`.
2. Se seteaza `type: "article"`.
3. Se completeaza SEO: titlu, slug, excerpt, meta description, surse, FAQ, sectiuni.
4. Cand articolul este verificat, se seteaza `status: "approved"`.
5. Se ruleaza `npm run generate:all` sau se lasa GitHub Actions sa ruleze automat.
6. Scriptul il trece in `scheduled`, apoi in `published` cand ajunge data publicarii.

Pentru publicare imediata, se poate seta manual `status: "scheduled"` si `publishDate` cu data curenta, apoi se ruleaza `npm run generate:all`.

## Cum se publica o stire noua

1. Se ruleaza `npm run import:news` sau se asteapta GitHub Actions.
2. Scriptul creeaza drafturi de stiri cu `status: "review"`, pe baza surselor monitorizate.
3. Omul verifica sursa oficiala si corectitudinea informatiei.
4. Daca stirea este corecta, se modifica in `status: "approved"`.
5. Se ruleaza `npm run generate:all` sau se asteapta automatizarea.
6. Sistemul o programeaza si o publica automat.

Important: stirile legislative/fiscale/ANRE/ANAF nu trebuie publicate automat fara verificare umana.

## Cum continui pe alt PC

### Varianta recomandata

1. Asigura-te ca totul este commit-uit si impins pe GitHub.
2. Pe noul PC, cloneaza repo-ul:

```bash
git clone https://github.com/baciuionalexandru24-cyber/factura-mea.git
cd factura-mea
```

3. Instaleaza dependintele:

```bash
npm install
```

4. Verifica proiectul:

```bash
npm run validate:content
npm run generate:all
npm start
```

5. In Codex pe noul PC, deschide folderul repo-ului si spune:

```text
Citeste CODEX_HANDOFF.md, src/data/EDITORIAL.md si package.json. Continuam proiectul Verifica Factura de la ultima versiune.
```

### Daca folosesti StackBlitz

1. Commit in StackBlitz.
2. Verifica in GitHub ca modificarile au ajuns pe branch-ul `main`.
3. Pe noul PC, deschide acelasi repository din GitHub sau cloneaza local.
4. Nu copia `node_modules`; se reface cu `npm install`.

## De retinut despre chatul Codex

Istoricul conversatiei poate sa nu apara automat pe alt PC, chiar daca folosesti acelasi cont. Codul si documentatia trebuie sa fie sursa principala de adevar.

Pentru continuitate, foloseste:

- `CODEX_HANDOFF.md`
- `src/data/EDITORIAL.md`
- `docs/Automatizare publicare Verifica Factura.docx`
- `package.json`
- scripturile din `scripts/`

## Urmatorii pasi posibili

- adaugare articole SEO noi pe baza intrebarilor frecvente ale utilizatorilor;
- extindere surse monitorizate pentru stiri oficiale;
- integrare Search Console/analytics pentru prioritizare continut;
- calendar editorial lunar;
- template-uri social media mai avansate;
- pagini comerciale/monetizare pentru lead-uri si parteneriate.
