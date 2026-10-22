import { useState, useEffect, useCallback } from "react";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, RotateCcw, ShieldAlert, Mail, 
  Clock, Trash2, UserX, AlertTriangle, ArrowLeftRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface DeletedUser {
  id: string;
  display_name?: string | null;
  username?: string | null;
  email: string;
  role: string;
  deleted_at: string;
  deletion_reason?: string;
  deletion_source?: string;
}

export default function RecoveryPage() {
  const [search, setSearch] = useState("");
  const [data, setData] = useState<DeletedUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDeletedUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Using the new backend endpoint with wrapped response
      const res = await apiClient.get<{ total: number; data: DeletedUser[] }>("/api/admin/deleted-users");
      setData(res.data || []);
      setTotal(res.total || 0);
    } catch {
      toast({ title: "Failed to load deleted accounts", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDeletedUsers();
  }, [fetchDeletedUsers]);

  const handleRestore = async (id: string) => {
    setRestoringId(id);
    try {
      await apiClient.patch(`/api/admin/restore-account/${id}`);
      toast({ 
        title: "Account Restored", 
        description: "The user account has been successfully re-activated." 
      });
      fetchDeletedUsers();
    } catch {
      toast({ title: "Restoration Failed", variant: "destructive" });
    } finally {
      setRestoringId(null);
    }
  };

  const filteredData = data.filter(user => 
    user.email.toLowerCase().includes(search.toLowerCase()) || 
    user.id.toLowerCase().includes(search.toLowerCase()) ||
    user.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    user.username?.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<DeletedUser>[] = [
    {
      key: "email",
      label: "Account Email",
      render: (item: DeletedUser) => (
        <div className="flex items-center gap-4 py-1">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground border-2 border-muted-foreground/10">
            {item.display_name?.split(" ").map(n => n[0]).join("") || "U"}
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-bold leading-none mb-1 flex items-center gap-2">
              {item.display_name || "Deleted User"}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" /> {item.email}
              </span>
              {item.username && <span className="font-mono">@{item.username}</span>}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (item: DeletedUser) => (
        <Badge variant="outline" className="capitalize text-[10px] font-bold tracking-widest">
          {item.role}
        </Badge>
      ),
    },
    {
      key: "deleted_at",
      label: "Deletion Date",
      render: (item: DeletedUser) => (
        <div className="flex items-center gap-2 text-muted-foreground whitespace-nowrap">
          <Clock className="h-3.5 w-3.5" />
          <span className="text-xs font-medium tabular-nums">{formatDate(item.deleted_at)}</span>
        </div>
      ),
    },
    {
      key: "deletion_reason",
      label: "Reason",
      render: (item: DeletedUser) => (
        <p className="text-xs text-muted-foreground italic truncate max-w-[150px]">
          {item.deletion_reason || "No reason provided"}
        </p>
      ),
    },
    {
      key: "actions",
      label: "Recovery",
      render: (item: DeletedUser) => (
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 border-success/20 text-success hover:bg-success/10 gap-2 font-bold" 
          onClick={() => handleRestore(item.id)}
          disabled={restoringId === item.id}
        >
          {restoringId === item.id ? (
             <span className="animate-spin h-3.5 w-3.5 border-2 border-success border-t-transparent rounded-full" />
          ) : (
            <RotateCcw className="h-3.5 w-3.5" />
          )}
          Restore
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Account Recovery</h1>
        </div>
        <p className="text-sm text-muted-foreground ml-12">
          Find and restore soft-deleted user accounts and their associated data.
        </p>
      </div>

      <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 ml-12 max-w-2xl">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Administrative Oversight</AlertTitle>
        <AlertDescription className="text-xs">
          Restoring an account will re-enable login and visibility across the platform. Use this only for legitimate recovery requests or mistaken deletions.
        </AlertDescription>
      </Alert>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ml-12">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by email or user ID..." 
            className="pl-9 h-11 bg-card" 
            value={search} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} 
          />
        </div>
        <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest px-4 py-2 bg-muted/50 rounded-lg">
          <UserX className="h-4 w-4" />
          Total Deleted: {total}
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm ml-12">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
          ) : (
            <DataTable 
              columns={columns} 
              data={filteredData} 
              emptyMessage="No deleted accounts match your search." 
            />
          )}
        </CardContent>
      </Card>
      
      {!loading && data.length > 0 && (
        <div className="ml-12 p-8 rounded-3xl border-2 border-dashed border-muted flex flex-col items-center justify-center text-center gap-4">
           <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
             <ArrowLeftRight className="h-8 w-8 text-muted-foreground opacity-20" />
           </div>
           <div className="space-y-1">
             <p className="font-bold text-muted-foreground">End of Audit Log</p>
             <p className="text-xs text-muted-foreground/60 max-w-xs mx-auto">Only soft-deleted accounts are shown here. Hard-deleted accounts cannot be recovered.</p>
           </div>
        </div>
      )}
    </div>
  );
}
