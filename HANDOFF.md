# Mrjo1 — Developer Handoff (2026-10-23)

## Goal
Continue the existing project from the current `main` branch. Do not assume the work is finished: the recent authentication integration has **not been built or tested**, and deployment is currently failing.

## Repository
- GitHub: https://github.com/elhagyosif1-lgtm/Mrjo1
- Branch: `main`

## Changes already committed
- `package.json`: added `@supabase/supabase-js` (`^2.57.4`).
- `.env.example`: documented `VITE_SUPABASE_URL`, placeholder `VITE_SUPABASE_PUBLISHABLE_KEY`, `GEMINI_API_KEY`, and `APP_URL`. No real secret should be committed.
- `src/lib/supabase.ts`: Supabase client setup and configuration guard.
- `src/services/supabaseService.ts`: auth/session helpers, profile and wallet queries, connection check.
- `src/components/AuthModal.tsx`: added email/password sign-in and sign-up UI.
- `src/components/TopHeader.tsx`: added the auth modal to the header.

## Required next steps (in order)
1. Inspect `package.json`, `src/App.tsx`, `src/context/AppContext.tsx` (or actual context location), `src/components/AuthModal.tsx`, `src/services/supabaseService.ts`, and the relevant profile/wallet migrations.
2. Fix any type/import/API mismatches in the auth modal and service functions. Verify that the sign-up call signature matches the actual service implementation.
3. Run install, lint/type-check, and production build; fix all errors. Do not report success until the commands pass.
4. Verify session persistence and sign-in/sign-up/sign-out in the app. Check how profiles are created (trigger vs client insert) and how wallet/profile state is loaded.
5. Verify Supabase RLS and authorization for all finance/admin RPCs before wiring wallet or payment actions. Never put a Supabase service-role key in frontend/VITE variables.
6. Inspect Vercel deployment failure and configure the correct framework/build settings and environment variables.
7. Confirm Vercel is connected to the intended repository. The Vercel project metadata previously showed repo name `Jo1`, while the code changes were made to `Mrjo1`; verify this before expecting these commits to deploy.

## Deployment status observed
- Vercel project: `jo1`, project ID `prj_femQ0LacpWPKcTc7zxZT9TMI2Es1`.
- Last observed production deployment was in `ERROR` state; the project was not live.
- Deployment log access returned a Vercel team-scope authorization error. Resolve access to the correct Vercel team/project, then inspect build logs. Do not guess the cause without logs.
- Project/team identifiers and deployment URLs are context from the previous investigation; re-check current state before changing production settings.

## Supabase
- Project: `supabase-fuchsia-ball`
- Project ID: `ygyghqipfotahaqpqibx`
- Last observed status: `ACTIVE_HEALTHY`
- Tables seen include `profiles`, `wallets`, `videos`, `gift_events`, `deposits`, and `withdrawals`.
- Auth leaked-password protection was reported disabled. Review and enable it if compatible with the product requirements.
- Security-review exposed `SECURITY DEFINER` RPCs before changing permissions: `admin_resolve_withdrawal`, `admin_review_deposit`, `end_live`, `request_deposit`, `request_withdrawal`, `send_gift`, and `start_live`. Confirm admin checks, ownership checks, and transaction/idempotency protections from the actual function definitions before making changes.
- No database migrations were applied as part of the work summarized here.

## Safety / handoff rules
- Never commit real API keys, passwords, access tokens, or service-role keys.
- Do not make production database or financial-flow changes without reviewing migrations, RLS, and RPC definitions first.
- Report exactly what was checked, which commands passed, and what remains incomplete.
