import { apiClient } from "./api";
import { TenantSettings, UpdateTenantSettingsInput } from "@/types/admin.types";

// ── University Tenant Settings ─────────────────────
export const getCurrentTenantSettings = async (): Promise<TenantSettings> => {
  return apiClient.get<TenantSettings>("/api/admin/tenant");
};

export const updateCurrentTenantSettings = async (
  payload: UpdateTenantSettingsInput
): Promise<TenantSettings> => {
  return apiClient.put<TenantSettings>("/api/admin/tenant", payload);
};

// ── Pending Accounts & Approvals ───────────────────
export const getPendingAccounts = async (): Promise<any[]> => {
  return apiClient.get<any[]>("/api/admin/pending-accounts");
};

export const approveAccount = async (id: string): Promise<{ message: string }> => {
  return apiClient.patch<{ message: string }>(`/api/admin/approve-account/${id}`);
};

export const rejectAccount = async (
  id: string,
  reason?: string
): Promise<{ message: string }> => {
  return apiClient.patch<{ message: string }>(`/api/admin/reject-account/${id}`, {
    rejection_reason: reason,
  });
};

export const bulkApproveAccounts = async (
  ids: string[]
): Promise<{ message: string; approved_count?: number }> => {
  return apiClient.patch("/api/admin/bulk/approve", { ids });
};

export const bulkRejectAccounts = async (
  ids: string[],
  reason?: string
): Promise<{ message: string; rejected_count?: number }> => {
  return apiClient.patch("/api/admin/bulk/reject", { ids, reason });
};

// ── Dashboard & Analytics ─────────────────────────
export const getAdminDashboardStats = async (): Promise<any> => {
  return apiClient.get("/api/admin/dashboard-stats");
};

export const getAdminRecentActivity = async (params?: {
  page?: number;
  limit?: number;
}): Promise<any> => {
  const query = params ? `?page=${params.page ?? 1}&limit=${params.limit ?? 10}` : "";
  return apiClient.get(`/api/admin/recent-activity${query}`);
};

export const getAdvancedAnalytics = async (): Promise<any> => {
  return apiClient.get("/api/admin/advanced-analytics");
};

// ── User Management ───────────────────────────────
export const getAllAlumni = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<any> => {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.search) sp.set("search", params.search);
  const q = sp.toString() ? `?${sp.toString()}` : "";
  return apiClient.get(`/api/admin/all-alumni${q}`);
};

export const getAllStudents = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<any> => {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.search) sp.set("search", params.search);
  const q = sp.toString() ? `?${sp.toString()}` : "";
  return apiClient.get(`/api/admin/all-students${q}`);
};

export const getAllPartners = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<any> => {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.search) sp.set("search", params.search);
  const q = sp.toString() ? `?${sp.toString()}` : "";
  return apiClient.get(`/api/admin/all-partners${q}`);
};

export const removeAccount = async (id: string): Promise<{ message: string }> => {
  return apiClient.del<{ message: string }>(`/api/admin/remove-account/${id}`);
};

export const restoreAccount = async (id: string): Promise<{ message: string }> => {
  return apiClient.patch<{ message: string }>(`/api/admin/restore-account/${id}`);
};

export const getDeletedUsers = async (): Promise<any> => {
  return apiClient.get("/api/admin/deleted-users");
};

// ── Upgrade Requests ──────────────────────────────
export const getUpgradeRequests = async (): Promise<any[]> => {
  return apiClient.get<any[]>("/api/admin/upgrade-requests");
};

export const approveUpgrade = async (id: string): Promise<{ message: string }> => {
  return apiClient.patch<{ message: string }>(`/api/admin/approve-upgrade/${id}`);
};

export const rejectUpgrade = async (
  id: string,
  reason?: string
): Promise<{ message: string }> => {
  return apiClient.patch<{ message: string }>(`/api/admin/reject-upgrade/${id}`, {
    rejection_reason: reason,
  });
};

// ── Announcements ─────────────────────────────────
export const getAnnouncements = async (params?: {
  page?: number;
  limit?: number;
}): Promise<any> => {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.limit) sp.set("limit", String(params.limit));
  const q = sp.toString() ? `?${sp.toString()}` : "";
  return apiClient.get(`/api/admin/announcements${q}`);
};

export const createAnnouncement = async (payload: {
  title: string;
  content: string;
}): Promise<any> => {
  return apiClient.post("/api/admin/announcements", payload);
};

export const deleteAnnouncement = async (id: string): Promise<{ message: string }> => {
  return apiClient.del<{ message: string }>(`/api/admin/announcements/${id}`);
};

// ── Staff Management ──────────────────────────────
export const getStaffList = async (): Promise<any[]> => {
  return apiClient.get<any[]>("/api/admin/staff");
};

export const createStaff = async (payload: {
  email: string;
  password: string;
  display_name: string;
  username: string;
  role: "admin" | "moderator";
}): Promise<any> => {
  return apiClient.post("/api/admin/staff", payload);
};

export const removeStaff = async (id: string): Promise<{ message: string }> => {
  return apiClient.del<{ message: string }>(`/api/admin/staff/${id}`);
};

// ── Profile & Self ────────────────────────────────
export const getAdminProfile = async (): Promise<any> => {
  return apiClient.get("/api/admin/profile");
};

export const requestEmailChange = async (new_email: string): Promise<any> => {
  return apiClient.patch("/api/admin/request-email-change", { new_email });
};

export const verifyEmailChange = async (new_email: string, otp: string): Promise<any> => {
  return apiClient.patch("/api/admin/verify-email-change", { new_email, otp });
};

export const adminApi = {
  getCurrentTenantSettings,
  updateCurrentTenantSettings,
  getPendingAccounts,
  approveAccount,
  rejectAccount,
  bulkApproveAccounts,
  bulkRejectAccounts,
  getAdminDashboardStats,
  getAdminRecentActivity,
  getAdvancedAnalytics,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getStaffList,
  createStaff,
  removeStaff,
  getAdminProfile,
  requestEmailChange,
  verifyEmailChange,
};
