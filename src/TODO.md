# TODO — Verifică Factura

## 🔴 Prioritate mare (înainte de lansare oficială)
- [ ] Cumpără domeniu verificafactura.ro (~10€/an)
- [ ] Conectează domeniul la Vercel
- [ ] Configurează email pe domeniu (no-reply@verificafactura.ro) — Zoho Mail gratuit
- [ ] Actualizează replyTo în Google Apps Script cu emailul oficial
- [ ] Verificare texte legale (GDPR, termeni) de un specialist juridic
- [ ] Actualizează politica de confidențialitate — menționează Google Apps Script
- [ ] Scoate nota "model de lucru" de pe paginile legale la lansare
- [ ] Pagini individuale per furnizor (/furnizori/hidroelectrica, /furnizori/electrica etc.) — SEO foarte valoros
- [ ] Scoate comentariul cu formula `valoare_unitară - 0.60` din cod sau mută-l într-un document intern

## 🟡 Prioritate medie (primele luni)
- [ ] Filtrare furnizori per zonă de distribuție (necesită date POSF per zonă)
  - Screenshot-uri POSF pentru: Transilvania Nord, Transilvania Sud, Moldova, Oltenia, Banat, Dobrogea, Muntenia Nord
  - Structură: furnizoriRaw per zonă sau matrice furnizor × zonă
- [ ] Adaugă notă sub dropdown furnizori: "Prețurile sunt pentru zona Muntenia Sud"
- [ ] Adaugă imagine OG (1200×630px) pentru sharing mai atractiv pe WhatsApp/Facebook
- [ ] Mută prețurile furnizori în `furnizori.json` separat (acum sunt hardcodate în App.jsx)
- [ ] Migrare articole din JSX în fișiere Markdown separate + generare automată sitemap
- [ ] Articole noi SEO: "Plafonare energie 2026", "Cum treci de la Enel la Hidroelectrica"
- [ ] Google AdSense — aplicare după 300-500 vizitatori/zi
- [ ] Consultanță cu taxă — introducere după primele 10-20 cazuri gratuite
- [ ] Înlocuiește `no-cors` pe Google Apps Script cu endpoint care returnează răspuns verificabil

## 🟢 Prioritate scăzută (viitor)
- [ ] Afiliere furnizori — contactare directă pentru comision per lead
- [ ] PWA (Progressive Web App) — site-ul se poate instala pe telefon
- [ ] Upload PDF factură + analiză automată (OCR)
- [ ] Cont utilizator + istoric facturi (Supabase)
- [ ] Notificări email când se schimbă prețurile
- [ ] Dark mode
- [ ] Backend real pentru formular (în loc de Google Apps Script)

## 🔄 Mentenanță recurentă
- [ ] Actualizare prețuri furnizori din POSF (lunar, la început de lună)
- [ ] Actualizare costuri reglementate când se modifică (ANRE, de obicei anual)
- [ ] Verificare TVA dacă se modifică legislativ
- [ ] Adăugare 2-3 articole noi pe lună pentru SEO
- [ ] Actualizare `<lastmod>` în sitemap.xml când modifici un articol
- [ ] Răspuns la solicitări din Google Sheets
- [ ] Verificare Google Search Console săptămânal — progres indexare

## ✅ Completat
- [x] Site live pe Vercel (factura-mea.vercel.app)
- [x] Deploy automat GitHub → Vercel
- [x] Calculator funcțional cu tarife reale ANRE
- [x] 50+ furnizori din POSF cu oferte și % verde
- [x] Formular contact → Google Sheets + email notificare
- [x] Email auto-reply către client la trimiterea formularului
- [x] Meniu mobil funcțional
- [x] 10 articole SEO detaliate (6 rescrise + 4 noi)
- [x] TVA corectat la 21%
- [x] Costuri reglementate actualizate (TG, TL, CFD etc.)
- [x] Opțiuni avansate în acordeon
- [x] Structură cost în acordeon
- [x] Telefon opțional în formular
- [x] Google Search Console — site verificat + sitemap trimis
- [x] Google Analytics — tracking activ (G-5091L3TPXT)
- [x] Bing Webmaster Tools — importat din Google Search Console
- [x] Open Graph tags — previzualizare frumoasă pe WhatsApp/Facebook
- [x] Canonical URL adăugat
- [x] robots.txt adăugat
- [x] sitemap.xml cu lastmod și changefreq
- [x] index.html — lang="ro", title, meta description
- [x] Înlocuit Formspree cu Web3Forms, apoi cu Google Sheets
- [x] TODO.md creat și organizat