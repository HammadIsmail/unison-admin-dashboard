# Directory Structure & Routing Guide (`unison-admin-dashboard-main`)

This document maps out the directory layout, page components, and routing guards.

---

## 1. Directory Tree Overview

```
unison-admin-dashboard-main/
├── src/
│   ├── components/
│   │   ├── dashboard/          # Metric cards (StatsCard), ChartCard, activity feeds
│   │   ├── layout/
│   │   │   ├── AppSidebar.tsx  # Dynamic sidebar (super-admin vs admin, university branding)
│   │   │   ├── DashboardLayout.tsx # Main dashboard frame with collapsible sidebar
│   │   │   └── Header.tsx      # Top bar (breadcrumb, theme toggle, notifications)
│   │   ├── ui/                 # Reusable Shadcn UI primitives (button, table, dialog, input, etc.)
│   │   └── NavLink.tsx         # Active link wrapper for React Router v7
│   ├── docs/                   # Documentation and architectural guides
│   ├── hooks/                  # use-mobile, use-toast, etc.
│   ├── lib/
│   │   ├── admin.api.ts        # University admin API client methods & endpoints
│   │   ├── super-admin.api.ts  # Platform super-admin API client methods & endpoints
│   │   ├── api.ts              # Axios/Fetch client wrapper, token storage, 403 suspension handler
│   │   ├── auth.tsx            # AuthProvider, useAuth hook, tenant branding state
│   │   ├── theme.tsx           # Dark/Light theme provider
│   │   └── utils.ts            # Formatting utilities and class merging (cn)
│   ├── pages/                  # Page route components
│   │   ├── AdminOpportunities.tsx # Moderator view of jobs and internships
│   │   ├── AnalyticsPage.tsx      # Campus executive analytics
│   │   ├── AnnouncementsPage.tsx  # Broadcast center with rich text editor (react-quill-new)
│   │   ├── DashboardHome.tsx      # Campus admin default KPI dashboard
│   │   ├── EventsPage.tsx         # Event moderation & approvals
│   │   ├── Login.tsx              # Admin & Super-Admin login page
│   │   ├── MembersPage.tsx        # Campus alumni and student directory
│   │   ├── NetworkAnalytics.tsx   # Campus connection graphs & trends
│   │   ├── NotFound.tsx           # 404 page
│   │   ├── PendingAccounts.tsx    # Approve/reject pending student and alumni registrations
│   │   ├── ProfileSettings.tsx    # Admin credentials and password settings
│   │   ├── RecoveryPage.tsx       # Account recovery moderation
│   │   ├── StaffManagement.tsx    # University staff & moderator account management
│   │   ├── SuperAdminDashboard.tsx# Platform super-admin KPI oversight
│   │   ├── SuperAdminTenants.tsx  # University provisioning, domains & suspension
│   │   ├── TenantSettingsPage.tsx # University branding, contact email, and allowed domains
│   │   └── UpgradeRequestsPage.tsx# Student-to-alumni graduation upgrade queue
│   ├── types/
│   │   └── admin.types.ts      # Multi-tenant and Super Admin TypeScript models
│   ├── App.tsx                 # Route definitions, guards (AdminRoute, SuperAdminRoute)
│   ├── index.css               # Global CSS & Tailwind design tokens
│   └── main.tsx                # React DOM root entry point
├── package.json                # Dependencies and npm security overrides
├── vite.config.ts              # Vite configuration
└── tsconfig.json               # Path alias mapping (@/* -> ./src/*)
```

---

## 2. Route Configuration & Guards ([src/App.tsx](file:///c:/Users/ranah/Desktop/Unison/unison-admin-dashboard-main/src/App.tsx))

| Route | Guard | Target Audience | Description |
| :--- | :--- | :--- | :--- |
| `/login` | Public | Admins & Super Admins | Authenticates via `POST /api/auth/login`. |
| `/` | `ProtectedRoute` | Role-based redirect | Super Admins are redirected to `/super-admin`; University Admins view `DashboardHome`. |
| `/pending` | `ProtectedRoute` | Campus Admin / Staff | Approves/rejects student & alumni verification cards. |
| `/upgrades` | `ProtectedRoute` | Campus Admin / Staff | Approves student transitions to alumni status. |
| `/members` | `ProtectedRoute` | Campus Admin / Staff | Campus member directory lookup. |
| `/events` | `ProtectedRoute` | Campus Admin / Staff | Event moderation & RSVPs. |
| `/announcements` | `ProtectedRoute`| Campus Admin / Staff | Broadcasts university notices (rich text). |
| `/staff` | `AdminRoute` | University Admin | Provisions and deletes campus moderator/admin accounts. |
| `/recovery` | `AdminRoute` | University Admin | Resolves locked/recovering user credentials. |
| `/tenant-settings`| `AdminRoute` | University Admin | Edits campus name, logo URL, contact email, allowed domains. |
| `/analytics` | `AdminRoute` | University Admin | Institutional analytics and growth metrics. |
| `/network-analytics`| `AdminRoute` | University Admin | Campus networking and skill density graphs. |
| `/super-admin` | `SuperAdminRoute`| Platform Super Admin | Platform-wide KPIs (campuses, user roles, totals). |
| `/super-admin/tenants`| `SuperAdminRoute`| Platform Super Admin | Onboards new universities, edits domains, suspends/reactivates. |
| `/profile` | `ProtectedRoute` | Any Admin | Password changes and profile updates. |

---

## 3. Dynamic Sidebar Navigation ([src/components/layout/AppSidebar.tsx](file:///c:/Users/ranah/Desktop/Unison/unison-admin-dashboard-main/src/components/layout/AppSidebar.tsx))

- If `user.role === "super_admin"`:
  - Header displays "Platform Super Admin".
  - Sidebar renders: **Platform Overview** (`/super-admin`), **University Management** (`/super-admin/tenants`), **Profile Settings** (`/profile`).
- If `user.role === "admin"`:
  - Header displays the university's official logo and institution name from `tenant.name`.
  - Sidebar renders full campus management menu including **University Settings** (`/tenant-settings`) and **Staff Management** (`/staff`).
