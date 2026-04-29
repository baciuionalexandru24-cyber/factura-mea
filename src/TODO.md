# TODO — Verifică Factura

## 🔴 Prioritate mare (înainte de lansare oficială)
- [ ] Google Search Console — înregistrare site + sitemap
- [ ] Google Analytics — tracking vizitatori
- [ ] Cumpără domeniu verificafactura.ro (~10€/an)
- [ ] Conectează domeniul la Vercel
- [ ] Verificare texte legale (GDPR, termeni) de un specialist juridic
- [ ] Scoate nota "model de lucru" de pe paginile legale la lansare

## 🟡 Prioritate medie (primele luni)
- [ ] Filtrare furnizori per zonă de distribuție (necesită date POSF per zonă)
  - Screenshot-uri POSF pentru: Transilvania Nord, Transilvania Sud, Moldova, Oltenia, Banat, Dobrogea, Muntenia Nord
  - Structură: furnizoriRaw per zonă sau matrice furnizor × zonă
- [ ] Adaugă notă sub dropdown furnizori: "Prețurile sunt pentru zona Muntenia Sud"
- [ ] Migrare articole din JSX în fișiere Markdown separate
- [ ] Articole noi SEO: "Plafonare energie 2026", "Cum treci de la Enel la Hidroelectrica"
- [ ] Google AdSense — aplicare după 300-500 vizitatori/zi
- [ ] Consultanță cu taxă — introducere după primele 10-20 cazuri gratuite

## 🟢 Prioritate scăzută (viitor)
- [ ] Afiliere furnizori — contactare directă pentru comision per lead
- [ ] PWA (Progressive Web App) — site-ul se poate instala pe telefon
- [ ] Upload PDF factură + analiză automată (OCR)
- [ ] Cont utilizator + istoric facturi (Supabase)
- [ ] Notificări email când se schimbă prețurile
- [ ] Dark mode

## 🔄 Mentenanță recurentă
- [ ] Actualizare prețuri furnizori din POSF (lunar, la început de lună)
- [ ] Actualizare costuri reglementate când se modifică (ANRE, de obicei anual)
- [ ] Verificare TVA dacă se modifică legislativ
- [ ] Adăugare 2-3 articole noi pe lună pentru SEO
- [ ] Răspuns la solicitări din Google Sheets

## ✅ Completat
- [x] Site live pe Vercel (factura-mea.vercel.app)
- [x] Deploy automat GitHub → Vercel
- [x] Calculator funcțional cu tarife reale ANRE
- [x] 50+ furnizori din POSF cu oferte și % verde
- [x] Formular contact → Google Sheets + email notificare
- [x] Meniu mobil funcțional
- [x] 10 articole SEO detaliate
- [x] TVA corectat la 21%
- [x] Costuri reglementate actualizate (TG, TL, CFD etc.)
- [x] Opțiuni avansate în acordeon
- [x] Structură cost în acordeon
- [x] Telefon opțional în formular