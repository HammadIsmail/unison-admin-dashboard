import { useState, useEffect, useCallback } from "react";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, Trash2, ChevronLeft, ChevronRight, 
  Mail, Phone, Linkedin, Building2, Calendar, 
  Info, ExternalLink, Briefcase, Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface Partner {
  id: string;
  name?: string | null;
  display_name?: string;
  username?: string;
  email?: string;
  phone?: string | null;
  bio?: string | null;
  affiliation?: string;
  job_title?: string;
  linkedin_url?: string | null;
  profile_picture?: string | null;
  created_at?: string;
  [key: string]: any;
}

const PAGE_SIZE = 10;

export default function PartnersTab() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Partner | null>(null);
  const { toast } = useToast();

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<{ total: number; page: number; data: Partner[] }>(
        `/api/admin/all-partners?page=${page}&limit=${PAGE_SIZE}&search=${encodeURIComponent(search)}`
      );

      setData(res.data || []);
      setTotal(res.total || 0);
    } catch {
      toast({ title: "Failed to load partners", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [page, search, toast]);

  useEffect(() => {
    const debounce = setTimeout(fetchPartners, 300);
    return () => clearTimeout(debounce);
  }, [fetchPartners]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await apiClient.del(`/api/admin/remove-account/${deleteId}`);
      toast({ title: "User deleted" });
      fetchPartners();
    } catch {
      toast({ title: "Failed to delete user", variant: "destructive" });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const columns: Column<Partner>[] = [
    {
      key: "display_name",
      label: "Partner Profile",
      render: (item: Partner) => {
        const displayName = item.name || item.display_name || item.username || "Unknown";
        return (
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setSelectedUser(item)}
          >
            <Avatar className="h-9 w-9 border-2 border-transparent group-hover:border-primary/20 transition-all">
              {item.profile_picture && <AvatarImage src={item.profile_picture} />}
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {displayName.split(" ").filter(Boolean).map((n: string) => n[0]).join("") || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="text-sm font-semibold group-hover:text-primary transition-colors">{displayName}</p>
              {item.username && (
                <p className="text-[11px] text-muted-foreground font-mono">@{item.username}</p>
              )}
            </div>
          </div>
        );
      },
    },
    { 
      key: "email", 
      label: "Email",
      render: (item: Partner) => <span className="text-muted-foreground">{item.email || "—"}</span>
    },
    { 
      key: "affiliation", 
      label: "Affiliation",
      render: (item: Partner) => <span className="font-medium text-sm">{item.affiliation || "N/A"}</span>
    },
    { key: "job_title", label: "Designation" },
    {
      key: "actions",
      label: "Actions",
      render: (item: Partner) => (
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setSelectedUser(item)}>
            <Info className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => setDeleteId(item.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Industry Partners</h2>
          <p className="text-sm text-muted-foreground mt-1">{total} corporate partners</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search partners..." 
              className="pl-9 h-10" 
              value={search} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setPage(1); }} 
            />
          </div>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
          ) : (
            <DataTable columns={columns} data={data} emptyMessage="No partners found" />
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Remove Partner"
        description="Are you sure you want to remove this industry partner? Their access will be revoked immediately."
        confirmLabel={deleting ? "Removing..." : "Remove Partner"}
        variant="destructive"
        onConfirm={handleDelete}
      />

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0 border-none shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>{selectedUser?.name || "Partner Profile"}</DialogTitle>
            <DialogDescription>Detailed information about the industry partner.</DialogDescription>
          </DialogHeader>
          <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent relative">
            <div className="absolute -bottom-12 left-6">
              <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                {selectedUser?.profile_picture && <AvatarImage src={selectedUser.profile_picture} />}
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {(selectedUser?.name || selectedUser?.display_name || selectedUser?.username || "?")
                    .split(" ").filter(Boolean).map(n => n[0]).join("") || "?"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          
          <div className="pt-14 pb-8 px-8 space-y-6">
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold tracking-tight">{selectedUser?.name || selectedUser?.display_name || selectedUser?.username || "Industry Partner"}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-mono text-muted-foreground">@{selectedUser?.username || "no-username"}</span>
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5 uppercase tracking-wider font-bold bg-primary/10 text-primary border-primary/10">Industry Partner</Badge>
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
                        <span className="truncate">{selectedUser?.email || "No email provided"}</span>
                      </div>
                      {selectedUser?.phone && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span>{selectedUser.phone}</span>
                        </div>
                      )}
                      {selectedUser?.linkedin_url && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <Linkedin className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <a 
                            href={selectedUser.linkedin_url.replace(/"/g, "")} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            LinkedIn Profile <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                <div className="space-y-6">
                  <section>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Professional Info</h3>
                    <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <Building2 className="h-4 w-4 text-primary mt-1" />
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">Affiliation</p>
                          <p className="text-sm font-bold">{selectedUser?.affiliation || "Independent"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 border-t pt-3">
                        <Briefcase className="h-4 w-4 text-primary mt-1" />
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">Designation</p>
                          <p className="text-sm font-bold">{selectedUser?.job_title || "Partner"}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {selectedUser?.bio && (
                    <section>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">About</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed italic">
                        "{selectedUser.bio}"
                      </p>
                    </section>
                  )}

                  <section>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Account Status</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      Partner since {formatDate(selectedUser?.created_at)}
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
