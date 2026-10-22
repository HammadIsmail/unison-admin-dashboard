# API Clients & Backend Contracts (`unison-admin-dashboard-main`)

This document defines all HTTP endpoints invoked by the dashboard, expected payloads, and responses.

---

## 1. University Admin Client ([src/lib/admin.api.ts](file:///c:/Users/ranah/Desktop/Unison/unison-admin-dashboard-main/src/lib/admin.api.ts))

All requests send `Authorization: Bearer <token>`. The backend extracts `tenant_id` from the JWT claims to isolate data to the administrator's campus.

### 1.1 Tenant Profile & Settings
- `GET /api/admin/tenant`:
  - Returns current university's `TenantSettings`:
    ```json
    {
      "id": "tenant-id",
      "slug": "fast-isb",
      "name": "FAST NUCES Islamabad",
      "logo_url": "https://.../logo.png",
      "contact_email": "admin@nu.edu.pk",
      "allowed_email_domains": ["nu.edu.pk", "isb.nu.edu.pk"],
      "status": "active"
    }
    ```
- `PUT /api/admin/tenant`:
  - Updates campus name, logo, contact email, and allowed domains.
  - Body: `{ name?, logo_url?, contact_email?, allowed_email_domains? }`.

### 1.2 Approvals & Members
- `GET /api/admin/pending-accounts`: Returns list of pending student/alumni registrations.
- `PATCH /api/admin/approve-account/:id`: Approves an individual account.
- `PATCH /api/admin/reject-account/:id`: Rejects account with optional `rejection_reason`.
- `PATCH /api/admin/bulk/approve`: `{ ids: string[] }`.
- `PATCH /api/admin/bulk/reject`: `{ ids: string[], reason?: string }`.

### 1.3 Announcements & Staff
- `GET /api/admin/announcements`
- `POST /api/admin/announcements`: `{ title, description, event_date?, media_url?, media_type? }`
- `PUT /api/admin/announcements/:id`
- `DELETE /api/admin/announcements/:id`
- `GET /api/admin/staff`: Lists campus staff and moderators.
- `POST /api/admin/staff`: Creates staff `{ email, password, display_name, username, role: "admin" | "moderator" }`.
- `DELETE /api/admin/staff/:id`: Removes staff privileges.

---

## 2. Platform Super-Admin Client ([src/lib/super-admin.api.ts](file:///c:/Users/ranah/Desktop/Unison/unison-admin-dashboard-main/src/lib/super-admin.api.ts))

Guarded on backend by `@Roles('super_admin')` and `SuperAdminGuard`.

### 2.1 Platform Analytics
- `GET /api/super-admin/stats`:
  - Returns global platform aggregate counts:
    ```json
    {
      "total_tenants": 12,
      "active_tenants": 11,
      "suspended_tenants": 1,
      "total_users": 1420,
      "users_by_role": {
        "alumni": 850,
        "students": 520,
        "partners": 30,
        "admins": 20
      },
      "total_opportunities": 95,
      "total_events": 42
    }
    ```

### 2.2 University Tenant Lifecycle
- `GET /api/super-admin/tenants?page=1&limit=10&search=&status=`:
  - Paginated list of all universities with user count breakdowns.
- `GET /api/super-admin/tenants/:id`:
  - Detailed single tenant metadata.
- `POST /api/super-admin/tenants`:
  - Creates a new university tenant and provisions its initial admin:
    ```json
    {
      "name": "NUST Islamabad",
      "slug": "nust-isb",
      "contact_email": "contact@nust.edu.pk",
      "logo_url": "https://.../nust.png",
      "allowed_email_domains": ["nust.edu.pk", "seecs.edu.pk"],
      "admin": {
        "display_name": "Dr. Faisal Malik",
        "username": "faisal_admin",
        "email": "admin@nust.edu.pk",
        "password": "Password123!"
      }
    }
    ```
- `PUT /api/super-admin/tenants/:id`:
  - Updates university metadata.
- `PATCH /api/super-admin/tenants/:id/suspend`:
  - `{ reason?: string }` — Suspends university. All campus users are locked out immediately.
- `PATCH /api/super-admin/tenants/:id/reactivate`:
  - Reactivates a suspended university tenant.
