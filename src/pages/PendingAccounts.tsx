import { useState, useEffect, useCallback } from "react";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X, Eye, ShieldCheck, Mail, Calendar, User, Fingerprint, Image as ImageIcon, Building2, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface PendingAccount {
  id: string;
  display_name?: string | null;
  name?: string | null;
  username?: string | null;
  email: string;
  role: string;
  registered_at: string;
  profile_picture?: string | null;
  student_card_url?: string | null;
  affiliation?: string | null;
  job_title?: string | null;
  [key: string]: unknown;
}

export default function PendingAccountsPage() {
  const [accounts, setAccounts] = useState<PendingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [approveId, setApproveId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewCardUrl, setViewCardUrl] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [isBulkReject, setIsBulkReject] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<PendingAccount | null>(null);
  const { toast } = useToast();

  const fetchAccounts = useCallback(() => {
    setLoading(true);
    apiClient.get<PendingAccount[]>("/api/admin/pending-accounts")
      .then(setAccounts)
      .catch(() => toast({ title: "Failed to load pending accounts", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleApprove = async () => {
    if (!approveId) return;
    setActionLoading(true);
    try {
      await apiClient.patch(`/api/admin/approve-account/${approveId}`);
      setAccounts((prev) => prev.filter((a) => a.id !== approveId));
      setSelectedIds((prev) => prev.filter((id) => id !== approveId));
      toast({ title: "Account approved", description: "The user has been notified." });
    } catch {
      toast({ title: "Failed to approve", variant: "destructive" });
    } finally {
      setActionLoading(false);
      setApproveId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectId && !isBulkReject) return;
    setActionLoading(true);
    try {
      if (isBulkReject) {
        await apiClient.patch("/api/admin/bulk/reject", { ids: selectedIds, reason });
        setAccounts((prev) => prev.filter((a) => !selectedIds.includes(a.id)));
        setSelectedIds([]);
        toast({ title: "Accounts rejected", description: `${selectedIds.length} accounts have been rejected.` });
      } else {
        await apiClient.patch(`/api/admin/reject-account/${rejectId}`, { rejection_reason: reason });
        setAccounts((prev) => prev.filter((a) => a.id !== rejectId));
        setSelectedIds((prev) => prev.filter((id) => id !== rejectId));
        toast({ title: "Account rejected", description: "Rejection reason has been sent." });
      }
    } catch {
      toast({ title: "Failed to reject", variant: "destructive" });
    } finally {
      setActionLoading(false);
      setRejectId(null);
      setIsBulkReject(false);
      setReason("");
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);
    try {
      await apiClient.patch("/api/admin/bulk/approve", { ids: selectedIds });
      setAccounts((prev) => prev.filter((a) => !selectedIds.includes(a.id)));
      setSelectedIds([]);
      toast({ title: "Accounts approved", description: `${selectedIds.length} accounts have been approved.` });
    } catch {
      toast({ title: "Failed to approve accounts", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const columns: Column<PendingAccount>[] = [
    {
      key: "display_name",
      label: "User Information",
      render: (item: PendingAccount) => {
        const displayName = item.display_name || item.name || item.username || "User";
        return (
          <div className="flex items-center gap-4 py-1">
            <Avatar className="h-10 w-10 border border-primary/10 shadow-sm">
              {item.profile_picture && <AvatarImage src={item.profile_picture} />}
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold">
                {displayName.split(" ").filter(Boolean).map((n: string) => n[0]).join("") || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold tracking-tight leading-none mb-1">{displayName}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 font-mono">
                  <Mail className="h-3 w-3" /> {item.email}
                </span>
                {item.username && (
                  <Badge variant="outline" className="px-1.5 py-0 text-[10px] h-4 font-mono bg-muted/30">
                    @{item.username}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "role",
      label: "Account Role",
      render: (item: PendingAccount) => (
        <Badge 
          className="capitalize font-medium px-2.5 py-0.5" 
          variant={item.role === 'admin' ? 'default' : 'secondary'}
        >
          {item.role}
        </Badge>
      ),
    },
    {
      key: "registered_at",
      label: "Registration Data",
      render: (item: PendingAccount) => (
        <div className="flex items-center gap-2 text-muted-foreground whitespace-nowrap">
          <Calendar className="h-3.5 w-3.5 text-primary/60" />
          <span className="text-sm tabular-nums">{formatDate(item.registered_at)}</span>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Review Actions",
      render: (item: PendingAccount) => (
        <div className="flex items-center gap-2">
          {item.role === "student" && item.student_card_url && (
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-colors gap-1.5"
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); setViewCardUrl(item.student_card_url!); }}
            >
              <Eye className="h-3.5 w-3.5" /> View ID
            </Button>
          )}
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 text-success hover:text-success hover:bg-success/10 transition-colors gap-1.5"
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); setApproveId(item.id); }}
          >
            <Check className="h-3.5 w-3.5" /> Approve
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors gap-1.5"
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); setRejectId(item.id); }}
          >
            <X className="h-3.5 w-3.5" /> Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Pending Accounts</h1>
        </div>
        <p className="text-sm text-muted-foreground ml-11">
          Review and verify new registration requests for the UNISON platform.
        </p>
      </div>

      {/* Floating Toolbar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 duration-300">
          <Card className="shadow-2xl border-primary/20 bg-background/95 backdrop-blur-md px-6 py-3 flex items-center gap-6">
            <div className="flex items-center gap-2 pr-6 border-r">
              <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 flex items-center justify-center font-bold">
                {selectedIds.length}
              </Badge>
              <span className="text-sm font-medium">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="default" 
                onClick={handleBulkApprove}
                disabled={actionLoading}
                className="shadow-sm"
              >
                <Check className="h-4 w-4 mr-2" /> Approve All
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-destructive border-destructive/20 hover:bg-destructive/10"
                onClick={() => { setIsBulkReject(true); setRejectId(null); }}
                disabled={actionLoading}
              >
                <X className="h-4 w-4 mr-2" /> Reject Selected
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setSelectedIds([])}
                className="text-muted-foreground"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      <Card className="border-none shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
            </div>
          ) : (
            <DataTable 
              columns={columns} 
              data={accounts} 
              selectable
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onRowClick={setSelectedAccount}
              emptyMessage="No pending registration requests found." 
            />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!approveId}
        onOpenChange={(open) => !open && setApproveId(null)}
        title="Approve Registration"
        description="Are you sure you want to approve this account? The user will receive an email confirmation and gain full access to their role dashboard."
        confirmLabel={actionLoading ? "Processing..." : "Confirm Approval"}
        onConfirm={handleApprove}
      />

      <Dialog open={!!rejectId || isBulkReject} onOpenChange={(open) => {
        if (!open) {
          setRejectId(null);
          setIsBulkReject(false);
          setReason("");
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isBulkReject ? "Bulk Decline Registrations" : "Decline Registration"}</DialogTitle>
            <DialogDescription>
              {isBulkReject 
                ? `You are about to decline ${selectedIds.length} registration requests. Please provide a shared reason.` 
                : "Please provide a reason why this registration request is being declined."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Reason for rejection</Label>
              <Textarea 
                placeholder="e.g., Student card is blurred or invalid..." 
                className="min-h-[120px] resize-none focus-visible:ring-destructive/20"
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectId(null); setIsBulkReject(false); }}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!reason.trim() || actionLoading}>
              {actionLoading ? "Declining..." : "Decline Accounts"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewCardUrl} onOpenChange={(open) => !open && setViewCardUrl(null)}>
        <DialogContent className="max-w-3xl overflow-hidden p-0 gap-0 border-none">
          <div className="bg-primary/5 p-4 border-b border-primary/10">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Student Identification Card
              </DialogTitle>
              <DialogDescription>Verify the authenticity of the student card before approval.</DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 bg-muted/20">
            <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-primary/20 shadow-xl bg-white flex items-center justify-center">
              {viewCardUrl && (
                <img 
                  src={viewCardUrl} 
                  alt="Student ID Card" 
                  className="max-h-full max-w-full object-contain"
                />
              )}
            </div>
          </div>
          <DialogFooter className="bg-muted/30 p-4">
            <Button className="w-full sm:w-auto" variant="outline" onClick={() => setViewCardUrl(null)}>
              Done Reviewing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedAccount} onOpenChange={(open) => !open && setSelectedAccount(null)}>
        <DialogContent className="max-w-2xl p-0 gap-0 border-none shadow-2xl overflow-y-auto max-h-[95vh] scrollbar-thin">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 border-b border-primary/10">
            <DialogHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-2 border-primary/20 shadow-lg">
                  {selectedAccount?.profile_picture && <AvatarImage src={selectedAccount.profile_picture} />}
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                    {(selectedAccount?.display_name || selectedAccount?.name || selectedAccount?.username || "?")
                      .split(" ")
                      .filter(Boolean)
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <DialogTitle className="text-2xl font-bold tracking-tight">
                    {selectedAccount?.display_name || selectedAccount?.name || "User Details"}
                  </DialogTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-mono">
                      @{selectedAccount?.username}
                    </Badge>
                    <Badge className="capitalize">{selectedAccount?.role}</Badge>
                  </div>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-widest font-bold text-muted-foreground/70">Account Information</h4>
                
                <div className="flex items-start gap-3 group">
                  <div className="mt-1 p-2 rounded-md bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Email Address</p>
                    <p className="text-sm font-semibold">{selectedAccount?.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 group">
                  <div className="mt-1 p-2 rounded-md bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Fingerprint className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Unique Identifier</p>
                    <p className="text-sm font-mono text-muted-foreground break-all">{selectedAccount?.id}</p>
                  </div>
                </div>
              </div>

              {selectedAccount?.role === 'partner' && (
                <div className="space-y-4 pt-4 border-t border-primary/5">
                  <h4 className="text-xs uppercase tracking-widest font-bold text-muted-foreground/70">Professional Affiliation</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-start gap-3 group">
                      <div className="mt-1 p-2 rounded-md bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Company / Institution</p>
                        <p className="text-sm font-semibold">{selectedAccount?.affiliation || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 group">
                      <div className="mt-1 p-2 rounded-md bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Current Designation</p>
                        <p className="text-sm font-semibold">{selectedAccount?.job_title || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="text-xs uppercase tracking-widest font-bold text-muted-foreground/70">Verification Assets</h4>
              
              {selectedAccount?.role === "student" && selectedAccount.student_card_url ? (
                <div 
                  className="relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-dashed border-primary/20 bg-muted/30 group cursor-pointer hover:border-primary/40 transition-all"
                  onClick={() => setViewCardUrl(selectedAccount.student_card_url!)}
                >
                  <img 
                    src={selectedAccount.student_card_url} 
                    alt="Student ID" 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="h-8 w-8 text-primary mb-2" />
                    <span className="text-xs font-bold text-primary uppercase tracking-tighter">View Full Card</span>
                  </div>
                </div>
              ) : (
                <div className="aspect-[4/3] rounded-xl border-2 border-dashed border-muted flex flex-col items-center justify-center text-muted-foreground gap-2 bg-muted/10">
                  <ImageIcon className="h-8 w-8 opacity-20" />
                  <p className="text-[10px] font-medium uppercase tracking-tight">No ID Asset Required</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="bg-muted/30 p-4 border-t border-muted">
            <div className="flex items-center gap-2 w-full">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setSelectedAccount(null)}
              >
                Close
              </Button>
              <Button 
                className="flex-1 bg-success hover:bg-success/90"
                onClick={() => {
                  setApproveId(selectedAccount!.id);
                  setSelectedAccount(null);
                }}
              >
                <Check className="h-4 w-4 mr-2" /> Approve
              </Button>
              <Button 
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  setRejectId(selectedAccount!.id);
                  setSelectedAccount(null);
                }}
              >
                <X className="h-4 w-4 mr-2" /> Reject
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
