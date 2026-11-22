# Branvidia — AI-Powered Google Business Profile Optimization Platform

> **Editorial Business Intelligence Platform for Local Google Business Profile Auditing & Growth Strategy**

Branvidia is an enterprise-grade, customer-facing AI platform that guides business owners through an intuitive 10-step lifecycle to analyze, diagnose, score, and optimize their Google Business Profile (GBP) presence.

Built with **Next.js 15 (App Router)**, **TypeScript 5**, **Tailwind CSS**, and **Groq Cloud** (`openai/gpt-oss-20b`).

Live Deployment: [https://gbp-rust.vercel.app/](https://gbp-rust.vercel.app/)  
Source Repository: [https://github.com/Kushal-ctrl-del/GPB-branvidia](https://github.com/Kushal-ctrl-del/GPB-branvidia)

---

## 🌟 Key Capabilities & Architectural Pillars

- **Conversational AI Onboarding:** Guided AI Business Advisor collects business identity, services, and operational goals naturally through interactive dialogue without redundant form fields.
- **Single Source of Truth & Identity Preservation:** Customer brand name, location, and service categories are preserved throughout all downstream screens and are never overwritten by demo fixtures.
- **Three Isolated Integration Modes:**
  1. **Direct Customer Asset Workspace:** Upload business photos (with preview, category tagging, and removal) and customer-supplied reviews (manual entry or CSV import).
  2. **Category-Aware Simulated GBP Demo:** Dynamically generates industry-tailored demo profiles, reviews, and photo inventories (e.g., Dental Clinic, Clothing Store, Café) while preserving the customer's actual business identity.
  3. **Live Google Business Profile Integration:** Secure OAuth 2.0 with RFC 7636 PKCE targeting Google Business Profile API endpoints with granular scope disclosures.
- **Review Data Integrity & Zero-Review Normalization:** Zero reviews are handled neutrally without score penalties or fake review generation. Scores are mathematically normalized across Completeness (35), Media (20), and Local SEO (15).
- **Deterministic 100-Point Scoring Engine:** Numerical scoring is 100% mathematical and strictly independent of the LLM. The calculated score is fed to the AI engine for qualitative reasoning.
- **Transparent AI Synthesis & Fallback Labeling:** Powered by Groq Cloud (`openai/gpt-oss-20b`). If rate limits occur or schema validation fails, the platform activates a deterministic rule-based fallback and explicitly labels the report as `DETERMINISTIC_FALLBACK` (never falsely claiming AI analysis succeeded).
- **Offline Review Reply Draft Policy:** Actionable suggested replies are generated for unreplied reviews as drafts with tone rationale, 1-click clipboard copy, and inline editing. Never auto-posted to Google.
- **Browser-Local Audit History:** Instant switching between generated audit reports stored in local browser storage (`localStorage`), with print-optimized PDF formatting.

---

## 🔒 Security & OAuth Hardening Architecture

### 1. Mandatory `SESSION_SECRET` (Fail-Closed)
- `lib/security/oauth-state.ts` enforces that `SESSION_SECRET` is defined in environment variables and is at least 32 characters long.
- **Fails Closed:** The system never falls back to predictable hardcoded keys. If missing or invalid, all cryptographic operations abort safely and return a sanitized 500 error without leaking server secrets.

### 2. RFC 7636 PKCE Implementation
- **Code Verifier:** Generated using 32 cryptographically secure random bytes (`crypto.randomBytes(32)`), encoded as a 43-character `base64url` string.
- **Code Challenge:** Generated via SHA-256 hash of the code verifier, `base64url`-encoded using method `S256`.
- **Storage:** Code verifier is stored temporarily in an `HttpOnly`, `SameSite=Lax`, `Secure` (in production) cookie (`oauth_code_verifier`) with a 15-minute expiration.
- **Validation:** Sent during the token exchange to `https://oauth2.googleapis.com/token`. Both PKCE and HMAC-signed CSRF state parameters are enforced.

### 3. Token Lifecycle & AES-256-GCM Session Encryption
- Access tokens and refresh tokens are encrypted at rest using **AES-256-GCM** with a key derived from `SESSION_SECRET` before being written to the `gbp_session` HttpOnly cookie.
- **Automatic Token Refresh:** The `lib/security/token-manager.ts` module inspects token expiry before API calls. If the access token expires in less than 60 seconds (or has expired) and a refresh token is present, it automatically requests a fresh access token from Google, re-encrypts the session, and updates the session cookie.
- **Revocation Handling:** If a refresh token is revoked or invalid (`invalid_grant`), the session is cleared and a clean `401 UNAUTHENTICATED` status is returned.
- **Zero Client Exposure:** Tokens are never exposed to browser JavaScript or client bundles.

### 4. Read-Only Audit Assurance & Scope Disclosure
- **Scope Requested:** `https://www.googleapis.com/auth/business.manage` (Google's standard scope for Business Profile APIs).
- **Scope Disclosure:** Before authorization, users are explicitly informed that while Google's permission name reflects management authority, **Branvidia operates strictly in Read-Only Audit Mode**.
- **No Mutating Calls:** The platform never edits business hours, alters addresses, or auto-posts reviews. Zero `POST`/`PUT`/`PATCH`/`DELETE` endpoints to GBP exist in the codebase.

---

## 🗺️ The 10-Step Customer Journey

```
 ┌─────────────┐     ┌──────────────┐     ┌───────────────┐     ┌───────────────┐
 │   Step 1    │     │    Step 2    │     │    Step 3     │     │    Step 4     │
 │   Landing   ├────►│ Conversational├────►│ Identity Card ├────►│  Integration  │
 │  Editorial  │     │  Onboarding  │     │ Confirmation  │     │   Selection   │
 └─────────────┘     └──────────────┘     └───────────────┘     └───────┬───────┘
                                                                        │
 ┌─────────────┐     ┌──────────────┐     ┌───────────────┐     ┌───────▼───────┐
 │   Step 8    │     │    Step 7    │     │    Step 6     │     │    Step 5     │
 │ Review & Pic│◄────┤  AI Analysis ├◄────┤ Data Layer &  │◄────┤   Connected   │
 │ Deep Audit  │     │  Pipeline    │     │ Asset Storage │     │ Confirmation  │
 └──────┬──────┘     └──────────────┘     └───────────────┘     └───────────────┘
        │
 ┌──────▼──────┐     ┌──────────────┐
 │   Step 9    │     │   Step 10    │
 │ Scoring &   ├────►│ Comprehensive│
 │ Gap Engine  │     │  AI Dossier  │
 └─────────────┘     └──────────────┘
```

| Step | Stage | Description |
|:---:|:---|:---|
| **1** | **Customer Visits Website** | Premium editorial landing page establishing Branvidia's business value and methodology. |
| **2** | **Conversational Discovery** | Conversational onboarding powered by Groq streaming API with incremental structured extraction. |
| **3** | **Business Identity Review** | Interactive verification card to review and edit extracted business attributes (Name, Category, Services, Audience, Goals). |
| **4** | **Data Connection Choice** | Scope disclosure & consent: Direct Asset Workspace, Category-Aware Demo Data, or Live Google OAuth. |
| **5** | **Profile Ingested** | Handshake confirmation displaying verified business identity, key metrics, and initial profile gaps. |
| **6** | **Profile Ingestion & Assets** | Deep-dive profile dashboard across 4 tabs: Overview, Profile Metadata, Review Management, Photo Inventory. |
| **7** | **AI Analysis Engine Running** | Animated progress tracking: metadata audit, review sentiment, photo inventory, scoring, and AI synthesis. |
| **8** | **Reviews & Media Audit** | Sentiment synthesis of customer feedback and metadata-based media coverage check. |
| **9** | **Problems & Suggestions Engine** | Deterministic 100-point scoring algorithm across 4 weighted dimensions with evidence source citations. |
| **10** | **Comprehensive AI Report** | Final executive intelligence dossier presenting all 8 mandatory report sections, report history drawer, and PDF print export. |

---

## 📊 8 Mandatory Audit Report Sections

1. **Business Profile Overview & Executive Summary:** Operational status, audited assets summary, and verified data constraints.
2. **Google Business Profile Review:** Overall profile health, 35-point completeness breakdown, and critical missing fields.
3. **Customer Review Insights:** Star rating breakdown, response rate vs. benchmark (80%), praised aspects, and friction points (omitted neutrally if zero reviews exist).
4. **Photo Insights (Tier 1 Metadata & Inventory Audit):** Categorical inventory (`COVER`, `PROFILE`, `INTERIOR`, `EXTERIOR`, `PRODUCT`, `TEAM`) and coverage gaps. Evaluates resolution and categories only; never claims visual image understanding.
5. **Problems Identified & Friction Analysis:** Prioritized issue inventory classified by severity (`CRITICAL`, `WARNING`, `OPTIMIZATION`) with source evidence citations.
6. **Strategic AI Optimization Suggestions:** Actionable recommendations prioritized by timeline (`IMMEDIATE`, `SHORT_TERM`, `LONG_TERM`) with effort/impact assessment.
7. **Suggested Customer Review Replies:** Interactive reply generator drafting responses for unreplied reviews with tone rationale (Grateful, Empathetic, Professional, Apologetic) and 1-click clipboard copy.
8. **Actionable 30-Day Execution Roadmap:** Sequential implementation roadmap assigned by role (Business Owner, Marketing Team, Customer Service).

---

## 🏷️ Data Provenance Taxonomy

To ensure complete transparency, every dataset throughout the application is labeled with its authoritative source:

| Provenance Tag | Source Description | UI Representation |
|:---|:---|:---|
| `LIVE_GOOGLE` | Directly retrieved from authorized Google Business Profile APIs via OAuth 2.0. | Green "Live Google" badge with active connection indicator. |
| `CUSTOMER_PROVIDED` | Manually entered or CSV-imported by the business owner. | Blue "Owner Provided" badge. |
| `CUSTOMER_UPLOADED` | Photos uploaded directly by the user during asset intake. | Blue "Uploaded Media" tag with resolution and file size. |
| `SIMULATED_DEMO` | Demonstration fixtures tailored to business category. | Purple "Demo Profile (Simulated GBP Data)" badge. |
| `AI_GENERATED` | Qualitative synthesis produced by Groq Cloud (`openai/gpt-oss-20b`). | Emerald "AI Synthesized" indicator with model tag. |
| `DETERMINISTIC` | Mathematical scoring calculated by TypeScript application logic. | Slate "Deterministic Calculation" badge with formula breakdown. |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node 20+ and Node 24)
- npm or pnpm
- Groq Cloud API Key ([console.groq.com/keys](https://console.groq.com/keys))

### Installation
```bash
# 1. Clone repository
git clone https://github.com/Kushal-ctrl-del/GPB-branvidia.git
cd GPB-branvidia

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
```

### Environment Variables Reference
Open `.env.local` and configure your credentials:

```env
# ------------------------------------------------------------------------------
# 1. AI PROVIDER (Groq Cloud) - MANDATORY for conversational AI
# ------------------------------------------------------------------------------
GROQ_API_KEY=gsk_your_actual_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-20b

# ------------------------------------------------------------------------------
# 2. SECURITY & ENCRYPTION - MANDATORY (FAILS CLOSED)
# ------------------------------------------------------------------------------
# Generate via: openssl rand -base64 32
SESSION_SECRET=your_secure_random_session_secret_at_least_32_characters

# Base URL for OAuth redirects
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ------------------------------------------------------------------------------
# 3. GOOGLE OAUTH & GBP API (Optional for Demo & Customer Modes)
# ------------------------------------------------------------------------------
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

### Google Cloud Project Setup (For Live Mode)
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the following APIs:
   - **Google Business Profile Account Management API** (`mybusinessaccountmanagement.googleapis.com`)
   - **Google Business Information API** (`mybusinessbusinessinformation.googleapis.com`)
   - **My Business API v4** (`mybusiness.googleapis.com`)
3. In **APIs & Services > Credentials**, create an **OAuth 2.0 Client ID** (Web Application).
4. Add Authorized Redirect URI: `http://localhost:3000/api/auth/google/callback` (and your production domain).
5. In **OAuth Consent Screen**, add scope `https://www.googleapis.com/auth/business.manage`.

---

## 🧪 Testing & Verification

```bash
# 1. TypeScript static type check (0 errors)
npx tsc --noEmit

# 2. Production build compilation
npm run build

# 3. Security, PKCE, token refresh, and read-only audit test suite
node --experimental-strip-types scratch/test-production-remediation.js

# 4. Customer asset uploads, reviews, and zero-review normalization test
node scratch/test-asset-and-review-expansion.js

# 5. Industry category fixtures test (Clothing, Dental Clinic, Cafe)
node scratch/test-three-industries.js
```

---

## 📁 Repository Structure

```
GPB-branvidia/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts        # POST: Scoring + Groq synthesis with defensive clamping
│   │   ├── auth/disconnect/route.ts# POST: Session & OAuth cookie cleanup
│   │   ├── auth/google/callback/   # GET: OAuth callback, PKCE code exchange, encrypted session
│   │   ├── auth/google/start/      # GET: OAuth initiation, state & PKCE challenge generation
│   │   ├── chat/route.ts           # POST: Streaming chat onboarding endpoint
│   │   └── profile/route.ts        # GET/POST: Normalized profile & location listing
│   ├── globals.css                 # Editorial typography, paper tokens, print styles
│   ├── layout.tsx                  # Root layout with editorial typography
│   └── page.tsx                    # Master journey orchestrator (Steps 1–10)
├── components/
│   ├── chat/                       # Step 2 conversational interface & Step 3 confirmation
│   ├── connect/                    # Step 4 consent opt-in, photo upload & review import
│   ├── dashboard/                  # Step 6 deep-dive profile dashboard & Step 7 loader
│   ├── layout/                     # Sticky header & corporate footer
│   ├── marketing/                  # Hero and editorial value proposition cards
│   ├── report/                     # Step 10 comprehensive report sections (1–8)
│   └── ui/                         # Reusable UI primitives (Badge, Button, Card, Stepper)
├── lib/
│   ├── adapters/                   # Live Google adapter, category demo adapter, customer adapter
│   ├── ai/                         # Groq client, prompts, Zod schemas, fallback engine
│   ├── scoring/                    # Deterministic 100-point mathematical scoring engine
│   ├── security/                   # PKCE, HMAC state, AES-256-GCM session, token refresh manager
│   ├── storage/                    # Browser-local report history (localStorage)
│   ├── types/contracts.ts          # Zod contract definitions across the application
│   └── utils.ts                    # Classname utility
├── scratch/                        # Automated regression test suites
├── .env.example                    # Clean environment configuration template
├── .gitignore                      # Git exclusion rules
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## ⚠️ Known Limitations & Scope Boundaries

1. **Live Google Verification**: Full live data retrieval requires a Google Cloud project with Google Business Profile API whitelist approval and managerial access to a verified Google Business Profile. If unconfigured or unauthorized, the application provides category-tailored Demo and Customer-Provided modes as fully functional alternatives.
2. **Browser Storage Scope**: Report history is stored in browser `localStorage`. Reports are device-bound and will not sync across different browsers or devices.
3. **Photo Analysis Tier**: The photo audit evaluates file metadata, resolution, and user-assigned categories (Tier 1). It does not perform computer vision aesthetic analysis.
4. **Local Ranking Heuristics**: All score targets and recommendations are internal optimization heuristics, not official Google ranking guarantees.

---

## 📜 License & Attribution

Copyright © 2026 Branvidia. All rights reserved.  
Developed for the Branvidia Google Business Profile Optimization Platform.
