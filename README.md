# Branvidia — AI-Powered Google Business Profile Optimization Platform

> **Editorial Business Intelligence Platform for Local Google Business Profile Auditing & Growth Strategy**

Branvidia is an enterprise-grade, customer-facing AI platform that guides business owners through an intuitive 10-step lifecycle to analyze, diagnose, score, and optimize their Google Business Profile (GBP) presence.

Built with **Next.js 15 (App Router)**, **TypeScript 5**, **Tailwind CSS**, and **Groq Cloud** (`openai/gpt-oss-20b`).

---

## 🌟 Key Capabilities

- **Guided Conversational Onboarding:** Interactive AI Business Advisor collects business identity, services, and target goals naturally through dialogue without rigid or comma-separated form fields.
- **Single Source of Truth & Identity Preservation:** Customer brand name, location, and service categories are preserved throughout all downstream screens and never overwritten by demo templates.
- **Three Isolated Data Modes:**
  1. **Direct Customer Asset Workspace:** Upload multiple business photos (with preview, category tagging, and removal) and input customer-supplied reviews (manual entry or CSV import).
  2. **Category-Aware Simulated GBP Demo:** Dynamically generates industry-tailored demo profiles, reviews, and photo inventories (e.g., Dental Clinic, Clothing Store, Café, Fitness Gym) while preserving the customer's actual business identity.
  3. **Live Google Business Profile Integration:** Secure OAuth 2.0 PKCE flow targeting Google Business Profile API endpoints with granular scope disclosures.
- **Review Data Integrity & Zero-Review Normalization:** Zero reviews are handled neutrally without score penalties or fake review generation. Scores are mathematically normalized across Completeness (35), Media (20), and Local SEO (15).
- **Deterministic 100-Point Scoring Engine:** Numerical scoring is 100% mathematical and strictly independent of the LLM. The calculated score is fed to the AI engine for qualitative reasoning.
- **Transparent AI Synthesis & Fallback Labeling:** Powered by Groq Cloud (`openai/gpt-oss-20b`). If rate limits occur or schema validation fails, the platform activates a deterministic rule-based fallback and explicitly labels the report as `DETERMINISTIC_FALLBACK` (never falsely claiming AI analysis succeeded).
- **Offline Review Reply Draft Policy:** Actionable suggested replies are generated for unreplied reviews as drafts with tone rationale, 1-click clipboard copy, and inline editing. Never auto-posted to Google.
- **Audit Report History & Clean PDF Print:** Instant switching between generated audit reports stored in local browser storage, and print-optimized PDF layout.

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
| **4** | **Data Connection Choice** | Affirmative consent gate: Direct Asset Workspace, Category-Aware Demo Data, or Live Google OAuth. |
| **5** | **Profile Connected** | Handshake confirmation displaying verified business identity, key metrics, and initial profile gaps. |
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
4. **Photo Insights (Tier 1 Metadata Audit):** Categorical inventory (`COVER`, `PROFILE`, `INTERIOR`, `EXTERIOR`, `PRODUCT`, `TEAM`) and coverage gaps.
5. **Problems Identified & Friction Analysis:** Prioritized issue inventory classified by severity (`CRITICAL`, `WARNING`, `OPTIMIZATION`) with source evidence citations.
6. **Strategic AI Optimization Suggestions:** Actionable recommendations prioritized by timeline (`IMMEDIATE`, `SHORT_TERM`, `LONG_TERM`) with effort/impact assessment.
7. **Suggested Customer Review Replies:** Interactive reply generator drafting responses for unreplied reviews with tone rationale (Grateful, Empathetic, Professional, Apologetic) and 1-click clipboard copy.
8. **Actionable 30-Day Execution Roadmap:** Sequential implementation roadmap assigned by role (Business Owner, Marketing Team, Customer Service).

---

## 🏗️ Architecture & Reliability Framework

```
                                    ┌────────────────────────┐
                                    │     Customer Browser   │
                                    └───────────┬────────────┘
                                                │
                                    ┌───────────▼────────────┐
                                    │    Next.js 15 Server   │
                                    │      (App Router)      │
                                    └─────┬────────────┬─────┘
                                          │            │
            ┌─────────────────────────────┴────┐  ┌────┴────────────────────────────┐
            │       Data Layer Adapters        │  │      AI & Scoring Engine         │
            ├──────────────────────────────────┤  ├──────────────────────────────────┤
            │ • Customer Asset Workspace       │  │ • Deterministic 100-Pt Engine    │
            │ • Category-Aware Demo Provider   │  │ • Groq Cloud (openai/gpt-oss-20b)│
            │ • Live Google Business API       │  │ • Strict Zod Schema Validation   │
            │ • HMAC-Signed OAuth CSRF State   │  │ • Transparent Deterministic      │
            │ • HttpOnly Secure Cookies        │  │   Fallback Engine                │
            └──────────────────────────────────┘  └──────────────────────────────────┘
```

### Deterministic Scoring Formula
The optimization score is **never invented by an LLM**. All numerical calculations are evaluated in pure TypeScript before any AI call:
- **Profile Completeness**: 35 Points
- **Reviews & Reputation**: 30 Points (redistributed to 70-point base when no reviews exist)
- **Media Distribution**: 20 Points
- **Local SEO & Attributes**: 15 Points

### Transparency & Missing Data Handling
- **Missing Data:** Fields that are unavailable are tagged `NOT_PROVIDED` and never inferred or hallucinated.
- **Photo Scope:** Categorical inventory audit is explicitly labeled `[METADATA & RESOLUTION AUDIT]`. Visual image aesthetic inspection is never claimed without an active vision-capable pipeline.
- **AI Fallback:** If Groq Cloud is rate-limited or fails schema validation, the system transparently activates the deterministic fallback engine, clearly labeled as `DETERMINISTIC_FALLBACK`.

---

## 🔒 Security & Privacy Architecture

- **Zero Client Secrets:** `GROQ_API_KEY` and Google OAuth credentials never appear in client bundles, browser requests, or Git commits.
- **CSRF State Protection:** OAuth state tokens are signed with HMAC-SHA256 and stored in HttpOnly, SameSite=Lax cookies with a 15-minute expiration window.
- **Session-Limited Tokens:** Google OAuth access tokens are stored strictly in server-side HttpOnly cookies; browser `localStorage` and `sessionStorage` are never used for sensitive credentials.
- **Rate Limiting:** Server-side in-memory rate limiter enforces a maximum of 5 analysis requests per minute per IP to protect costly AI endpoints.
- **Sanitized Errors:** Internal stack traces and credential error details are never exposed to client responses.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node 20+)
- npm or pnpm
- Groq Cloud API Key ([Get a key at console.groq.com](https://console.groq.com/keys))

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

### Environment Variables Configuration
Open `.env.local` and set your credentials:
```env
# Required for AI chat onboarding and qualitative report synthesis
GROQ_API_KEY=gsk_your_actual_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-20b

# Optional: Required ONLY for live Google Account OAuth connection
# (The application runs out-of-the-box in Demo or Direct Customer mode without these)
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Security: High-entropy secret for HMAC OAuth state signing
SESSION_SECRET=your_secure_random_session_secret_at_least_32_characters

# Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Running Locally
```bash
# Development mode (runs on http://localhost:3000)
npm run dev

# Production build & serve
npm run build
npm run start
```

---

## 🧪 Testing & Verification

```bash
# Static type checking
npx tsc --noEmit

# Production build check
npm run build

# Regression test: Customer asset uploads, reviews, and zero-review normalization
node scratch/test-asset-and-review-expansion.js

# Regression test: Industry category fixtures (Clothing, Dental Clinic, Cafe)
node scratch/test-three-industries.js
```

---

## 📁 Repository Structure

```
GPB-branvidia/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts        # POST endpoint running scoring + Groq synthesis
│   │   ├── auth/disconnect/route.ts# POST endpoint purging session cookies
│   │   ├── auth/google/callback/   # GET OAuth callback with CSRF validation
│   │   ├── auth/google/start/      # GET OAuth initiation endpoint
│   │   ├── chat/route.ts           # POST streaming chat onboarding endpoint
│   │   └── profile/route.ts        # POST/GET normalized business profile endpoint
│   ├── globals.css                 # Editorial typography, paper tokens, print styles
│   ├── layout.tsx                  # Root layout with editorial typography
│   └── page.tsx                    # Master page orchestrating 10 journey steps
├── components/
│   ├── business-profile-card.tsx   # Step 3 profile review & manual editor modal
│   ├── chat-interface.tsx          # Step 2 conversational AI onboarding interface
│   ├── google-connect-card.tsx     # Step 4 integration selector (OAuth / Demo / Direct)
│   ├── media-upload-area.tsx       # Photo upload, preview, removal & category tagging
│   ├── optimization-report.tsx     # Step 10 comprehensive report & PDF print layout
│   ├── report-history-drawer.tsx   # Multi-report history persistence drawer
│   ├── review-intake-card.tsx      # Manual review input & CSV import manager
│   ├── review-replies-view.tsx     # Offline review reply drafts with copy-to-clipboard
│   └── ui/                         # Reusable UI primitives (Badge, Button, Card, Stepper)
├── lib/
│   ├── adapters/                   # GBP interface, category demo fixtures, live adapter
│   ├── ai/                         # Groq client, prompts, Zod schemas, fallback engine
│   ├── scoring/                    # Deterministic 100-point mathematical scoring engine
│   ├── security/                   # HMAC-signed CSRF state token generation/verification
│   ├── types/contracts.ts          # Zod contract definitions across the application
│   └── utils.ts                    # Classname merging utility
├── scratch/                        # Automated regression test suites
├── .env.example                    # Clean template for environment variables
├── .gitignore                      # Git exclusion rules (protects .env.local, .next, etc.)
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 📜 License & Attribution

Copyright © 2026 Branvidia. All rights reserved.  
Developed for the Branvidia Google Business Profile Optimization Platform.
