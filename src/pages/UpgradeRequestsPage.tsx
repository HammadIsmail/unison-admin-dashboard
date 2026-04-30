import { useState, useEffect } from "react";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X, ShieldCheck, Mail, GraduationCap, Phone, BookOpen, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UpgradeRequest {
  id: string;
  username?: string | null;
  display_name?: string | null;
  email: string;
  roll_number?: string | null;
  graduation_year?: number | null;
  upgrade_status: string;
  profile_picture?: string | null;
  [key: string]: unknown;
}

export default function UpgradeRequestsPage() {
  const [requests, setRequests] = useState<UpgradeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [approveId, setApproveId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UpgradeRequest | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    apiClient.get<UpgradeRequest[]>("/api/admin/upgrade-requests")
      .then(setRequests)
      .catch(() => toast({ title: "Failed to load upgrade requests", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async () => {
    if (!approveId) return;
    setActionLoading(true);
    try {
      await apiClient.patch(`/api/admin/approve-upgrade/${approveId}`);
      setRequests((prev) => prev.filter((r) => r.id !== approveId));
      toast({ title: "Profile upgraded", description: "The user has been successfully upgraded to Alumni." });
    } catch {
      toast({ title: "Failed to approve upgrade", variant: "destructive" });
    } finally {
      setActionLoading(false);
      setApproveId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectId) return;
    setActionLoading(true);
    try {
      await apiClient.patch(`/api/admin/reject-upgrade/${rejectId}`, { rejection_reason: reason });
      setRequests((prev) => prev.filter((r) => r.id !== rejectId));
      toast({ title: "Upgrade rejected", description: "The user has been notified of the rejection." });
    } catch {
      toast({ title: "Failed to reject upgrade", variant: "destructive" });
    } finally {
      setActionLoading(false);
      setRejectId(null);
      setReason("");
    }
  };

  const columns: Column<UpgradeRequest>[] = [
    {
      key: "display_name",
      label: "User Information",
      render: (item) => {
        const displayName = item.display_name || item.username || "User";
        return (
          <div 
            className="flex items-center gap-4 py-1 cursor-pointer group"
            onClick={() => setSelectedUser(item)}
          >
            <Avatar className="h-10 w-10 border border-primary/10 shadow-sm group-hover:border-primary/20 transition-all">
              {item.profile_picture && <AvatarImage src={item.profile_picture} />}
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold">
                {displayName.split(" ").filter(Boolean).map((n) => n[0]).join("") || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold tracking-tight leading-none mb-1 group-hover:text-primary transition-colors">{displayName}</p>
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
      key: "roll_number",
      label: "Roll Number",
      render: (item) => (
        <span className="font-mono text-sm">{item.roll_number || "—"}</span>
      ),
    },
    {
      key: "graduation_year",
      label: "Graduation Year",
      render: (item) => (
        <div className="flex items-center gap-2 text-muted-foreground whitespace-nowrap">
          <GraduationCap className="h-4 w-4 text-primary/60" />
          <span className="text-sm font-medium">{item.graduation_year || "—"}</span>
        </div>
      ),
    },
    {
      key: "upgrade_status",
      label: "Status",
      render: (item) => (
        <Badge 
          className="capitalize font-medium px-2.5 py-0.5" 
          variant="secondary"
        >
          {item.upgrade_status}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Review Actions",
      render: (item) => (
        <div className="flex items-center gap-2">
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
          <h1 className="text-3xl font-bold tracking-tight">Alumni Upgrade Requests</h1>
        </div>
        <p className="text-sm text-muted-foreground ml-11">
          Review and verify requests from students seeking to upgrade their profile to alumni status.
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
              data={requests} 
              emptyMessage="No pending upgrade requests found." 
            />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!approveId}
        onOpenChange={(open) => !open && setApproveId(null)}
        title="Approve Alumni Upgrade"
        description="Are you sure you want to approve this upgrade request? The user will be transitioned to an Alumni role and gain access to alumni-specific features."
        confirmLabel={actionLoading ? "Processing..." : "Confirm Upgrade"}
        onConfirm={handleApprove}
      />

      <Dialog open={!!rejectId} onOpenChange={(open) => !open && setRejectId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reject Upgrade Request</DialogTitle>
            <DialogDescription>Please provide a reason why this upgrade request is being rejected.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Reason for rejection</Label>
              <Textarea 
                placeholder="e.g., Graduation year mismatch, Roll number not found in alumni records..." 
                className="min-h-[120px] resize-none focus-visible:ring-destructive/20"
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!reason.trim() || actionLoading}>
              {actionLoading ? "Rejecting..." : "Reject Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0">
          <DialogHeader className="sr-only">
            <DialogTitle>{selectedUser?.display_name || "User Profile"}</DialogTitle>
            <DialogDescription>Detailed information about the user requesting an upgrade.</DialogDescription>
          </DialogHeader>
          <div className="h-32 bg-gradient-to-r from-blue-500/20 via-blue-500/10 to-transparent relative">
            <div className="absolute -bottom-12 left-6">
              <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                {selectedUser?.profile_picture && <AvatarImage src={selectedUser.profile_picture} />}
                <AvatarFallback className="bg-blue-500/10 text-blue-600 text-2xl font-bold">
                  {(selectedUser?.display_name || selectedUser?.username || "?")
                    .split(" ").filter(Boolean).map((n) => n[0]).join("") || "?"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          
          <div className="pt-14 pb-8 px-8 space-y-6">
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold tracking-tight">{selectedUser?.display_name || selectedUser?.username}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-mono text-muted-foreground">@{selectedUser?.username}</span>
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5 uppercase tracking-wider font-bold bg-blue-500/10 text-blue-600 border-blue-500/10">Student</Badge>
              </div>
            </div>

            <ScrollArea className="max-h-[400px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-4">
                <div className="space-y-6">
                  <section>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="truncate">{selectedUser?.email}</span>
                      </div>
                      {(selectedUser?.phone as string) && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span>{selectedUser.phone as string}</span>
                        </div>
                      )}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Academic Status</h3>
                    <div className="rounded-xl border bg-muted/30 p-4 space-y-4">
                      <div className="flex items-start gap-3">
                        <BookOpen className="h-4 w-4 text-blue-600 mt-1" />
                        <div>
                          <p className="text-sm font-semibold">{(selectedUser?.degree as string) || "Undergraduate"}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Batch {(selectedUser?.batch as string) || "N/A"}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Roll Number</p>
                          <p className="text-xs font-mono mt-0.5">{selectedUser?.roll_number || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Graduation Year</p>
                          <p className="text-xs mt-0.5 font-semibold">{selectedUser?.graduation_year || "Unknown"}</p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="space-y-6">
                  {(selectedUser?.bio as string) && (
                    <section>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">About</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed italic">
                        "{selectedUser.bio as string}"
                      </p>
                    </section>
                  )}

                  <section>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Profile Statistics</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs p-2 bg-muted/50 rounded-lg">
                        <span className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> Upgrade Status</span>
                        <Badge variant="outline" className="font-medium capitalize">{selectedUser?.upgrade_status || "Pending"}</Badge>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
