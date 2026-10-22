import { useEffect, useState, useCallback } from "react";
import { superAdminApi } from "@/lib/super-admin.api";
import {
  SuperAdminTenantItem,
  CreateTenantInput,
  UpdateTenantInput,
} from "@/types/admin.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Building2,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Edit,
  Power,
  RotateCcw,
  Loader2,
  Users,
  Mail,
  Globe,
  Lock,
  User,
} from "lucide-react";

export default function SuperAdminTenants() {
  const { toast } = useToast();

  const [tenants, setTenants] = useState<SuperAdminTenantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalTenants, setTotalTenants] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState<CreateTenantInput>({
    name: "",
    slug: "",
    contact_email: "",
    logo_url: "",
    allowed_email_domains: [],
    admin: {
      display_name: "",
      username: "",
      email: "",
      password: "",
    },
  });
  const [createDomainsInput, setCreateDomainsInput] = useState("");

  // Edit Modal State
  const [editingTenant, setEditingTenant] = useState<SuperAdminTenantItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editForm, setEditForm] = useState<UpdateTenantInput>({
    name: "",
    contact_email: "",
    logo_url: "",
    allowed_email_domains: [],
  });
  const [editDomainsInput, setEditDomainsInput] = useState("");

  // Suspend/Reactivate State
  const [suspendingTenant, setSuspendingTenant] = useState<SuperAdminTenantItem | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [reactivatingTenant, setReactivatingTenant] = useState<SuperAdminTenantItem | null>(null);

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    try {
      const res = await superAdminApi.listTenants({
        page,
        limit,
        search: search.trim() || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setTenants(res.data);
      setTotalTenants(res.total);
    } catch (err: any) {
      toast({
        title: "Error fetching universities",
        description: err.message || "Failed to load universities list",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, toast]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  // Handle Search Submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTenants();
  };

  // Create Tenant
  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.slug || !createForm.admin.email || !createForm.admin.password) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required university and admin details.",
        variant: "destructive",
      });
      return;
    }

    const domains = createDomainsInput
      .split(",")
      .map((d) => d.trim().replace(/^@/, "").toLowerCase())
      .filter(Boolean);

    setCreating(true);
    try {
      await superAdminApi.createTenant({
        ...createForm,
        allowed_email_domains: domains,
      });

      toast({
        title: "University Onboarded",
        description: `Successfully registered "${createForm.name}" with its initial admin account.`,
      });

      setIsCreateOpen(false);
      setCreateForm({
        name: "",
        slug: "",
        contact_email: "",
        logo_url: "",
        allowed_email_domains: [],
        admin: { display_name: "", username: "", email: "", password: "" },
      });
      setCreateDomainsInput("");
      fetchTenants();
    } catch (err: any) {
      toast({
        title: "Onboarding Failed",
        description: err.message || "Could not create university tenant",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  // Open Edit Dialog
  const handleOpenEdit = (tenant: SuperAdminTenantItem) => {
    setEditingTenant(tenant);
    setEditForm({
      name: tenant.name,
      contact_email: tenant.contact_email || "",
      logo_url: tenant.logo_url || "",
      allowed_email_domains: tenant.allowed_email_domains || [],
    });
    setEditDomainsInput((tenant.allowed_email_domains || []).join(", "));
    setIsEditOpen(true);
  };

  // Update Tenant
  const handleUpdateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;

    const domains = editDomainsInput
      .split(",")
      .map((d) => d.trim().replace(/^@/, "").toLowerCase())
      .filter(Boolean);

    setUpdating(true);
    try {
      await superAdminApi.updateTenant(editingTenant.id, {
        name: editForm.name,
        contact_email: editForm.contact_email || undefined,
        logo_url: editForm.logo_url || undefined,
        allowed_email_domains: domains,
      });

      toast({
        title: "University Updated",
        description: `Settings for "${editForm.name}" have been updated.`,
      });

      setIsEditOpen(false);
      fetchTenants();
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err.message || "Could not update university settings",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  // Suspend Tenant
  const handleConfirmSuspend = async () => {
    if (!suspendingTenant) return;
    setActionLoading(true);
    try {
      await superAdminApi.suspendTenant(suspendingTenant.id, suspendReason.trim() || undefined);
      toast({
        title: "University Suspended",
        description: `"${suspendingTenant.name}" has been suspended. Its members will be prevented from signing in.`,
      });
      setSuspendingTenant(null);
      setSuspendReason("");
      fetchTenants();
    } catch (err: any) {
      toast({
        title: "Suspension Failed",
        description: err.message || "Could not suspend university",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Reactivate Tenant
  const handleConfirmReactivate = async () => {
    if (!reactivatingTenant) return;
    setActionLoading(true);
    try {
      await superAdminApi.reactivateTenant(reactivatingTenant.id);
      toast({
        title: "University Reactivated",
        description: `"${reactivatingTenant.name}" has been reactivated successfully.`,
      });
      setReactivatingTenant(null);
      fetchTenants();
    } catch (err: any) {
      toast({
        title: "Reactivation Failed",
        description: err.message || "Could not reactivate university",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.ceil(totalTenants / limit) || 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">University Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Provision new university networks, configure institutional domains, and monitor tenant health.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchTenants} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>

          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-1.5" />
            Onboard University
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by university name or slug..."
                className="pl-9"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="suspended">Suspended Only</SelectItem>
              </SelectContent>
            </Select>

            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card>
        <CardHeader className="py-4 px-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Registered Institutions</CardTitle>
              <CardDescription>Total {totalTenants} universities on platform</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : tenants.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-base font-medium">No universities found</p>
              <p className="text-xs mt-1">Try refining your search filter or onboard a new university.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>University / Slug</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Allowed Domains</TableHead>
                    <TableHead>Users Breakdown</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg border bg-muted/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {item.logo_url ? (
                              <img
                                src={item.logo_url}
                                alt={item.name}
                                className="w-full h-full object-contain p-1"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <Building2 className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground leading-tight">{item.name}</p>
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">{item.slug}</p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground">
                        {item.contact_email ? (
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground/70" />
                            <span>{item.contact_email}</span>
                          </div>
                        ) : (
                          <span className="italic text-muted-foreground/50">None</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {item.allowed_email_domains && item.allowed_email_domains.length > 0 ? (
                            item.allowed_email_domains.slice(0, 2).map((d) => (
                              <Badge key={d} variant="secondary" className="text-[10px] px-1.5 py-0.5">
                                @{d}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground italic">All allowed</span>
                          )}
                          {item.allowed_email_domains && item.allowed_email_domains.length > 2 && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                              +{item.allowed_email_domains.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs space-y-0.5">
                          <div className="font-semibold text-foreground">
                            {item.counts?.users ?? 0} total users
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {item.counts?.alumni ?? 0} alumni • {item.counts?.students ?? 0} students
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {item.status === "active" ? (
                          <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 bg-emerald-500/10 text-xs">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            Suspended
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Edit University"
                            onClick={() => handleOpenEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          {item.status === "active" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Suspend University"
                              onClick={() => {
                                setSuspendingTenant(item);
                                setSuspendReason("");
                              }}
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                              title="Reactivate University"
                              onClick={() => setReactivatingTenant(item)}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="p-4 border-t flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Page {page} of {totalPages} ({totalTenants} items)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Onboard New University Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Onboard New University
            </DialogTitle>
            <DialogDescription>
              Create an isolated university tenant and provision its primary administrator account.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTenant} className="space-y-4 py-2">
            <div className="space-y-3 border-b pb-4">
              <h4 className="text-sm font-semibold text-foreground">University Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="create-name">University / Campus Name *</Label>
                  <Input
                    id="create-name"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="e.g. NUST Islamabad"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="create-slug">Tenant Slug *</Label>
                  <Input
                    id="create-slug"
                    value={createForm.slug}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                      })
                    }
                    placeholder="e.g. nust-isb"
                    required
                  />
                  <p className="text-[10px] text-muted-foreground">2-40 chars lowercase letters and hyphens</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="create-email">Support / Contact Email</Label>
                  <Input
                    id="create-email"
                    type="email"
                    value={createForm.contact_email}
                    onChange={(e) => setCreateForm({ ...createForm, contact_email: e.target.value })}
                    placeholder="contact@nust.edu.pk"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="create-logo">Logo Image URL</Label>
                  <Input
                    id="create-logo"
                    value={createForm.logo_url}
                    onChange={(e) => setCreateForm({ ...createForm, logo_url: e.target.value })}
                    placeholder="https://.../logo.png"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-domains">Allowed Email Domains</Label>
                <Input
                  id="create-domains"
                  value={createDomainsInput}
                  onChange={(e) => setCreateDomainsInput(e.target.value)}
                  placeholder="e.g. nust.edu.pk, seecs.edu.pk (comma separated)"
                />
                <p className="text-[10px] text-muted-foreground">Leave blank to permit all domains</p>
              </div>
            </div>

            {/* Initial University Admin Account */}
            <div className="space-y-3 pt-1">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <User className="h-4 w-4 text-primary" />
                Initial Campus Administrator
              </h4>
              <p className="text-xs text-muted-foreground">
                This administrator will have full authority over university approvals, staff, and events.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="admin-name">Admin Display Name *</Label>
                  <Input
                    id="admin-name"
                    value={createForm.admin.display_name}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        admin: { ...createForm.admin, display_name: e.target.value },
                      })
                    }
                    placeholder="e.g. Dr. Faisal Malik"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="admin-username">Admin Username *</Label>
                  <Input
                    id="admin-username"
                    value={createForm.admin.username}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        admin: { ...createForm.admin, username: e.target.value },
                      })
                    }
                    placeholder="e.g. faisal_admin"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="admin-email">Admin Email *</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={createForm.admin.email}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        admin: { ...createForm.admin, email: e.target.value },
                      })
                    }
                    placeholder="admin@nust.edu.pk"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="admin-password">Admin Password *</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    value={createForm.admin.password}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        admin: { ...createForm.admin, password: e.target.value },
                      })
                    }
                    placeholder="Min 8 characters"
                    required
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Onboarding...
                  </>
                ) : (
                  "Create & Provision"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit University Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit University Information</DialogTitle>
            <DialogDescription>
              Update institutional metadata for {editingTenant?.name} ({editingTenant?.slug})
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateTenant} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">University Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-email">Contact / Support Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.contact_email}
                onChange={(e) => setEditForm({ ...editForm, contact_email: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-logo">Logo URL</Label>
              <Input
                id="edit-logo"
                value={editForm.logo_url}
                onChange={(e) => setEditForm({ ...editForm, logo_url: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-domains">Allowed Email Domains</Label>
              <Input
                id="edit-domains"
                value={editDomainsInput}
                onChange={(e) => setEditDomainsInput(e.target.value)}
                placeholder="domain1.edu.pk, domain2.edu.pk"
              />
              <p className="text-[10px] text-muted-foreground">Comma-separated domain suffixes</p>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updating}>
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Suspend Confirmation Dialog */}
      <AlertDialog open={!!suspendingTenant} onOpenChange={(open) => !open && setSuspendingTenant(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Suspend University Tenant?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend <strong>{suspendingTenant?.name}</strong>? All alumni, students, and staff belonging to this university will be locked out with a suspension notice immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="suspend-reason" className="text-xs">Reason for suspension (optional)</Label>
            <Input
              id="suspend-reason"
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="e.g. Contract expired, institutional request"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSuspend}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Suspension"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reactivate Confirmation Dialog */}
      <AlertDialog open={!!reactivatingTenant} onOpenChange={(open) => !open && setReactivatingTenant(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-emerald-500">
              <CheckCircle2 className="h-5 w-5" />
              Reactivate University Tenant?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will restore platform access for <strong>{reactivatingTenant?.name}</strong>. Members will be able to log in and access network features again.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReactivate}
              disabled={actionLoading}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reactivate Tenant"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
