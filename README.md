# Hackathon Tracker

A personal tracker for hackathons you're considering, building, and have finished. It looks like a builder's desk: hackathons sit on notebook paper or index cards, a rubber duck keeps an eye on your deadlines, and every hackathon has a **launch track** showing how much of its start-to-deadline window you've used.

Built with Next.js (App Router), TypeScript, Tailwind CSS, Prisma and Neon Postgres.

## Features

- **Spreadsheet view (desktop):** click any cell to edit it. Enter or click away saves, Esc cancels. Click a column header to sort.
- **Index-card view:** used on phones, and available on desktop via the top bar.
- **Statuses:** Considering, Not Started, In Progress, Completed. Two more are set automatically from the deadline:
  - **Overdue:** less than 24 hours left
  - **Missed:** the deadline has passed

  These aren't stored. They're worked out on the fly, so extending a deadline brings your own status back. Completed is never overridden.
- **Tabs:** All, Considering, In Progress, Overdue, Missed, Completed, Archived. Not Started items appear under All.
- **Deadline highlighting:** yellow for under 7 days, pink for under 3, red for under 24 hours. Plus a flip-clock countdown and a launch track on every hackathon.
- **Dashboard:** the next 3 deadlines, a two-week date ruler, and a duck tip that reacts to what's due. Updates itself every 30 seconds.
- **Search and filter:** by name, category and status.
- **Archive** (hide, with Undo) and **Delete** (permanent, asks first).
- **Mission file:** a detail panel with every field, plus "Mark as completed", which triggers a liftoff animation.
- **Passcode lock:** one passcode protects the whole site and API.

## Requirements

- Node.js 20 or newer
- A free [Neon](https://neon.tech) Postgres database

## Setup

```bash
npm install
cp .env.example .env      # then fill in the values (see below)
npm run db:deploy         # create the database table
npm run db:seed           # optional: 4 sample hackathons (only if the table is empty)
npm run dev               # http://localhost:3000
```

### Environment variables

| Variable | Required | What it is |
|---|---|---|
| `DATABASE_URL` | yes | Neon **pooled** connection string (host contains `-pooler`). Used by the app. |
| `DIRECT_URL` | yes | Neon **direct** connection string (same, without `-pooler`). Used for migrations. |
| `APP_PASSCODE` | yes in production | Passcode for the login screen. If unset, the site is open in local dev and refuses to run in production. |
| `TEST_DATABASE_URL` | no | A **separate** Neon branch for integration tests. Tests delete data, so never use your real database. |

Get both Neon strings from **Neon dashboard → Connect** (toggle "Connection pooling" on for `DATABASE_URL`, off for `DIRECT_URL`). Never commit `.env`; it's in `.gitignore`.

## Database migrations

The schema lives in [`prisma/schema.prisma`](prisma/schema.prisma).

| Task | Command |
|---|---|
| Apply existing migrations (safe, used in production) | `npm run db:deploy` |
| Change the schema: edit `schema.prisma`, then create + apply a new migration | `npm run db:migrate -- --name describe_change` |
| Browse data | `npm run db:studio` |

`db:migrate` is for development only. It may ask to reset the database if it finds drift. On Vercel, migrations run automatically (see Deploying).

## Testing

```bash
npm test             # unit tests (+ integration tests if TEST_DATABASE_URL is set)
npm run typecheck
```

To enable the integration tests, create a Neon branch (e.g. `test`), put its connection string in `TEST_DATABASE_URL`, then run `npm run test:db:setup` once to create its table.

| Suite | Covers |
|---|---|
| `tests/deadlines.test.ts` | Overdue/Missed rules and edge cases (exactly 24h, exactly now), highlight thresholds, days-left labels, next-3 and overdue lists |
| `tests/filters.test.ts` | Status tabs (including computed Overdue/Missed), archived handling, tab counts, search, category, sorting |
| `tests/validation.test.ts` | Input rules: required name, link normalisation, rejecting bad dates, enums and unknown fields |
| `tests/api.integration.test.ts` | Real API → Prisma → Postgres: create, list, edit, clear fields, archive/restore, delete, 404s, server-side filters |

### Test report (October 2026)

**Automated:** 32 unit tests pass. The 7 integration tests are skipped because no `TEST_DATABASE_URL` is configured. The same create/edit/archive/delete path was checked manually against the real database instead.

**Manual, in the browser, against the real Neon database:**

| Check | Result |
|---|---|
| Add a hackathon ("+" button), rename it inline | ✅ |
| Edit category, change status from the dropdown, set a deadline with no time (saves as 11:59 PM) | ✅ |
| Edit a table cell inline (desktop view) | ✅ |
| Filter by category, status tab, and name search; "no matches" state | ✅ |
| Reload the page: all changes persist | ✅ |
| Archive (with Undo toast) → appears under Archived → Restore | ✅ |
| Delete: "Keep it" cancels; "Delete" removes it permanently (API returns 404 afterwards) | ✅ |
| Mark as completed → liftoff animation → status saved | ✅ |
| Passcode lock: API without passcode → 401; pages → redirect to login | ✅ |
| Production build (`npm run vercel-build`) | ✅ |

**Known limitations and edge cases not covered:**

- No automated tests for the React components; the UI was tested by hand.
- Integration tests have not been run (they need a separate Neon test branch).
- Times are shown in the viewer's timezone. Deadlines are stored as exact moments; start dates are date-only.
- If the same hackathon is edited in two tabs at once, the last save wins.
- One shared passcode, no user accounts. Wrong guesses are slowed down (0.5 s), not rate-limited.
- On Windows, Prisma sometimes prints `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)` when a command exits. It's harmless.
- Prisma warns that the `package.json#prisma` seed setting is deprecated in Prisma 7. Harmless on Prisma 6.

## Deploying to Vercel

1. Push this repo to GitHub.
2. In [Vercel](https://vercel.com), **Add New → Project → Import** the repo. Framework: Next.js (auto-detected). Leave the build command as default.
3. Under **Environment Variables**, add `DATABASE_URL`, `DIRECT_URL` and `APP_PASSCODE` (paste the values, without surrounding quotes).
4. Click **Deploy**.

Vercel runs the `vercel-build` script, which does `prisma generate && prisma migrate deploy && next build`. Any new migration is applied to the database before the new version goes live. Deploys never add sample data.

Tip: for faster responses, set the Vercel function region close to your Neon region (Project → Settings → Functions).

## Project structure

```
app/
  page.tsx                  main screen (server-loads data, renders <Tracker/>)
  login/page.tsx            passcode screen
  api/hackathons/…          REST: GET (list + filters), POST, GET/PATCH/DELETE by id
  api/categories/route.ts   categories in use
  api/auth/{login,logout}   passcode session cookie
components/
  Tracker.tsx               page layout, state, filters, toasts
  Hero.tsx                  greeting, duck note, next 3 deadlines, date ruler
  HackathonGrid.tsx         notebook-paper table (desktop)
  HackathonCards.tsx        index cards (phone / card view)
  DetailSheet.tsx           "mission file" detail panel
  cells.tsx                 inline editors (text, dates, status, result, link)
  art.tsx                   duck, rocket, launch track, flip clock, sticky note
  Overlays.tsx              delete confirmation, liftoff celebration
  Toolbar.tsx               status tabs, search + category filter
lib/
  repo.ts                   ALL database access (one place to add userId later)
  deadlines.ts              Overdue/Missed rules, countdowns, next deadlines (pure)
  filters.ts                tab/search/category filtering and sorting (pure)
  validation.ts             Zod input rules shared by the API
  client.ts                 browser data layer with instant (optimistic) updates
  auth.ts, db.ts, types.ts, format.ts, api.ts
middleware.ts               passcode lock for every page and API route
prisma/                     schema, migrations, seed
tests/                      Vitest suites
```

## Future extensions

- **Notifications:** a scheduled job (e.g. Vercel Cron) that emails or pushes a reminder when a hackathon becomes Overdue. `lib/deadlines.ts` already has the logic.
- **Multi-user:** add a `User` table and a `userId` column on `Hackathon`, swap the passcode for real sign-in, and add `userId` to each function in `lib/repo.ts`.
- **Hackathon discovery:** import events from sites like Devpost or MLH into the Considering tab.
- **Teams and tasks:** per-hackathon checklists and teammates.
- **Calendar export:** an `.ics` feed of deadlines.
