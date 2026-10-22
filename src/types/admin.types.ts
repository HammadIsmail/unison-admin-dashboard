export interface TenantInfo {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
}

export interface TenantSettings {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  contact_email?: string;
  allowed_email_domains: string[];
  status: "active" | "suspended";
  created_at?: string;
  updated_at?: string;
}

export interface UpdateTenantSettingsInput {
  name?: string;
  logo_url?: string;
  contact_email?: string;
  allowed_email_domains?: string[];
}

// ── Super Admin Types ──────────────────────────────
export interface TenantUserCounts {
  users: number;
  alumni: number;
  students: number;
  partners: number;
  pending: number;
}

export interface SuperAdminTenantItem {
  id: string;
  slug: string;
  name: string;
  status: "active" | "suspended";
  created_at: string;
  counts: TenantUserCounts;
  logo_url?: string | null;
  contact_email?: string;
  allowed_email_domains?: string[];
  suspended_reason?: string;
}

export interface SuperAdminTenantsResponse {
  total: number;
  page: number;
  data: SuperAdminTenantItem[];
}

export interface SuperAdminStats {
  total_tenants: number;
  active_tenants: number;
  suspended_tenants: number;
  total_users: number;
  users_by_role: {
    alumni: number;
    students: number;
    partners: number;
    admins: number;
  };
  total_opportunities: number;
  total_events: number;
}

export interface CreateTenantInput {
  name: string;
  slug: string;
  contact_email?: string;
  logo_url?: string;
  allowed_email_domains?: string[];
  admin: {
    email: string;
    password: string;
    display_name: string;
    username: string;
  };
}

export interface UpdateTenantInput {
  name?: string;
  logo_url?: string;
  contact_email?: string;
  allowed_email_domains?: string[];
}
