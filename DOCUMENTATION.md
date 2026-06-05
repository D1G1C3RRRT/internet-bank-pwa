# Internet Bank PWA - Technická Dokumentácia

Moderná, vysoko výkonná Progressive Web App (PWA) s prvkami prémiového fintech dizajnu (inšpirovaná bunq).

---

## 🏗️ Technologický Stoh (Tech Stack)

* **Framework**: Next.js 16 (React 19, TypeScript, Turbopack)
* **Štýlovanie**: Tailwind CSS (Vanilla CSS pre hlavnú štruktúru)
* **Databáza**: PostgreSQL (kompatibilný s Neon/Local PG)
* **ORM**: Drizzle ORM
* **Autentifikácia**: Better Auth + Passkey (WebAuthn)
* **Ikony**: Lucide React
* **Stavový Manažment**: Zustand
* **Spustenie**: Predvolený port **`4444`** na lokálnom počítači.

---

## 📂 Štruktúra a Moduly Projektu

```
├── app/
│   ├── api/auth/[...all]/          # Better Auth koncové body
│   ├── dashboard/                   # Hlavný chránený dashboard
│   │   ├── cards/                   # Správa platobných kariet
│   │   ├── savings/                 # Sporenie a ciele
│   │   ├── stocks/                  # Demohodnoty akciového trhu
│   │   ├── crypto/                  # Demohodnoty kryptomien
│   │   └── settings/                # Nastavenia profilu a biometrie
│   ├── actions/                     # Server Actions pre backend operácie
│   │   ├── banking.ts               # Bežné bankové účty, prevody a vklady
│   │   ├── cards.ts                 # Vytvorenie a správa kariet
│   │   ├── savings.ts               # Spravovanie cieľov sporenia
│   │   ├── stocks.ts                # Obchodovanie s akciami (simulácia)
│   │   └── crypto.ts                # Obchodovanie s krypto (simulácia)
│   ├── layout.tsx                   # Hlavný layout (registrácia SW a meta tagy)
│   └── page.tsx                     # Landing/Welcome stránka
├── components/
│   ├── auth-form.tsx                # Prihlasovací/Registračný formulár
│   ├── biometric-setup.tsx          # Správa FaceID/TouchID kľúčov (Passkeys)
│   ├── card-controls.tsx            # Nastavenia a bezpečnostné prepínače karty
│   ├── card-visual.tsx              # Render vizuálu karty (Mastercard/Visa)
│   └── dashboard-header.tsx         # Globálna hlavička s PWA navigáciou
├── lib/
│   ├── auth.ts                      # Konfigurácia Better Auth (Server-side)
│   ├── auth-client.ts               # Klientsky Better Auth SDK wrapper
│   └── db/
│       ├── index.ts                 # Inicializácia Drizzle klienta
│       └── schema.ts                # Definovanie SQL tabuliek
```

---

## 🔒 Autentifikácia & Biometria (Passkeys)

Aplikácia využíva moderné bezheslové prihlasovanie typu **Passkeys / WebAuthn** integrované cez Better Auth.
* **Biometrické nastavenie**: V `components/biometric-setup.tsx` si užívateľ môže zaregistrovať FaceID, TouchID, Windows Hello alebo fyzický USB kľúč.
* **Kľúče v DB**: Po úspešnom biometrickom podpise na klientskom zariadení sa verejný kľúč (`publicKey`, `credentialID`) zapíše do tabuľky `passkey`.
* **Prihlásenie**: Pri ďalšej návšteve sa stačí prihlásiť jedným kliknutím cez TouchID/FaceID.

---

## 🌍 Lokalizácia (Slovenský Jazyk)

Aplikácia podporuje dva jazyky: **Slovenčinu (`sk`)** a **Angličtinu (`en`)**.
* **Predvolený jazyk**: **Slovenčina (`sk`)**. Ak v cookies neexistuje nastavenie `lang`, aplikácia automaticky nabehne v slovenčine.
* **Mechanizmus**: Uložený v cookie `lang`. Čítaný na serveri (`cookies().get('lang')`) pre SSR lokalizáciu a na klientovi pre prepínanie prvkov.
* **Formáty**: Všetky číselné hodnoty, meny a dátumy sú formátované podľa slovenskej normy (napr. `1 250,50 €` namiesto `$1,250.50` a dátumy `5. 6. 2026`).

---

## 💳 Modul Platobných Kariet (Cards)

Jedna z najpokročilejších častí aplikácie. Umožňuje plnú správu kariet s vysokým dôrazom na bezpečnosť a UX.

### Databázová Schéma (`paymentCard`):
* `dailyLimit`: Denný limit transakcií (predvolene `500.00 €`).
* `monthlyLimit`: Mesačný limit transakcií (predvolene `3000.00 €`).
* `allowContactless`: Bezpečnostný prepínač pre bezkontaktné platby.
* `allowOnlinePayments`: Prepínač pre internetové platby (e-shopy).
* `allowInternational`: Prepínač pre platby v zahraničí (mimo SR).

### Serverové Akcie (`app/actions/cards.ts`):
* `updateCardDailyLimit(cardId, dailyLimit)`: Aktualizuje denný limit a zapíše zmenu do histórie karty.
* `updateCardMonthlyLimit(cardId, monthlyLimit)`: Aktualizuje mesačný limit karty.
* `toggleCardContactless(cardId, allowed)`: Zapína/Vypína platby priložením.
* `toggleCardOnlinePayments(cardId, allowed)`: Zapína/Vypína platby na internete.
* `toggleCardInternational(cardId, allowed)`: Zapína/Vypína platby v cudzine.

### UI Ovládanie (`components/card-controls.tsx`):
Obsahuje interaktívny formulár na zmenu oboch typov limitov a tri štýlové prepínače pre bezpečnosť. Prepínače používajú farbu **`#670884`** (fialová farba značky bunq).

---

## 📈 Investičné Moduly (Stocks & Crypto)

Demoverzie akciového a krypto trhu.
* **Priemerná cena (Average Price)**: Pri opakovanom nákupe rovnakého symbolu (napr. BTC, AAPL) backend správne prepočítava váženú priemernú cenu nákupu (`averagePrice`), takže užívateľ presne vidí svoj zisk/stratu (P&L).
* **História obchodov**: Všetky nákupy a predaje sa ukladajú do tabuliek `stock_trade` / `crypto_trade` a zobrazujú sa v histórii transakcií na danom module.

---

## 🎯 Sporenie (Savings Goals)

Užívatelia si môžu definovať sporiace ciele (napr. "Nové auto" s cieľovou sumou `5 000 €`).
* **Progress Bar**: Grafický ukazovateľ zobrazuje percentuálny stav naplnenia cieľa.
* **Pohyby**: Užívateľ vie jednoducho presúvať financie z bežného účtu do sporenia a naopak.

---

## 🛠️ Príručka pre Vývojára (Dev Operations)

### Konfigurácia Portu (Port 4444)
V súbore [package.json](file:///Users/erikbabcan/internet-bank-pwa/internet-bank-pwa/package.json) sú nakonfigurované skripty tak, aby Next.js server bežal na porte **`4444`**:
```json
"dev": "next dev -p 4444",
"start": "next start -p 4444"
```
Uistite sa, že váš `.env.local` obsahuje `BETTER_AUTH_URL=http://localhost:4444` pre správne fungovanie prihlasovania cez Passkeys.

### Spustenie Migrácií
Ak zmeníte schému v `lib/db/schema.ts`, aplikujte zmeny do databázy príkazom:
```bash
npm run db:push
```

### Spustenie Aplikácie v Vývojovom Režime
```bash
npm run dev
```
Aplikácia bude dostupná na adrese `http://localhost:4444`.
