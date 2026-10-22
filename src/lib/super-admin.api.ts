import { apiClient } from "./api";
import {
  SuperAdminStats,
  SuperAdminTenantsResponse,
  SuperAdminTenantItem,
  CreateTenantInput,
  UpdateTenantInput,
} from "@/types/admin.types";

// ── Super Admin Platform Statistics ───────────────
export const getPlatformStats = async (): Promise<SuperAdminStats> => {
  return apiClient.get<SuperAdminStats>("/api/super-admin/stats");
};

// ── Tenants Management ────────────────────────────
export const listTenants = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<SuperAdminTenantsResponse> => {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.search) sp.set("search", params.search);
  if (params?.status) sp.set("status", params.status);
  const q = sp.toString() ? `?${sp.toString()}` : "";
  return apiClient.get<SuperAdminTenantsResponse>(`/api/super-admin/tenants${q}`);
};

export const getTenantDetails = async (
  id: string
): Promise<SuperAdminTenantItem> => {
  return apiClient.get<SuperAdminTenantItem>(`/api/super-admin/tenants/${id}`);
};

export const createTenant = async (
  payload: CreateTenantInput
): Promise<{ message: string; tenant: { id: string; slug: string; name: string } }> => {
  return apiClient.post<{
    message: string;
    tenant: { id: string; slug: string; name: string };
  }>("/api/super-admin/tenants", payload);
};

export const updateTenant = async (
  id: string,
  payload: UpdateTenantInput
): Promise<{ message: string; tenant: SuperAdminTenantItem }> => {
  return apiClient.put<{
    message: string;
    tenant: SuperAdminTenantItem;
  }>(`/api/super-admin/tenants/${id}`, payload);
};

export const suspendTenant = async (
  id: string,
  reason?: string
): Promise<{ message: string }> => {
  return apiClient.patch<{ message: string }>(
    `/api/super-admin/tenants/${id}/suspend`,
    { reason }
  );
};

export const reactivateTenant = async (
  id: string
): Promise<{ message: string }> => {
  return apiClient.patch<{ message: string }>(
    `/api/super-admin/tenants/${id}/reactivate`
  );
};

export const superAdminApi = {
  getPlatformStats,
  listTenants,
  getTenantDetails,
  createTenant,
  updateTenant,
  suspendTenant,
  reactivateTenant,
};
