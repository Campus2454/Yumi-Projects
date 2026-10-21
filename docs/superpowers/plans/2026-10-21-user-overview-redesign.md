# User Overview Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the sparse, plain `/dashboard/user/overview` page into a rich, modern, glassmorphic All-in-One Dashboard featuring a Discord Profile Hero card, real-time stat cards, quick action shortcuts, and a managed server hub.

**Architecture:** Create a dedicated helper `discordSnowflake.ts` for account age computation, build reusable modular UI sections and skeleton in `UserOverviewSections.tsx`, and wire them into `page.tsx` and `loading.tsx`.

**Tech Stack:** Next.js (App Router), React 19, TypeScript, styled-components, react-icons (`react-icons/tb`, `react-icons/fa`, `react-icons/fa6`), SWR (`useGuildList`).

## Global Constraints
- Keep code clean, type-safe (`npx tsc --noEmit` must pass with zero errors).
- Preserve existing theme colors, fonts (`Kanit`), and dark dashboard aesthetics.
- Do not introduce placeholder strings or unfinished components.

---

### Task 1: Create Snowflake Helper Utility

**Files:**
- Create: `frontend/src/utils/discordSnowflake.ts`

**Interfaces:**
- Produces:
  ```ts
  export function getDiscordCreationDate(snowflakeId: string): Date;
  export function formatAccountAge(createdAt: Date): string;
  ```

- [ ] **Step 1: Write helper implementation**
  Create `frontend/src/utils/discordSnowflake.ts` computing timestamp using Discord's epoch `1420070400000n` and calculating relative age in years and months.

- [ ] **Step 2: Verify type check**
  Run: `npx tsc --noEmit` in `frontend/`
  Expected: PASS

- [ ] **Step 3: Commit**
  Run: `git add frontend/src/utils/discordSnowflake.ts && git commit -m "feat: add discord snowflake date helper"`

---

### Task 2: Build User Overview UI Components & Skeleton

**Files:**
- Create: `frontend/src/components/UserOverviewSections.tsx`

**Interfaces:**
- Consumes:
  - `User`, `PartialGuild` from `@/src/utils/types`
  - `getAvatarURL`, `getIconURL` from `@/src/utils/getURL`
  - `getDiscordCreationDate`, `formatAccountAge` from `@/src/utils/discordSnowflake`
- Produces:
  ```ts
  export function UserProfileHero({ profile }: { profile?: User }): JSX.Element;
  export function UserStatsGrid({ profile, guildCount, loading }: { profile?: User; guildCount: number; loading?: boolean }): JSX.Element;
  export function UserQuickActions(): JSX.Element;
  export function UserManagedServersHub({ guilds, loading }: { guilds?: PartialGuild[]; loading?: boolean }): JSX.Element;
  export function UserOverviewSkeleton(): JSX.Element;
  ```

- [ ] **Step 1: Implement styled components and UI sections**
  Create `frontend/src/components/UserOverviewSections.tsx` with:
  - Styled containers using glassmorphism (`rgba(255,255,255,0.04)`, `backdrop-filter: blur(12px)`, border glow).
  - `UserProfileHero`: Discord banner fallback with accent gradients, avatar with glow, copy ID button with interactive feedback, account created date.
  - `UserStatsGrid`: 4 responsive stat cards (Servers, Discord Age, Membership, OAuth2 Status).
  - `UserQuickActions`: 4 shortcut cards with hover glow linking to `/dashboard`, `/dashboard/invite`, `/dashboard/user/membership`, `/dashboard/user/premium`.
  - `UserManagedServersHub`: Up to 6 managed servers with icons, names, and direct "Manage" links, plus empty state.
  - `UserOverviewSkeleton`: Complete skeleton view mirroring the layout.

- [ ] **Step 2: Verify type check**
  Run: `npx tsc --noEmit` in `frontend/`
  Expected: PASS

- [ ] **Step 3: Commit**
  Run: `git add frontend/src/components/UserOverviewSections.tsx && git commit -m "feat: implement UserOverviewSections and skeleton"`

---

### Task 3: Update User Overview Page

**Files:**
- Modify: `frontend/app/dashboard/user/overview/page.tsx`

**Interfaces:**
- Consumes:
  - `UserContext` from `@/src/utils/contexts/Contexts`
  - `useGuildList` from `@/src/utils/hooks/useGuildData`
  - `UserProfileHero`, `UserStatsGrid`, `UserQuickActions`, `UserManagedServersHub`, `UserOverviewSkeleton` from `@/src/components/UserOverviewSections`

- [ ] **Step 1: Update page.tsx**
  Replace minimal placeholder with the new composite dashboard:
  - Render `UserProfileHero`, `UserStatsGrid`, `UserQuickActions`, and `UserManagedServersHub`.
  - Handle loading state with `UserOverviewSkeleton` when `loadingUser` is true.

- [ ] **Step 2: Verify type check**
  Run: `npx tsc --noEmit` in `frontend/`
  Expected: PASS

- [ ] **Step 3: Commit**
  Run: `git add frontend/app/dashboard/user/overview/page.tsx && git commit -m "feat: integrate rich dashboard in user overview page"`

---

### Task 4: Update Overview Loading Page

**Files:**
- Modify: `frontend/app/dashboard/user/overview/loading.tsx`

**Interfaces:**
- Consumes:
  - `UserOverviewSkeleton` from `@/src/components/UserOverviewSections`

- [ ] **Step 1: Update loading.tsx**
  Use `UserOverviewSkeleton` in `frontend/app/dashboard/user/overview/loading.tsx` so Next.js streaming loading seamlessly matches the new layout.

- [ ] **Step 2: Verify type check**
  Run: `npx tsc --noEmit` in `frontend/`
  Expected: PASS

- [ ] **Step 3: Commit**
  Run: `git add frontend/app/dashboard/user/overview/loading.tsx && git commit -m "feat: update user overview loading state to match new layout"`

---

### Task 5: End-to-End Build Verification

**Files:**
- Test all modified files

- [ ] **Step 1: Run full TypeScript check**
  Run: `npx tsc --noEmit` in `frontend/`
  Expected: Exits with 0

- [ ] **Step 2: Run Next.js production build check**
  Run: `npm run build` in `frontend/`
  Expected: Successful compilation
