# Developer Cheat Sheet & Workflows (`unison-admin-dashboard-main`)

Quick recipes for creating features, adding admin pages, and modifying API contracts in the admin dashboard.

---

## 1. Adding a New Admin Page

1. Create a page component in `src/pages/<NewFeaturePage>.tsx`:
   ```tsx
   import { useState, useEffect } from "react";
   import { adminApi } from "@/lib/admin.api";
   import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

   export default function NewFeaturePage() {
     return (
       <div className="space-y-6 max-w-7xl mx-auto pb-10">
         <h1 className="text-2xl font-bold tracking-tight text-foreground">New Feature</h1>
         <Card>
           <CardHeader>
             <CardTitle>Feature Details</CardTitle>
           </CardHeader>
           <CardContent>
             Content here...
           </CardContent>
         </Card>
       </div>
     );
   }
   ```
2. Register the route in [`src/App.tsx`](file:///c:/Users/ranah/Desktop/Unison/unison-admin-dashboard-main/src/App.tsx):
   - For campus admins: wrap with `<AdminRoute><NewFeaturePage /></AdminRoute>`.
   - For super admins: wrap with `<SuperAdminRoute><NewFeaturePage /></SuperAdminRoute>`.
   - For any authenticated staff: wrap with `<ProtectedRoute><NewFeaturePage /></ProtectedRoute>`.
3. Add the navigation item in [`src/components/layout/AppSidebar.tsx`](file:///c:/Users/ranah/Desktop/Unison/unison-admin-dashboard-main/src/components/layout/AppSidebar.tsx):
   - If university admin: add to `mainItems` (set `adminOnly: true` if moderator should not see it).
   - If super admin: add to `superAdminItems`.

---

## 2. Calling Backend APIs

- **Campus Admin Endpoints**: Add methods to [`src/lib/admin.api.ts`](file:///c:/Users/ranah/Desktop/Unison/unison-admin-dashboard-main/src/lib/admin.api.ts) using `apiClient`.
- **Super Admin Endpoints**: Add methods to [`src/lib/super-admin.api.ts`](file:///c:/Users/ranah/Desktop/Unison/unison-admin-dashboard-main/src/lib/super-admin.api.ts) using `apiClient`.
- **Typing**: Define request and response interfaces in [`src/types/admin.types.ts`](file:///c:/Users/ranah/Desktop/Unison/unison-admin-dashboard-main/src/types/admin.types.ts).

---

## 3. Updating University Tenant Branding in UI

The active university branding is provided by `useAuth()`:
```tsx
import { useAuth } from "@/lib/auth";

const { tenant, setTenant } = useAuth();
// tenant: { id, name, slug, logo_url }
// setTenant updates localStorage and triggers re-renders across the sidebar
```

---

## 4. Build & Validation

```bash
# Verify TypeScript and Vite build passes with zero errors
npm run build

# Run unit tests
npm run test
```
