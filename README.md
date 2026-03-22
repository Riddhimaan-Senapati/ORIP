# ORIP — Clinical Workforce Readiness Platform

> A Palantir Foundry OSDK application that tracks certification compliance across a network of healthcare facilities, built for the Palantir Build Challenge.

**Live demo:** _deploy to Vercel (see below)_
**Stack:** Next.js 16 · Palantir OSDK v2 · Vercel AI SDK · Anthropic Claude

---

## What it does

Hospitals must keep clinical staff continuously certified — BLS, ACLS, HIPAA, facility-specific credentials. When a certification lapses, regulatory bodies can sanction the facility and patient safety is at risk. ORIP gives compliance officers a real-time view of their entire workforce's certification status, grounded in live Foundry ontology data.

| Feature | How it works |
|---|---|
| **Network Overview** | Readiness scores aggregated across all facilities, color-coded red/amber/green |
| **Facility Drill-down** | Department-level breakdowns, per-employee status, expired cert counts |
| **Employee Profile** | Individual cert timeline, days-to-expiry, missing required certs for role |
| **Write Actions** | Renew certifications, flag employees for review, add new cert records — all routed through Foundry Action Types |
| **AI Advisor** | Streaming chat grounded in live ontology data; identifies highest-risk employees network-wide |

---

## Architecture

```
Palantir Foundry
├── Datasets (orip_employees, orip_facilities, orip_certifications, …)
├── Ontology Object Types (Employee, Facility, Certification, EmployeeCertification, Role)
├── Link Types (employee → facility, employee → certificationRecords, …)
├── Action Types (renew-certification, flag-employee-for-review, add-certification-record)
└── OSDK Package (@orip-frontend/sdk, private npm on Foundry Artifacts)

Next.js App (deployed on Vercel)
├── Server Components — fetch Foundry data via OSDK at request time (no client-side token)
├── /api/advisor — streamText() with live ontology context in system prompt
└── /api/actions/* — proxy Action Type calls to Foundry REST API
```

Auth is handled by a **confidential OAuth client** (CLIENT_ID + CLIENT_SECRET). The Next.js server calls Foundry as a service user — end users never see a Foundry login screen.

---

## Foundry Ontology Reference

| Resource | RID |
|---|---|
| Ontology | `ONTOLOGY_RID_PLACEHOLDER` |
| ORIP Project | `ri.compass.main.folder.4f3426c8-64d8-46ae-bafb-04c4f6dd3621` |
| Employee object type | `ri.ontology.main.object-type.f9c078dd-5f63-4f19-b387-8f5e0b7ca4d2` |
| EmployeeCertification object type | `ri.ontology.main.object-type.def768f6-3151-4119-9d71-75319ac9b94f` |
| orip_employees dataset (fixed) | `ri.foundry.main.dataset.f97935f4-2cbb-43a4-9fcd-200728d07838` |

---

## Local development

### Prerequisites

- Node.js 20+
- A valid Palantir Foundry confidential OAuth client (CLIENT_ID + CLIENT_SECRET)
- An Anthropic API key (for the advisor chat)

### Setup

```bash
git clone https://github.com/yourusername/certReady
cd certReady/frontend
npm install
```

Copy `.env.local` and fill in your values:

```bash
cp .env.local .env.local   # already exists, just edit it
```

```env
NEXT_PUBLIC_FOUNDRY_URL=https://your-stack.palantirfoundry.com
CLIENT_ID=your_client_id_here
CLIENT_SECRET=your_client_secret_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

> To create a confidential OAuth client: Foundry → Developer Console → Create application → Backend application

```bash
npm run dev   # http://localhost:3000
```

### Install updated OSDK (after refreshing Foundry token)

The v0.2.0 SDK includes the 4 Action Types. Install it once your token is valid:

```bash
FOUNDRY_TOKEN=<new_token> npm install @orip-frontend/sdk@^0.2.0
```

---

## Deploy to Vercel

```bash
cd frontend
npx vercel
```

Set the following environment variables in the Vercel dashboard under **Settings → Environment Variables**:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_FOUNDRY_URL` | Your Foundry stack URL |
| `CLIENT_ID` | Confidential OAuth client ID from Developer Console |
| `CLIENT_SECRET` | Confidential OAuth client secret |
| `ANTHROPIC_API_KEY` | Anthropic API key for advisor chat |

Then redeploy:

```bash
npx vercel --prod
```

---

## Dataset schemas

See [`DATASETS.md`](DATASETS.md) for full column definitions, sample data, and FK relationships for all 9 Foundry datasets.

---

## Project structure

```
certReady/
├── frontend/                  Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx            Network overview
│   │   │   ├── facility/[id]/      Facility drill-down
│   │   │   ├── employee/[id]/      Employee profile + write actions
│   │   │   ├── advisor/            AI chat advisor
│   │   │   └── api/
│   │   │       ├── advisor/        Streaming AI route
│   │   │       └── actions/        Foundry Action Type proxies
│   │   ├── components/
│   │   │   ├── EmployeeWriteActions.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── ScoreRing.tsx
│   │   │   └── StatusBadge.tsx
│   │   └── lib/
│   │       ├── foundry.ts          OSDK client (confidential OAuth)
│   │       ├── osdk-queries.ts     All Foundry data fetching
│   │       └── data.ts             Types + static role/cert definitions
│   ├── vercel.json
│   └── next.config.ts
├── datasets/                  CMS data pipeline
│   ├── download.py            Fetch CMS hospital registry
│   ├── clean_cms.py           Clean + normalize facility data
│   └── pipeline.py            End-to-end pipeline runner
├── orip-functions/            Palantir TypeScript Functions (AIP advisor)
│   └── src/functions/
│       └── advisorChat.ts     @ChatCompletion() function for Foundry AIP
├── DATASETS.md                Full dataset schema documentation
└── PALANTIR_INTEGRATION.md    Step-by-step Foundry wiring guide
```

---

## Data sources

- **Facilities:** CMS Provider of Services file — real US hospital registry (3 MA facilities)
- **Roles:** O*NET SOC codes for clinical occupations (RN, LPN, CNA, PT, etc.)
- **Certifications:** Industry-standard clinical credentials (BLS, ACLS, HIPAA, etc.)
- **Employees / EmployeeCertifications:** Synthetic data generated to match real facility IDs
