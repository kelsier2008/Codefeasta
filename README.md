# ReconAI — Bank Reconciliation & Anomaly Investigation (frontend)

Production-quality React frontend for an automated bank-reconciliation agent. It runs fully against a
mocked API (MSW) with realistic seeded data, and talks to a real FastAPI backend by changing one
environment variable.

> **Deterministic code decides what is true. The AI explains why. Humans decide anything risky.**
> Every AI claim in the UI is shown with its confidence, model/version and supporting evidence, is
> marked with a violet ✦ AI badge, and potential-fraud / high-value items always need a human decision.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173 — mock API enabled by default
```

| Script              | What it does                                        |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | Vite dev server with the MSW mock API               |
| `npm run build`     | Type-check (`tsc -b`) and production build          |
| `npm run preview`   | Serve the production build                          |
| `npm test`          | Vitest + React Testing Library (runs once)          |
| `npm run typecheck` | TypeScript only                                     |

Requires Node 18+ (tested on Node 26).

### 2-minute demo tour

1. **Dashboard** — stat cards, 12-month auto-match trend, anomalies by category, "Needs your attention".
2. **Runs → September 2026** — the showcase run: summary strip with the integrity check
   (*Unexplained* is red until resolved), waterfall, and the Matched / Unmatched / Anomalies / Rules / Activity tabs.
3. **Anomalies → F-2609-013** (₹49,900 to a 3-day-old vendor, just under the ₹50,000 approval limit) —
   detector signals with the noisy-OR breakdown, AI analysis with agent trace, decisions with required notes,
   impact on totals before confirming, comments with @mentions.
4. **Unmatched** — drag a bank row onto a ledger row (or select one of each and press **M**). Try the
   Asian Paints pair: bank ₹4,99,410 vs ledger ₹5,00,000.
5. **Re-run with relaxed tolerances** (₹5,000) — the three amount mismatches match automatically as "P5 · Relaxed re-run".
6. **Review queue → Focus mode** — card-by-card review with **A / R / E / J / K**, auto-advance and a 10-second Undo.
7. **Runs → New Reconciliation → Use sample files** — upload, PDF parse warning + *Retry with OCR*,
   balance sanity check, column mapping (the Tally export needs it), rules with a live fuzzy-match example,
   then **Start run** to watch the pipeline stream live (≈ 22 s).
8. **User menu → Dev mode · switch role** — Auditor / Reviewer hide or disable actions everywhere (the mock API also returns 403).
9. Press **⌘K / Ctrl K** for the command palette, **?** for all shortcuts.

---

## Tech stack

React 18 · TypeScript (strict) · Vite · Tailwind CSS + shadcn-style components on Radix primitives ·
React Router v6 · TanStack Query (server state) · Zustand (UI state) · TanStack Table v8 + TanStack Virtual ·
Recharts · react-hook-form + zod · lucide-react · date-fns · big.js · cmdk · sonner · MSW 2 · Vitest + RTL.

## Folder structure

```
src/
  api/
    types.ts          # API contract (shared with the FastAPI backend)
    client.ts         # fetch wrapper, ApiError, SSE-over-fetch reader, VITE_API_BASE_URL
    endpoints.ts      # typed API surface + query keys
    queries.ts        # TanStack Query hooks, optimistic mutations with rollback
    mocks/
      seed.ts         # deterministic generator: 12 monthly runs, ~600 bank / ~610 ledger txns each
      db.ts           # in-memory DB + derived numbers (totals, explained, review progress)
      handlers.ts     # MSW handlers for every endpoint (latency, error injection, role checks)
      browser.ts / server.ts
  components/
    ui/               # shadcn-style primitives (button, dialog/sheet, menus, form controls, command…)
    shared/           # AmountCell, RiskMeter, ConfidenceBar, StatusBadge, CategoryBadge, AIBadge,
                      # SignalChip, EvidenceList, DiffView, StatCard, StepProgress, KeyboardHint,
                      # EmptyState, DataTable (virtualized), ConfirmDialog, filters, charts
    shell/            # AppShell, Sidebar, Topbar, CommandPalette, ShortcutsDialog
  features/
    dashboard/  runs/ (list, wizard/, detail, pipeline, tabs/)  matches/  anomalies/
    review/  rules/  reports/  audit/  settings/
  hooks/              # useUrlState (filters/sort/columns in the URL), useHotkeys
  lib/                # money (big.js), risk (thresholds, noisy-OR), fuzzy, format, permissions, store
  routes/             # router (code-split routes), 404
  styles/             # globals.css — theme tokens
  test/               # setup, polyfills, render helper
```

## Design system

Dark-first with a working light theme (top bar toggle, or Settings → Preferences). Tokens live in
`src/styles/globals.css` as RGB channels so Tailwind opacity modifiers work (`bg-sys/10`).

| Token  | Dark      | Meaning                                    |
| ------ | --------- | ------------------------------------------ |
| `sys`  | `#22D3EE` | matched / success / system actions         |
| `attn` | `#FB923C` | unmatched / needs attention                |
| `crit` | `#F87171` | potential fraud / critical / rejected      |
| `warn` | `#FBBF24` | timing difference / warning / medium risk  |
| `ai`   | `#A78BFA` | AI-generated content (always with ✦ AI)    |
| `ok`   | `#34D399` | approved / reconciled                      |

Surfaces `#0B0F19` / `#121826` / `#1A2233`, borders `#242C3D`. Light mode uses deeper accent shades for AA contrast.
Inter for UI, JetBrains Mono for amounts, IDs and raw data (bundled via Fontsource, no CDN).

**Money** is always a decimal string in the API and is only ever combined with big.js (`src/lib/money.ts`).
Display: monospace, tabular, right-aligned, currency symbol, Indian (`₹1,24,500.00`) or international
grouping from the locale setting; debits red with a `−`, credits green, plus an `aria-label` ("debit of ₹…").

Density (comfortable/compact) applies to every table. Motion is 150–200 ms and honours `prefers-reduced-motion`.

## Pointing to the real backend

```bash
cp .env.example .env.local
# .env.local
VITE_API_BASE_URL=https://recon-api.internal.example.com
VITE_USE_MOCKS=false
```

- `VITE_API_BASE_URL` — origin of the FastAPI app; requests go to `${VITE_API_BASE_URL}/api/...`.
  Leave empty to use same-origin `/api` (e.g. behind a reverse proxy).
- `VITE_USE_MOCKS=false` — skips starting the MSW service worker.
- The client sends `X-Demo-Role` for the dev role switcher; a real backend should ignore it and
  authorise from the session. Auth (cookies/OIDC) is not part of this frontend — add credentials in
  `src/api/client.ts` (`credentials: "include"` or a bearer header) when wiring it up.
- Errors should be JSON `{ "error": string, "detail"?: string }` with a 4xx/5xx status. 4xx are not retried; 5xx are retried once.

## API contract

All types are in [`src/api/types.ts`](src/api/types.ts). Money is a decimal **string**, signed
(negative = money leaving the account). Dates are ISO `yyyy-MM-dd`, timestamps ISO 8601 UTC.

| Method & path                         | Request                         | Response                                   |
| ------------------------------------- | ------------------------------- | ------------------------------------------ |
| `POST /api/uploads`                   | multipart: `file`, `kind`, `accountId?` | `UploadedFile` (parse status, preview rows, sanity check, warnings) |
| `POST /api/uploads/:id/ocr`           | —                               | `UploadedFile`                             |
| `GET  /api/runs`                      | —                               | `Run[]`                                    |
| `POST /api/runs`                      | `CreateRunRequest`              | `Run` (status `running`)                   |
| `GET  /api/runs/:id`                  | —                               | `Run` (stats, stages, review progress)     |
| `GET  /api/runs/:id/events`           | —                               | **SSE** (see below)                        |
| `GET  /api/runs/:id/matches`          | —                               | `MatchPairView[]`                          |
| `GET  /api/runs/:id/unmatched`        | —                               | `{ bank: UnmatchedItem[], ledger: UnmatchedItem[] }` |
| `GET  /api/runs/:id/findings`         | —                               | `FindingView[]`                            |
| `GET  /api/runs/:id/activity`         | —                               | `{ events: RunEvent[], audit: AuditEntry[] }` |
| `POST /api/runs/:id/rerun`            | `RerunRequest`                  | `{ matchesGained, pairIds }`               |
| `POST /api/runs/:id/finalize`         | —                               | `Run` (409 if reviews are open)            |
| `GET  /api/findings/:id`              | —                               | `FindingDetail` (evidence, vendor history, comments, history, impact) |
| `POST /api/findings/:id/decision`     | `DecisionRequest`               | `FindingDetail` (422 if notes/reason missing) |
| `POST /api/findings/bulk-decision`    | `{ ids, action: "approve" }`    | `{ updated }` (never applies to fraud)     |
| `POST /api/findings/:id/comments`     | `{ body }`                      | `Comment`                                  |
| `POST /api/matches/manual`            | `{ runId, bankTxnIds, ledgerTxnIds, note }` | `MatchPair`                    |
| `POST /api/matches/:id/unmatch`       | `{ runId, reason }`             | `{ ok: true }`                             |
| `GET  /api/review-queue`              | —                               | `ReviewItem[]` (priority = risk × log amount) |
| `GET  /api/rules`                     | —                               | `RulesResponse` (active, proposed, detectors, versions) |
| `POST /api/rules/:id/decision`        | `{ action: approve \| edit_approve \| reject, params?, reason? }` | `ProposedRule` |
| `PUT  /api/rules/:id`                 | `Partial<Rule>` (e.g. `enabled`) | `Rule`                                    |
| `PUT  /api/detectors/:id`             | `Partial<Detector>`             | `Detector`                                 |
| `POST /api/detectors/:id/test`        | `{ runId, threshold, weight, enabled }` | impact preview                     |
| `GET  /api/reports` / `POST /api/reports` | `ReportRequest`             | `Report[]` / `Report`                      |
| `GET  /api/reports/:id/download`      | —                               | `Report` with `content` (CSV text or base64 PDF) |
| `GET  /api/audit`                     | query: `actor`, `q`, `from`, `to`, `runId` | `AuditEntry[]`                  |
| `GET  /api/settings` / `PUT /api/settings` | `Partial<Settings>`        | `Settings`                                 |
| `GET  /api/dashboard`                 | —                               | `DashboardData`                            |
| `GET  /api/search?q=`                 | —                               | `SearchResult` (runs, txns, vendors)       |

**Progress stream** — `GET /api/runs/:id/events` returns `text/event-stream`, consumed with `fetch`
(so it works through MSW and with FastAPI's `StreamingResponse`):

```
event: log      data: RunEvent
event: stages   data: { "status": RunStatus, "stages": RunStage[] }
event: done     data: {}
```

If the stream fails, the run page falls back to polling `GET /api/runs/:id` every 2 s.

**Integrity rule** the UI relies on: `bankTotal − ledgerTotal = explained + unexplained`. `explained`
includes in-tolerance differences on matched pairs plus the contribution of approved / auto-resolved
findings. Finalize is disabled until no finding is `open`, `in_review` or `escalated`.

## Mock API

- Seeded deterministically: 12 monthly runs (Oct 2025 → Sep 2026) across HDFC ••4521 and ICICI ••8834, plus a failed run.
  September 2026 (`run_2026_09`) has ~88% auto-match and 38 unmatched items, including 4 duplicates, 8 missing-in-ledger,
  4 missing-in-bank, 7 month-end timing items, 2 potential-fraud cases (₹49,900 to a new vendor; ₹8.75 L weekend RTGS),
  3 amount mismatches (2% TDS, remitter charges, digit transposition), a 1:N deposit covering 3 invoices,
  a 1:20 payroll batch and an N:1 two-tranche payment — all with agent traces and explanations.
- Latency 200–800 ms and a 2% random 503 rate — adjustable in **Settings → Developer**.
- Role checks mirror the permission matrix and return 403.
- State lives in memory: **reloading the page resets the demo data** (client-side navigation keeps it).

## Testing

```bash
npm test
```

Tests run against the same MSW handlers via `msw/node`:

- `AmountCell.test.tsx` — Indian/international grouping, sign display, compact lakh/crore, big.js arithmetic, accessible labels.
- `RiskMeter.test.tsx` — threshold boundaries, clamping, noisy-OR maths, segments + text labels.
- `FindingDecision.test.tsx` — notes required for fraud, impact shown, approve/reject via buttons and the **R** shortcut,
  optimistic update rolled back on a 500, read-only roles.
- `ManualMatch.test.tsx` — select bank + ledger rows, suggested candidates, sum check, required note, pair created, permissions.
- `seedcheck.test.ts` — the seed contains every required scenario; completed runs reconcile to ₹0 unexplained.

## Accessibility

Keyboard-complete (skip link, visible focus rings, shortcuts documented under **?**), Radix primitives for
dialogs/menus, proper table semantics with `aria-sort`, `role="meter"` for risk and confidence, charts
with text summaries, colour never the only signal (icons and text labels on every status), and toasts
announced via a live region. Tables are virtualized; routes are code-split; heavy rows are memoized.

## Known limitations

- XLSX export isn't offered (CSV/PDF only) — the backend should provide XLSX.
- Authentication and multi-org data are out of scope; the org switcher is a placeholder.
- The PDF produced by the mock is a minimal text PDF; the real backend should render the full layout shown in the preview.
