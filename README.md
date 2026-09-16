# উদ্ভিদ গোয়েন্দা (Plant Detective)

> AI-powered CABI diagnostic process trainer for Bangladesh farmers — learn crop problem identification through guided steps, interactive games, and hands-on diagnosis.

![Smart Agri EcoSystem](https://img.shields.io/badge/Bangladesh-Extension%20Tool-green)
![Version](https://img.shields.io/badge/version-4.0.0-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-5-purple)
![PWA](https://img.shields.io/badge/PWA-Installable-9cf)
![Security](https://img.shields.io/badge/Security-Hardened-brightgreen)
![Database](https://img.shields.io/badge/DB-Turso%20SQLite-orange)
![Lint](https://img.shields.io/badge/Lint-0%20Errors-success)
![Build](https://img.shields.io/badge/Build-Passing-success)

---

## Overview

**উদ্ভিদ গোয়েন্দা (Plant Detective)** is a mobile-first educational app designed to teach Bangladesh farmers and extension workers the **CABI Plantwise 5-step diagnostic process**. Rather than just giving answers, it trains users to systematically identify crop problems — from symptom observation to IPM decision-making.

The app is production-hardened with zero-trust API security, HMAC request signing, server-side key isolation, and **Turso SQLite** for persistent analytics — with zero Supabase dependencies. The main branch is fully lint-clean (0 errors, 0 warnings) and builds successfully for production deployment.

---

## Key Features

### Learning-Focused Design
- **CABI 5-Step Guide** — Step-by-step read-aloud guide covering the full diagnostic protocol (Observation → Exclusion → Disease Triangle → Confirmation → IPM Decision)
- **5 Interactive Games** — SymptomSpotter, CauseDetective, DiseaseTriangle, FieldScout, IPM Commander — practice each diagnostic step through play
- **Learning Path** — Visual timeline guiding users through Guide → Game → Diagnose progression
- **Read-Aloud TTS** — Bengali text-to-speech accessibility for illiterate farmers (volume icon on every section)

### Smart Diagnosis
- **AI-Powered Identification** — Multi-provider AI waterfall (Gemini 2.5 Flash → OpenRouter Qwen-VL → Groq Llama4 Scout → Gemini text → Emergency fallback) for crop problem diagnosis
- **Image Analysis** — Upload up to 3 photos for AI visual diagnosis with proper preview rendering
- **278 Symptom Images** — Visual reference gallery for pest, disease, and deficiency identification (all stored locally, no external storage dependency)
- **Bangladesh Context** — DAE, BRRI, BARI recommendations; local pesticide brands and dosage
- **Weather-Aware** — Real-time temperature, humidity, rainfall with pest-risk assessment
- **Spraying Conditions** — Wind, UV, and rain-based spray timing guidance
- **AI Copilot** — Floating assistant button available on every page for contextual help

### Modern Mobile-First UI
- **Bottom Navigation** — 4-tab bar (Calendar → Learn → Diagnose → Library) with green active indicator
- **Copilot FAB** — Floating action button for AI assistance accessible across all pages
- **Clean Card Layout** — Soft shadows, rounded corners, neutral background
- **Hero Banner** — Green gradient with floating leaf animations and prominent CTAs
- **Weather Dashboard** — Temperature, humidity, and rainfall metrics in colored cards
- **Crop Calendar** — 12-month planting/harvesting calendar with weather and price comparison
- **Dark Mode** — Full dark theme support with CSS custom properties and design tokens
- **PWA Installable** — Works offline as a native-like app on Android/iOS

### Rich Content Library
- **Video Gallery** — 9 categorized tutorial videos from Google Drive (Introduction, Diagnosis, Management, Pests)
- **YouTube Integration** — @AgriWisdomBd channel embed for Plant Detective playlists
- **CABI Ready Reckoner** — Full ETL (Economic Threshold Level) tables, IPM Pyramid, Nutrient deficiency guide
- **External Apps Hub** — Quick links to Krishi AI, GAP Brinjal, CIRDAP GreenLoop
- **Diagnosis History** — Saved past reports with crop, district, and date tracking

### Engagement Features
- **Award Crests** — Achievement badges for completing each diagnostic game
- **Social Sharing** — Share diagnoses via Facebook, LinkedIn, and more
- **Visitor Analytics** — Usage tracking for improvement insights
- **Feedback System** — User feedback collection with email notification via MailChannels

---

## Security & Architecture

This app follows a **zero-trust security model** — no secrets ever reach the frontend.

| Layer | Implementation |
|-------|---------------|
| **API Key Isolation** | All AI provider keys (Gemini, Groq, OpenRouter) are server-side only. Frontend has zero `VITE_` env vars with secrets. |
| **HMAC Request Signing** | Every API request is signed with an auto-derived HMAC-SHA256 signature. No manual `API_SIGNING_SECRET` needed — derived from Turso credentials. |
| **Admin Auth** | Admin access to `/api/test` is auto-derived from Turso credentials. No manual `ADMIN_SECRET` env var. |
| **CORS Hardening** | Explicit origin allowlist + auto-allow `*.vercel.app` deployments. `X-Request-Signature` in allowed headers. |
| **Rate Limiting** | Built-in per-IP rate limiting on diagnosis endpoint to prevent abuse. |
| **Input Validation** | Message structure validation, image size/count limits, HTML escaping on all user inputs. |
| **Security Headers** | `vercel.json` enforces X-Content-Type-Options, X-Frame-Options, Referrer-Policy, and Content-Security-Policy. |

---

## Bangladesh Coverage

| Feature | Details |
|---------|---------|
| **Crops** | 100+ varieties across 10 categories (Rice, Jute, Potato, Tomato, Brinjal, Mustard, Banana, Mango, Wheat, Maize) |
| **Diseases** | 200+ crop diseases with symptom descriptions and treatment recommendations |
| **Districts** | 25+ Bangladesh districts with local context |
| **Seasons** | Boro, Aman, Aus, Rabi, Kharif-1, Kharif-2 |
| **Pesticides** | 72+ DAE-approved products with local brand names |
| **Symptom Images** | 278 locally-hosted diagnostic reference images |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite 5 (single-file architecture with lazy-loaded games) |
| **AI Providers** | Google Gemini 2.5 Flash → OpenRouter → Groq (multi-provider fallback waterfall) |
| **Database** | Turso SQLite (libSQL) — 9GB free, 1B reads/month, no pausing |
| **Security** | HMAC-SHA256 request signing, auto-derived secrets |
| **Styling** | Inline CSS-in-JS with design tokens + CSS custom properties (dark mode support) |
| **Fonts** | Noto Sans Bengali, Plus Jakarta Sans, Inter (Google Fonts) |
| **TTS** | Web Speech API (bn-BD) with custom rate/pitch tuning |
| **PWA** | Service Worker (network-first for API) + Web App Manifest |
| **Deployment** | Vercel with serverless API proxy |
| **Lint** | ESLint 10 + React Hooks plugin — 0 errors, 0 warnings |
| **Formatting** | Prettier — consistent code style |

---

## Project Structure

```
cabi-diagnosis/
├── src/
│   ├── App.jsx                         # Main app (all tabs, navigation, diagnosis flow)
│   ├── main.jsx                        # React entry point with Error Boundary
│   ├── components/
│   │   ├── CropCalendar.jsx            # 12-month crop calendar view
│   │   ├── CropCalendarDashboard.jsx   # Calendar + weather + price comparison
│   │   ├── OnboardingFlow.jsx          # First-use onboarding wizard
│   │   └── OutbreakList.jsx            # Disease outbreak heatmap & list
│   ├── games/
│   │   ├── SymptomSpotter.jsx          # Game: Match symptoms to causes
│   │   ├── CauseDetective.jsx          # Game: Identify biotic vs abiotic
│   │   ├── DiseaseTriangle.jsx         # Game: Disease triangle analysis
│   │   ├── FieldScout.jsx              # Game: Field diagnosis practice
│   │   ├── IPMCommander.jsx            # Game: IPM decision making
│   │   ├── SymptomImageGallery.jsx     # Shared image gallery component
│   │   ├── useTTS.js                   # Custom text-to-speech hook
│   │   └── imageMap.js                 # 278 symptom image mappings
│   ├── data/
│   │   ├── cropCalendar.js             # 12-month crop season data
│   │   ├── cropDiseases.js             # 200+ disease database
│   │   ├── cropPriceService.js         # Simulated price engine with trends
│   │   ├── weatherService.js           # Weather API + disease pressure scoring
│   │   ├── enhancedCropCalendar.js     # Calendar + weather + price integration
│   │   ├── agronomicEngine.js          # Agronomic decision support
│   │   ├── bangladeshDistricts.js      # District geo data
│   │   ├── bengaliKeywords.js          # Bengali NLP keyword mapping
│   │   └── themes.js                   # Dark/light theme tokens
│   └── offline/
│       ├── index.js                    # Offline diagnosis engine
│       ├── diagnosticEngine.js         # Rule-based diagnostic logic
│       └── OfflineDiagnosis.jsx        # Offline UI component
├── public/
│   ├── images/                         # 278 diagnostic symptom images (local)
│   ├── manifest.json                   # PWA manifest
│   ├── sw.js                           # Service worker (network-first for /api/*)
│   ├── pesticides.json                 # DAE-approved pesticide database
│   ├── cabi-logo.jpg                   # CABI branding asset
│   ├── privacy-policy.html             # Play Store privacy policy
│   ├── robots.txt                      # Search engine directives
│   └── favicon.png                     # App icon
├── api/                                # Vercel serverless functions
│   ├── _lib/
│   │   ├── turso.js                    # Turso SQLite client + schema auto-init
│   │   ├── requestSigning.js           # HMAC-SHA256 auto-derived signing
│   │   ├── cors.js                     # Hardened CORS with origin allowlist
│   │   ├── rateLimit.js                # Per-IP rate limiting
│   │   ├── validation.js              # Input sanitization & limits
│   │   └── htmlEscape.js              # HTML entity escaping
│   ├── diagnose.js                     # AI diagnosis proxy (multi-provider waterfall)
│   ├── diagnoses.js                    # Diagnosis history CRUD (Turso)
│   ├── analytics.js                    # Usage tracking (Turso)
│   ├── feedback.js                     # User feedback + email (Turso + MailChannels)
│   ├── presence.js                     # Online presence heartbeat (Turso)
│   ├── storage.js                      # File metadata storage (Turso)
│   ├── dashboard.js                    # Live analytics dashboard (Turso)
│   ├── outbreaks.js                    # Outbreak data endpoint
│   ├── crop-prices.js                  # Crop price data endpoint
│   ├── weather.js                      # Weather proxy endpoint
│   ├── health.js                       # Health check endpoint
│   ├── signing-token.js                # Request signing token generation
│   └── test.js                         # Admin test endpoint (auto-derived auth)
├── setup-vercel-env.sh                 # One-command Vercel env var setup
├── vercel.json                         # Deployment config + security headers
├── .env.example                        # Environment variable reference
├── eslint.config.js                    # ESLint flat config with JSX support
├── index.html
├── package.json
└── vite.config.js
```

---

## Getting Started

**Prerequisites:** Node.js 18+

```bash
# Clone the repo
git clone https://github.com/moniruzjaman/cabi-diagnosis.git
cd cabi-diagnosis

# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Auto-fix lint issues
npm run lint:fix
```

Open [http://localhost:5173](http://localhost:5173)

---

## Environment Variables

All sensitive operations are server-side. The frontend has **zero secret env vars**. Only 5 variables are required:

| Variable | Required | Purpose |
|----------|----------|---------|
| `GEMINI_API_KEY` | Yes* | Google Gemini AI provider |
| `GROQ_API_KEY` | Yes* | Groq AI provider |
| `OPENROUTER_API_KEY` | Yes* | OpenRouter AI provider |
| `TURSO_DATABASE_URL` | Recommended | Turso SQLite database URL (enables analytics) |
| `TURSO_AUTH_TOKEN` | Recommended | Turso auth token |

\* At least one AI provider key is required for diagnosis to work.

**Auto-configured (no manual setup):**
- Request signing secret — auto-derived from Turso credentials via HMAC-SHA256
- Admin secret — auto-derived from Turso credentials
- CORS origins — `*.vercel.app` auto-allowed

**Quick setup:** Run `bash setup-vercel-env.sh` to configure all Vercel env vars interactively.

### Turso Database Setup (Free)

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Create database
turso db create cabi-diagnosis

# Get connection URL
turso db show cabi-diagnosis --url

# Create auth token
turso db tokens create cabi-diagnosis
```

Tables are auto-created on first API call — no manual migrations needed.

---

## Install as App

The app is PWA-enabled. On Android Chrome:
1. Open the app URL
2. Tap "Add to Home Screen" from the browser menu
3. The app installs as a native-like experience

---

## Deploy to Vercel

```bash
# Option 1: Connect GitHub repo at vercel.com
# Option 2: Quick env setup
bash setup-vercel-env.sh

# Then push to main — Vercel auto-deploys
```

**Vercel:** Connect your GitHub repo at [vercel.com](https://vercel.com)

---

## Tab Navigation

| Tab | Bangla | Icon | Purpose |
|-----|--------|------|---------|
| Crop Calendar | ক্যালেন্ডার | Calendar | 12-month planting/harvesting calendar with weather + price comparison |
| Learn | শিখুন | Book | CABI 5-Step Guide + 5 interactive games hub |
| Diagnose | নির্ণয় | Microscope | AI-powered crop problem identification with image analysis |
| Library | ভান্ডার | Books | Videos, slides, readings, apps hub, diagnosis history |
| Copilot | — | FAB | Floating AI assistant available on every page |

---

## Changelog

### v4.0.0 — Production Hardening & Turso Migration
- Replaced Supabase with Turso SQLite — no more quota limits, no more project pausing, generous free tier (9GB storage, 1B reads/month)
- Completely removed all Supabase dependencies, configs, and references — zero Supabase in codebase
- Zero-trust API security — HMAC-SHA256 request signing, no frontend secrets
- Auto-derived secrets — `API_SIGNING_SECRET` and `ADMIN_SECRET` eliminated, derived from Turso credentials
- Hardened CORS — explicit origin allowlist, auto-allow `*.vercel.app` deployments
- Fixed diagnosis image preview — data URL persistence, proper CSS sizing, error handling
- Rate limiting — per-IP rate limiting on diagnosis endpoint
- Input validation — message structure validation, image size/count limits, HTML escaping
- Persistent analytics — visit tracking, section events, online presence via Turso
- Simplified deployment — 5 env vars (down from 7+), one-command Vercel setup script
- Rearranged tab navigation — Calendar → Learn → Diagnose → Library; Copilot as floating FAB
- Production-grade lint — 0 errors, 0 warnings (ESLint 10 + React Hooks plugin)
- Dark mode — full theme support with CSS custom properties and design tokens
- 278 locally-hosted symptom images — no external storage dependency

### v3.0 — AI Rewrite
- Multi-provider AI waterfall (Gemini → Groq → OpenRouter)
- Vercel serverless API proxy (hides API keys server-side)
- Real-time weather + GPS/IP location with pest-risk engine
- Voice input (Web Speech API) + read-aloud (TTS) accessibility

### v2.0 — UI Overhaul
- Plantix-inspired tabbed navigation
- Bangladesh pesticide dataset (72 DAE-approved products)
- 5 CABI protocol games + Game Hub
- PWA install support + social sharing

### v1.0 — Initial Release
- Basic Gemini-powered diagnosis
- CABI 5-step guide
- Symptom image gallery

---

## Credits

**Supported by:** CABI Plantwise · DAE Bangladesh · BRRI · BARI
**Built with:** React · Vite · Turso SQLite · Gemini AI · Google Fonts
**YouTube:** [@AgriWisdomBd](https://youtube.com/@AgriWisdomBd)

---

## License

MIT License — see [LICENSE](LICENSE) for details.
