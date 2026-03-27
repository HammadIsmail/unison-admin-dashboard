import { useState } from "react";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface PendingAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  registeredDate: string;
  [key: string]: unknown;
}

const mockPending: PendingAccount[] = [
  { id: "1", name: "Priya Sharma", email: "priya@gmail.com", role: "alumni", registeredDate: "2026-03-25" },
  { id: "2", name: "Rahul Verma", email: "rahul@outlook.com", role: "student", registeredDate: "2026-03-24" },
  { id: "3", name: "Anita Roy", email: "anita@yahoo.com", role: "alumni", registeredDate: "2026-03-23" },
  { id: "4", name: "David Lee", email: "david@gmail.com", role: "student", registeredDate: "2026-03-22" },
  { id: "5", name: "Sneha Patel", email: "sneha@gmail.com", role: "alumni", registeredDate: "2026-03-21" },
];

export default function PendingAccountsPage() {
  const [accounts, setAccounts] = useState(mockPending);
  const [approveId, setApproveId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const { toast } = useToast();

  const handleApprove = () => {
    setAccounts((prev) => prev.filter((a) => a.id !== approveId));
    toast({ title: "Account approved", description: "The user has been notified." });
    setApproveId(null);
  };

  const handleReject = () => {
    setAccounts((prev) => prev.filter((a) => a.id !== rejectId));
    toast({ title: "Account rejected", description: "Rejection reason has been sent." });
    setRejectId(null);
    setReason("");
  };

  const columns: Column<PendingAccount>[] = [
    {
      key: "name",
      label: "User",
      render: (item) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {item.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (item) => (
        <Badge variant="secondary" className="capitalize">
          {item.role}
        </Badge>
      ),
    },
    { key: "registeredDate", label: "Registered" },
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

      <DataTable columns={columns} data={accounts} emptyMessage="No pending accounts" />

      <ConfirmDialog
        open={!!approveId}
        onOpenChange={() => setApproveId(null)}
        title="Approve Account"
        description="Are you sure you want to approve this account? The user will be notified."
        confirmLabel="Approve"
        onConfirm={handleApprove}
      />

      <Dialog open={!!rejectId} onOpenChange={() => setRejectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Reason for rejection</Label>
            <Textarea
              placeholder="Please provide a reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!reason.trim()}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
