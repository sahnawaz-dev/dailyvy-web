# Dailyvy — Client (Web)

React 19 + TypeScript + Vite. Server state with **TanStack Query**, UI state with **Zustand**,
routing with **React Router**. UI built with **shadcn/ui** (Radix, `radix-nova` style) +
**Tailwind CSS v4**, icons from **lucide-react**, toasts from **sonner**.

## Quick start

```bash
npm install
npm run dev            # http://localhost:5173
```

The API must be running (see `../server/README.md` — `npm run dev:memory` is the quickest).
In development, Vite proxies `/api` and `/uploads` to `http://localhost:4000`, so the app and API
share an origin and the refresh-token cookie just works. Override with `.env.local` (see `.env.example`).

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm run typecheck` | TypeScript only |
| `npm test` / `npm run test:watch` | Vitest + Testing Library |
| `npm run lint` | Oxlint (generated shadcn files are excluded) |

## Folder structure

```
src/
├── main.tsx              # Entry: wires auth into the HTTP client, theme, renders <App />
├── app/                  # App shell: providers, router, layout, nav, global styles
│   ├── router.tsx        # Combines every module's routes
│   ├── navigation.ts     # Sidebar entries (To-Dos / Timer reserved as "Soon")
│   ├── layouts/          # AppLayout (shadcn Sidebar + <Outlet/>)
│   ├── store/            # App-shell UI state (sidebar open / collapsed)
│   └── styles/global.css # Tailwind + shadcn theme tokens (light / .dark) + app tokens
├── shared/               # Used by 2+ modules — never imports from modules/
│   ├── api/              # httpClient (envelope unwrapping, token refresh), AppError
│   ├── components/ui/    # shadcn/ui components (generated, see "UI conventions")
│   ├── components/       # App compositions built from shadcn: ConfirmDialog, PageHeader,
│   │                     #   PageLoader, PeriodNavigator, ComingSoon
│   ├── lib/utils.ts      # cn() class-name helper (shadcn)
│   ├── theme/            # Light / dark / system theme store
│   ├── hooks/            # useDocumentTitle, use-mobile (shadcn)
│   ├── utils/            # date helpers (mirror the server's dateUtils)
│   └── types/            # ApiEnvelope, DateString...
└── modules/
    ├── auth/             # login, register, verify, reset, device-limit dialog, session store
    ├── profile/          # profile + avatar, theme, change password, devices list
    ├── habits/           # tabs, weekly/monthly grid, add/edit habit, stats, celebration
    ├── calendar/         # history calendar + day drill-down
    ├── todos/            # today dashboard: one-off tasks + habits due today; add as task or habit
    └── timer/            # Phase 3 placeholder
```

Every module has the same shape (folders are created only when needed):

```
modules/<name>/
├── pages/        # Route-level components
├── components/   # Components used only by this module (built from shadcn/ui + Tailwind)
├── services/     # <name>.api.ts (raw HTTP calls) + <name>.queries.ts (React Query hooks)
├── store/        # Zustand store for module UI state
├── types/        # TypeScript types
├── utils/        # Pure helpers (easy to unit test)
├── routes.tsx    # The module's routes
└── index.ts      # PUBLIC API — the only file other modules / app may import
```

### Rules that keep it maintainable

1. **Import other modules only through their `index.ts`** — e.g. `import { useTabs } from '@/modules/habits'`.
2. **`shared/` never imports from `modules/`.** Auth plugs into the HTTP client at startup
   (`configureAuthBridge` in `modules/auth/setup.ts`).
3. **A component used by one module lives in that module.** Move it to `shared/components/` (and
   export it from `shared/components/index.ts`) once a second module needs it.
4. **Server data → React Query hooks** in `services/*.queries.ts`; components never call `*.api.ts`
   directly. **UI-only state → module store.**
5. **UI → shadcn/ui components styled with Tailwind classes.** Don't hand-build primitives; add one with
   `npx shadcn@latest add <name>` (lands in `src/shared/components/ui/`, configured in `components.json`).
   Use theme colors (`bg-primary`, `text-muted-foreground`, app tokens `bg-success` / `text-warning` /
   `bg-today`) so light and dark mode work automatically.
6. Use the `@/` alias for imports across folders (`@/shared/...`, `@/modules/...`).

## UI conventions (shadcn/ui)

| Need | Use |
|---|---|
| Buttons, inputs, forms | `Button`, `Input`, `Textarea`, `NativeSelect`, `Field` / `FieldLabel` / `FieldError` |
| Dialogs / confirmations | `Dialog`; `ConfirmDialog` (wraps `AlertDialog`) |
| Toasts | `import { toast } from 'sonner'` |
| Loading / empty / error | `Spinner` (`PageLoader`), `Empty`, `Alert` |
| Lists of things | `Item` (devices, day detail) |
| Segmented switches | `ToggleGroup` (view mode, theme, calendar scope) |
| Navigation | `Sidebar`, `Tabs` |
| Icons | `lucide-react` |

Files in `src/shared/components/ui/` are ours to edit. Local changes to keep when updating them:
`table.tsx` (added `containerClassName` for the scrolling habit grid) and `sonner.tsx` (always light,
instead of `next-themes`). Re-adding those components with `--overwrite` would undo the changes.

## Where things happen

| Feature | Code |
|---|---|
| Access token in memory, refresh via httpOnly cookie, single-flight refresh | `modules/auth/services/session.ts`, `shared/api/httpClient.ts` |
| 3rd-device login → pick a device to log out | `modules/auth/components/LoginForm.tsx`, `DeviceLimitDialog.tsx` |
| Grid cell rules (today / locked / not tracked / future) | `modules/habits/utils/cellState.ts` |
| Optimistic toggle with rollback + toast | `modules/habits/services/habits.queries.ts` (`useToggleLog`) |
| "Hoorah!" once per day per scope | `modules/habits/utils/celebration.ts`, `CELEBRATION_SCOPE` in `modules/habits/constants.ts` |
| Mon–Sun weekday selector | `modules/habits/components/WeekdaySelector/` |
| Color themes (green, red, blue, sky, violet, orange, mono) — always light, no dark mode | `shared/theme/themeStore.ts`, palettes in `app/styles/global.css` (+ inline script in `index.html`) |
| Collapsible sidebar (remembered) | `app/layouts/AppLayout.tsx`, `app/store/appUiStore.ts` |

## Adding a module (e.g. Timer)

1. Build it in `src/modules/timer/` with the shape above; export `timerRoutes` from `index.ts`.
2. The routes are already spread into `app/router.tsx`.
3. In `app/navigation.ts`, set `comingSoon: false` on the Timer entry.
