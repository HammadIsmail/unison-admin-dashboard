import { useState, useEffect } from "react";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X, Eye, ShieldCheck, Mail, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";

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
  [key: string]: unknown;
}

export default function PendingAccountsPage() {
  const [accounts, setAccounts] = useState<PendingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [approveId, setApproveId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [viewCardUrl, setViewCardUrl] = useState<string | null>(null);
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
      await apiClient.patch(`/api/admin/reject-account/${rejectId}`, { rejection_reason: reason });
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
      label: "User Information",
      render: (item) => {
        const displayName = item.display_name || item.name || item.username || "User";
        return (
          <div className="flex items-center gap-4 py-1">
            <Avatar className="h-10 w-10 border border-primary/10 shadow-sm">
              {item.profile_picture && <AvatarImage src={item.profile_picture} />}
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold">
                {displayName.split(" ").filter(Boolean).map((n) => n[0]).join("") || "?"}
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
      render: (item) => (
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
      render: (item) => (
        <div className="flex items-center gap-2 text-muted-foreground whitespace-nowrap">
          <Calendar className="h-3.5 w-3.5 text-primary/60" />
          <span className="text-sm tabular-nums">{new Date(item.registered_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Review Actions",
      render: (item) => (
        <div className="flex items-center gap-2">
          {item.role === "student" && item.student_card_url && (
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-colors gap-1.5"
              onClick={() => setViewCardUrl(item.student_card_url!)}
            >
              <Eye className="h-3.5 w-3.5" /> View ID
            </Button>
          )}
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 text-success hover:text-success hover:bg-success/10 transition-colors gap-1.5"
            onClick={() => setApproveId(item.id)}
          >
            <Check className="h-3.5 w-3.5" /> Approve
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors gap-1.5"
            onClick={() => setRejectId(item.id)}
          >
            <X className="h-3.5 w-3.5" /> Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
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

      <Dialog open={!!rejectId} onOpenChange={(open) => !open && setRejectId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Decline Registration</DialogTitle>
            <DialogDescription>Please provide a reason why this registration request is being declined.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Reason for rejection</Label>
              <Textarea 
                placeholder="e.g., Student card is blurred or invalid, Email address doesn't match official records..." 
                className="min-h-[120px] resize-none focus-visible:ring-destructive/20"
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!reason.trim() || actionLoading}>
              {actionLoading ? "Declining..." : "Decline Account"}
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
    </div>
  );
}

