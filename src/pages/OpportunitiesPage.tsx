import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Briefcase, Search, Trash2, ChevronLeft, ChevronRight, 
  MapPin, Calendar, Filter, Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Opportunity {
  id: string;
  title: string;
  type: string;
  company: {
    name: string;
  };
  location: string;
  is_remote: boolean;
  deadline: string;
  posted_at: string;
  posted_by: {
    id: string;
    display_name: string;
    username: string;
    profile_picture?: string;
    role: string;
  };
  [key: string]: any;
}

const PAGE_SIZE = 10;

export default function OpportunitiesPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [remoteFilter, setRemoteFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/opportunities?page=${page}&limit=${PAGE_SIZE}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (typeFilter !== "all") url += `&type=${typeFilter}`;
      if (remoteFilter !== "all") url += `&is_remote=${remoteFilter === "remote"}`;

      const res = await apiClient.get<{ total: number; page: number; data: Opportunity[] }>(url);
      setData(res.data || []);
      setTotal(res.total || 0);
    } catch {
      toast({ title: "Failed to load opportunities", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter, remoteFilter]);

  useEffect(() => {
    const debounce = setTimeout(fetchOpportunities, 300);
    return () => clearTimeout(debounce);
  }, [fetchOpportunities]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await apiClient.del(`/api/opportunities/${deleteId}`);
      toast({ title: "Opportunity removed" });
      fetchOpportunities();
    } catch {
      toast({ title: "Failed to remove opportunity", variant: "destructive" });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const columns: Column<Opportunity>[] = [
    {
      key: "title",
      label: "Role & Company",
      render: (item) => (
        <div className="flex flex-col">
          <p className="text-sm font-semibold">{item.title}</p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
            <Briefcase className="h-3 w-3" />
            <span>{item.company?.name || "Multiple Companies"}</span>
          </div>
        </div>
      ),
    },
    {
      key: "posted_by",
      label: "Posted By",
      render: (item) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            {item.posted_by?.profile_picture && <AvatarImage src={item.posted_by.profile_picture} />}
            <AvatarFallback className="text-[8px]">
              {item.posted_by?.display_name?.split(" ").map(n => n[0]).join("") || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-xs font-medium">{item.posted_by?.display_name}</span>
            <Badge variant="outline" className="text-[8px] h-3 px-1 w-fit capitalize">
              {item.posted_by?.role}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type & Mode",
      render: (item) => (
        <div className="flex flex-col gap-1">
          <Badge variant="secondary" className="w-fit text-[10px] capitalize">
            {item.type.replace("-", " ")}
          </Badge>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{item.is_remote ? "Remote" : item.location}</span>
          </div>
        </div>
      ),
    },
    {
      key: "deadline",
      label: "Deadline",
      render: (item) => (
        <div className="flex items-center gap-1.5 text-xs">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <span className={cn(
            new Date(item.deadline) < new Date() ? "text-destructive font-medium" : "text-muted-foreground"
          )}>
            {new Date(item.deadline).toLocaleDateString()}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <Button size="sm" variant="ghost" className="h-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(item.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Opportunities</h1>
          <p className="text-sm text-muted-foreground mt-1">Oversee all job and internship postings</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by title..." 
              className="pl-9 h-9" 
              value={search} 
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
            />
          </div>
          
          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-32 h-9 text-xs">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="job">Job</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="freelance">Freelance</SelectItem>
            </SelectContent>
          </Select>

          <Select value={remoteFilter} onValueChange={(v) => { setRemoteFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-32 h-9 text-xs">
              <SelectValue placeholder="Work Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="onsite">On-site</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-dashed">
              <Briefcase className="h-10 w-10 text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-lg font-medium italic">No opportunities found</h3>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <DataTable 
              columns={columns} 
              data={data} 
              emptyMessage="No opportunities found" 
              onRowClick={(item) => navigate(`/opportunities/${item.id}`)}
            />
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-card p-4 rounded-xl border">
          <p className="text-sm text-muted-foreground text-xs uppercase tracking-wider font-semibold">
            Showing Page <span className="text-foreground">{page}</span> of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Remove Opportunity"
        description="Are you sure you want to remove this opportunity? This action cannot be undone."
        confirmLabel={deleting ? "Removing..." : "Remove"}
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
