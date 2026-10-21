# User Overview Redesign Design Specification

## Overview
This specification details the overhaul of the User Overview page (`/dashboard/user/overview`) in the Yumi frontend. The previous implementation displayed only plain text rows inside a rudimentary border. The redesigned page introduces an All-in-One Dashboard experience featuring a Discord Profile Hero card, real-time statistics, quick action shortcuts, and a managed server quick-access hub.

---

## Architecture & Component Design

### 1. File Structure
- `frontend/app/dashboard/user/overview/page.tsx`: Main page component rendering the rich dashboard.
- `frontend/app/dashboard/user/overview/loading.tsx`: Matching skeleton loading state.
- `frontend/src/components/UserOverviewSections.tsx`: Modular UI sub-components to keep code clean and maintainable:
  - `UserProfileHero`: Discord banner, avatar with glow, username/display name, copyable ID, and account creation date.
  - `UserStatsGrid`: Stat cards (Managed Servers, Discord Age, Membership Plan, OAuth2 Status).
  - `UserQuickActions`: Responsive action cards for navigating to dashboard, invite, membership, and premium.
  - `UserManagedServersHub`: Quick access server cards linking directly to server overviews.
  - `UserOverviewSkeleton`: Skeleton component used in `loading.tsx` and during data fetch.

---

## Detailed Component Specifications

### 1. Discord Profile Hero (`UserProfileHero`)
- **Discord Banner**:
  - If `profile.banner` exists: `https://cdn.discordapp.com/banners/${profile.id}/${profile.banner}.png?size=600`
  - Fallback: Smooth gradient using `profile.banner_color` / `profile.accent_color` (with fallback to `#5865F2` to `#8a2be2`).
- **Avatar**:
  - Image size: 84px x 84px with 50% border radius and subtle animated purple/blue glow.
  - Clickable to view full-size avatar in a new tab.
- **Identity & Tags**:
  - Display Name (`profile.global_name || profile.username`) in bold 22px Kanit font.
  - Username handle (`@${profile.username}`).
  - Snowflake ID chip with one-click clipboard copy (`navigator.clipboard.writeText`) showing an active checkmark / "Copied!" tooltip for 2 seconds.
- **Account Created Date**:
  - Calculated from Discord Snowflake ID:
    ```ts
    const getDiscordCreationDate = (snowflakeId: string): Date => {
      const epoch = 1420070400000n;
      const idBigInt = BigInt(snowflakeId);
      const timestamp = Number((idBigInt >> 22n) + epoch);
      return new Date(timestamp);
    };
    ```
  - Displayed as formatted date (e.g., `Joined Discord: DD/MM/YYYY`).

---

### 2. Stats Grid (`UserStatsGrid`)
A 4-column responsive grid (collapses to 2 columns on tablet, 1 column on mobile):
1. **Managed Servers**:
   - Value: `guilds?.length || 0` from `useGuildList()`.
   - Subtitle: "Servers where you have access".
   - Icon: `<FaServer />` with violet accent.
2. **Account Age**:
   - Calculated relative time from Snowflake creation date (e.g. "2 years 3 months").
   - Icon: `<FaCalendarAlt />` with blue accent.
3. **Membership Plan**:
   - Value: "Standard Member" (or Premium if enabled).
   - Subtitle: "Explore perks".
   - Link: `/dashboard/user/membership`.
   - Icon: `<TbCrown />` with gold/amber accent.
4. **Discord OAuth2**:
   - Value: "Active / Verified".
   - Subtitle: "Connected via Discord".
   - Icon: `<FaDiscord />` with `#5865F2` accent.

---

### 3. Quick Actions (`UserQuickActions`)
Interactive cards with hover scale and glow:
1. **Manage Servers**: Direct link to `/dashboard` to switch between active guilds.
2. **Add Bot to Server**: Direct link to `/dashboard/invite` to invite Yumi to new servers.
3. **Membership & Perks**: Link to `/dashboard/user/membership`.
4. **Premium Management**: Link to `/dashboard/user/premium`.

---

### 4. Managed Servers Hub (`UserManagedServersHub`)
- Lists servers retrieved from `useGuildList()` that the user manages.
- Displays up to 6 server cards with:
  - Guild Icon (`getIconURL(guild)` with initial fallback if no icon).
  - Guild Name.
  - "Manage" button linking directly to `/dashboard/server/${guild.id}/overview`.
- Includes a "View All Servers" link to `/dashboard`.
- If no servers are found, displays a friendly empty state prompting to add Yumi.

---

### 5. Skeleton Loading State (`UserOverviewSkeleton`)
- Mirrors the exact layout of the Hero banner, stat cards, quick action tiles, and server grid with animated pulsing skeleton blocks.
- Used in `frontend/app/dashboard/user/overview/loading.tsx`.

---

## Styling & Aesthetics
- Glassmorphism surfaces: `background: rgba(255, 255, 255, 0.04); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08);`.
- Hover interactions: `border-color: rgba(168, 85, 247, 0.4); transform: translateY(-2px); transition: all 0.2s ease;`.
- Font: Consistent with the rest of the application (`"Kanit", sans-serif`).
- Mobile responsiveness: Grid breakpoints using flexbox and grid (`@media (max-width: 768px)`).

---

## Verification Plan
1. Validate TypeScript compilation: `npm run build` or running `tsc --noEmit` in `frontend/`.
2. Inspect for visual errors, broken links, or undefined property accesses.
3. Verify clipboard copy behavior and fallback states when profile fields (such as banner) are null.
