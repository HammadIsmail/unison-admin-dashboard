import { useState, useEffect } from "react";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api";

interface PendingAccount {
  id: string;
  display_name: string;
  email: string;
  role: string;
  registered_at: string;
  profile_picture?: string;
  [key: string]: unknown;
}

export default function PendingAccountsPage() {
  const [accounts, setAccounts] = useState<PendingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [approveId, setApproveId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    apiClient.get<PendingAccount[]>("/api/admin/pending-accounts")
      .then(setAccounts)
      .catch(() => toast({ title: "Failed to load pending accounts", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async () => {
    if (!approveId) return;
    setActionLoading(true);
    try {
      await apiClient.patch(`/api/admin/approve-account/${approveId}`);
      setAccounts((prev) => prev.filter((a) => a.id !== approveId));
      toast({ title: "Account approved", description: "The user has been notified." });
    } catch {
      toast({ title: "Failed to approve", variant: "destructive" });
    } finally {
      setActionLoading(false);
      setApproveId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectId) return;
    setActionLoading(true);
    try {
      await apiClient.patch(`/api/admin/reject-account/${rejectId}`, { reason });
      setAccounts((prev) => prev.filter((a) => a.id !== rejectId));
      toast({ title: "Account rejected", description: "Rejection reason has been sent." });
    } catch {
      toast({ title: "Failed to reject", variant: "destructive" });
    } finally {
      setActionLoading(false);
      setRejectId(null);
      setReason("");
    }
  };

  const columns: Column<PendingAccount>[] = [
    {
      key: "display_name",
      label: "User",
      render: (item) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            {item.profile_picture && <AvatarImage src={item.profile_picture} />}
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {item.display_name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{item.display_name}</p>
            <p className="text-xs text-muted-foreground">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (item) => (
        <Badge variant="secondary" className="capitalize">{item.role}</Badge>
      ),
    },
    {
      key: "registered_at",
      label: "Registered",
      render: (item) => <span>{new Date(item.registered_at).toLocaleDateString()}</span>,
    },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="h-8 text-success hover:text-success" onClick={() => setApproveId(item.id)}>
            <Check className="h-4 w-4 mr-1" /> Approve
          </Button>
          <Button size="sm" variant="ghost" className="h-8 text-destructive hover:text-destructive" onClick={() => setRejectId(item.id)}>
            <X className="h-4 w-4 mr-1" /> Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pending Accounts</h1>
        <p className="text-sm text-muted-foreground mt-1">{accounts.length} accounts awaiting review</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
        </div>
      ) : (
        <DataTable columns={columns} data={accounts} emptyMessage="No pending accounts" />
      )}

      <ConfirmDialog
        open={!!approveId}
        onOpenChange={() => setApproveId(null)}
        title="Approve Account"
        description="Are you sure you want to approve this account? The user will be notified."
        confirmLabel={actionLoading ? "Approving..." : "Approve"}
        onConfirm={handleApprove}
      />

      <Dialog open={!!rejectId} onOpenChange={() => setRejectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Reason for rejection</Label>
            <Textarea placeholder="Please provide a reason..." value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!reason.trim() || actionLoading}>
              {actionLoading ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
