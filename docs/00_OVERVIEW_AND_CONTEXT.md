# UNISON Admin & Super-Admin Dashboard — Overview & Context

## 1. Purpose & Architecture
`unison-admin-dashboard-main` is the dedicated administrative portal for the UNISON multi-tenant platform.
It serves two distinct administrative roles:

1. **University Administrator (`role: "admin"`)**:
   - Institutional scope: Restricted strictly to their own university (`tenant_id`).
   - Manages pending account approvals (students & alumni identity verification).
   - Manages institutional staff accounts (`role: "moderator"` or `"admin"`).
   - Moderates campus events, broadcasts announcements, oversees job opportunities.
   - Configures university identity, branding, and allowed email domains (`/tenant-settings`).

2. **Platform Super Administrator (`role: "super_admin"`)**:
   - Platform scope: Global authority across all universities and tenants.
   - Monitors platform-wide aggregate metrics (`/super-admin`): total campuses, user distribution by role, opportunities, and events.
   - Onboards and provisions new universities (`POST /api/super-admin/tenants`) along with their initial campus administrator account.
   - Manages university licensing and health: suspends or reactivates university tenants with one click (`/super-admin/tenants`).
   - Does not have a Neo4j User profile node; auth credentials reside exclusively in MongoDB `UserAuth`.

---

## 2. Technology Stack
- **Bundler & Dev Server**: Vite 8.3.x with Rolldown / ESBuild.
- **Language**: TypeScript 5.8.x with strict type checking.
- **Framework**: React 18.3.1.
- **Routing**: React Router DOM 7.18.4 (client-side BrowserRouter).
- **Design System & UI**: TailwindCSS 3.4.x, Radix UI primitives, Lucide React icons, Recharts for charts.
- **Rich Text Editor**: `react-quill-new` (3.7.0, Quill 2.0.2).
- **Server State & Caching**: TanStack React Query 5.x.
- **Toasts & Feedback**: Sonner + Shadcn Toaster.

---

## 3. Security Hardening & Dependency Resolutions
This dashboard has been audited and secured against known critical vulnerabilities:
- **Tinypool / Vitest**: Prototype pollution / RCE patched with `vitest: ^5.0.5` and `tinypool: ^2.1.2`.
- **React Router**: Upgraded to `^7.18.4` to fix SSR hydration constructor injection (GHSA-337j-9hxr-rhxg) and open redirect bypass (GHSA-wrjc-x8rr-h8h6).
- **Quill**: Replaced unmaintained `react-quill` with `react-quill-new` (Quill 2.0.2) to fix XSS advisories.
- **Tailwind & Selector Parsers**: Overrides locked for `postcss-selector-parser` (`^7.1.6`), `chokidar` (`^4.0.3`), `braces` (`^3.0.3`), and `micromatch` (`^4.0.8`).

---

## 4. Environment Configuration
Create or configure `.env` in the root:
```env
VITE_API_BASE_URL=http://localhost:5000
```
If `VITE_API_BASE_URL` is omitted, [`src/lib/api.ts`](file:///c:/Users/ranah/Desktop/Unison/unison-admin-dashboard-main/src/lib/api.ts) defaults to `http://localhost:5000`.

---

## 5. Development & Build Commands
```bash
# Start local Vite development server (default port 5173)
npm run dev

# Compile production bundle
npm run build

# Preview production build locally
npm run preview
```
