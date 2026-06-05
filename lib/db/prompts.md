# 🚀 Ultimátne Prompty pre Internet Bank PWA

Tieto prompty sú pripravené na mieru pre náš aktuálny stack (Next.js 16.2 App Router, React 19, Drizzle ORM, Postgres, Zustand, Tailwind, shadcn/ui) a obsahujú výhradne funkcie, ktoré sme **ešte neimplementovali**.

Stačí mi zadať číslo promptu a okamžite začnem s jeho realizáciou!

---

### 1️⃣ PROMPT: AI BANKÁR A CHAT ROZHRANIE
**Cieľ:** Vytvoriť inteligentného asistenta priamo v aplikácii.
**Zadanie pre AI:**
> Vytvor pokročilé rozhranie AI bankára do `app/dashboard/page.tsx` alebo ako globálny chatovací widget. Implementuj real-time streaming odpovedí cez Next.js Edge API routes. Asistent by mal vedieť analyzovať históriu transakcií užívateľa, poskytovať investičné rady (krypto, akcie) a odpovedať na otázky o zostatku či limitoch kariet. Bezpodmienečne ošetri maskovanie citlivých údajov (napr. reálne zostatky, IBAN) predtým, než pošleš kontext do LLM modelu. Na UI použi shadcn/ui komponenty.

### 2️⃣ PROMPT: SÉMANTICKÉ VYHĽADÁVANIE (SMART SEARCH)
**Cieľ:** Inteligentné vyhľadávanie v histórii transakcií a portfóliu.
**Zadanie pre AI:**
> Vytvor globálnu komponentu `SearchBox`, ktorá dokáže spracovať vyhľadávanie v prirodzenom jazyku (napr. "platby za kávu minulý mesiac", "nákup Bitcoinu"). Použi Next.js Server Actions a Drizzle ORM pre komplexné dotazy nad tabuľkami `transaction`, `crypto_trade` a `stock_trade`. Pridaj debouncing (500ms) cez React Hooks a vybuduj UI s plynulým načítaním výsledkov. Pridaj aj možnosť multi-parametrovej filtrácie (suma, dátum, mena).

### 3️⃣ PROMPT: PUSH NOTIFIKÁCIE A CENOVÉ UPOZORNENIA
**Cieľ:** Informovať užívateľa o zmenách a pohyboch v reálnom čase.
**Zadanie pre AI:**
> Implementuj Web Push API notifikácie do nášho Service Workera (`public/service-worker.js`). Zameraj sa na background synchronizáciu a notifikácie pre: 1. prichádzajúce platby, 2. splnenie cieľa v `savings_goal`, 3. cenové upozornenia pre krypto a akcie (Price Alerts). Vytvor Backend API route na registráciu Push Subscription do databázy a do nastavení pridaj UI na správu týchto notifikácií.

### 4️⃣ PROMPT: ZDIEĽANÉ ÚČTY A REAL-TIME KOLABORÁCIA
**Cieľ:** Podpora spoločných financií pre partnerov a rodiny.
**Zadanie pre AI:**
> Rozšír našu Drizzle schému (`lib/db/schema.ts`) o prepojovaciu tabuľku `shared_account_access`, ktorá umožní viacerým užívateľom pristupovať k spoločnému `bankAccount` alebo `savingsGoal`. Následne implementuj Server-Sent Events (SSE) v Next.js API, aby sa zostatky a nové transakcie na zdieľanom účte okamžite (real-time) aktualizovali u oboch prihlásených užívateľov. Pri transakcii jasne graficky odlíš, ktorý z užívateľov ju vykonal.

### 5️⃣ PROMPT: POKROČILÁ VIZUALIZÁCIA PORTFÓLIA (DATA VIZ)
**Cieľ:** Profesionálne grafy pre komplexný prehľad majetku.
**Zadanie pre AI:**
> Prepoj zostatky z účtov (`bank_account`), sporení (`savings_goal`), akcií (`stock_position`) a kryptomien (`crypto_holding`) do jedného interaktívneho analytického panelu v Dashboarde. Integruj knižnicu Recharts a vytvor interaktívny koláčový graf distribúcie majetku a spojnicový graf vývoja celkového čistého imania (Net Worth) v čase. Grafy musia podporovať náš Tailwind dark mode a obsahovať plynulé animácie pri načítaní dát.

### 6️⃣ PROMPT: HLASOVÉ OVLÁDANIE (VOICE UI)
**Cieľ:** Bezbariérový prístup a rýchle zadávanie platieb.
**Zadanie pre AI:**
> Integruj Web Speech API priamo do aplikácie (napr. nové tlačidlo v `components/mobile-bottom-nav.tsx`). Rozhranie musí aktívne počúvať a rozpoznať hlasové príkazy ako "Zobraz stav účtu", "Pošli 50 eur Jankovi" alebo "Kúp akcie Tesly za 100 eur". Následne text zanalyzuj, otvor predvyplnený transakčný formulár (`transfer-form.tsx` alebo `stock-trade-form.tsx`) a čakaj na finálne biometrické potvrdenie od užívateľa pred vykonaním Server Action.

### 7️⃣ PROMPT: VYDÁVANIE A KOMPLEXNÁ SPRÁVA KARIET
**Cieľ:** Plná kontrola nad fyzickými aj virtuálnymi kartami.
**Zadanie pre AI:**
> Dopracuj logiku v `app/actions/cards.ts` a UI v `app/dashboard/cards`. Vytvor interaktívne UI pre okamžité vydanie jednorazovej virtuálnej karty s pekným 3D/CSS vizuálom. Pridaj možnosť kartu zmraziť (nastaviť status 'frozen' v `payment_card` tabuľke), okamžite zmeniť denný limit (cez slider s okamžitým zápisom) a zobraziť CVV kód karty len po opätovnej biometrickej autentifikácii (odozva na `@better-auth/passkey`).

### 8️⃣ PROMPT: SECURITY HARDENING A AUDIT LOGS (PCI-DSS)
**Cieľ:** Ochrana financií na úrovni bankových štandardov.
**Zadanie pre AI:**
> Pridaj striktné Content-Security-Policy (CSP) pravidlá a Security hlavičky do Next.js middleware. Vytvor úplne novú tabuľku `audit_logs` v Drizzle ORM na prísne sledovanie každej kritickej akcie (prihlásenie z novej IP, zmena hesla, vytvorenie platby nad 1000 EUR). Zabezpeč Rate Limiting v Next.js pre API endpointy (max 5 pokusov o prihlásenie za 15 minút). Ošetri aplikáciu proti bežným XSS a CSRF zraniteľnostiam.

### 9️⃣ PROMPT: NATIVNÝ PWA FEELING A WEB SHARE API
**Cieľ:** Aby PWA pôsobila ako skutočná natívna aplikácia z App Store.
**Zadanie pre AI:**
> Zabezpeč generovanie vizuálne atraktívnych PDF potvrdení o transakciách a implementuj ich priame zdieľanie (napr. na WhatsApp/iMessage) pomocou Web Share API. Optimalizuj `public/manifest.json` pre natívne mobilné prechody a pridaj iOS splash screeny. Implementuj zachytávanie URL adries (Deep Linking), aby napr. kliknutie na platobný QR odkaz otvorilo priamo PWA formulár a skrylo zbytočné UI prvky prehliadača (standalone mode).

### 🔟 PROMPT: AI GENERÁTOR REALISTICKÝCH DÁT (SEED SCRIPT)
**Cieľ:** Automatizácia lokálneho vývoja bez potreby manuálneho vypĺňania.
**Zadanie pre AI:**
> Vytvor komplexný TypeScript Drizzle seed skript (`scripts/seed.ts`), ktorý pomocou knižnice faker nageneruje rozsiahlu a realistickú bankovú históriu. Skript vytvorí testovacieho užívateľa, pridelí mu 2 účty, vygeneruje 50 logicky nadväzujúcich transakcií (kladné aj záporné), pridá 3 sporenia a nasimuluje akciové/krypto portfólio. Dáta musia byť matematicky konzistentné (súčet všetkých transakcií musí presne zodpovedať aktuálnemu zostatku na účte).
