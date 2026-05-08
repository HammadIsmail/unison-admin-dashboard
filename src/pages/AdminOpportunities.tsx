import { useState, useEffect, useCallback } from "react";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, Trash2, ChevronLeft, ChevronRight,
  Briefcase, Building2, MapPin, Calendar, ExternalLink,
  ShieldAlert, Clock, CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Opportunity {
  id: string;
  title: string;
  company: {
    name: string;
  } | string;
  location: string;
  type: string;
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

interface OpportunityDetail extends Opportunity {
  description: string;
  requirements: string;
  is_remote: boolean;
  apply_link: string;
  deadline: string;
  required_skills: string[];
}

const PAGE_SIZE = 10;

export default function AdminOpportunitiesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<OpportunityDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const { toast } = useToast();

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<{ total: number; page: number; data: Opportunity[] }>(
        `/api/admin/opportunities?page=${page}&limit=${PAGE_SIZE}&search=${encodeURIComponent(search)}`
      );
      console.log("Admin Opportunities Data:", res.data);
      setData(res.data || []);
      setTotal(res.total || 0);
    } catch {
      toast({ title: "Failed to load opportunities", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [page, search, toast]);

  useEffect(() => {
    const debounce = setTimeout(fetchOpportunities, 300);
    return () => clearTimeout(debounce);
  }, [fetchOpportunities]);

  const fetchDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await apiClient.get<OpportunityDetail>(`/api/opportunities/${id}`);
      setDetail(res);
    } catch {
      toast({ title: "Failed to load details", variant: "destructive" });
      setSelectedId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (selectedId) {
      fetchDetail(selectedId);
    } else {
      setDetail(null);
    }
  }, [selectedId]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await apiClient.del(`/api/admin/opportunities/${deleteId}`);
      toast({ title: "Opportunity deleted", description: "The posting has been removed from the platform." });
      if (selectedId === deleteId) setSelectedId(null);
      fetchOpportunities();
    } catch {
      toast({ title: "Failed to delete opportunity", variant: "destructive" });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const columns: Column<Opportunity>[] = [
    {
      key: "title",
      label: "Opportunity",
      render: (item) => {
        const companyName = typeof item.company === 'string' ? item.company : item.company?.name || "System";
        return (
          <div className="flex flex-col py-1">
            <p className="text-sm font-semibold text-primary/90">{item.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Building2 className="h-3 w-3" /> {companyName}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "type",
      label: "Type",
      render: (item) => (
        <Badge variant="secondary" className="capitalize font-medium text-[10px] h-5">
          {item.type.replace("-", " ")}
        </Badge>
      ),
    },
    {
      key: "location",
      label: "Location",
      render: (item) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {item.location}
        </div>
      ),
    },
    {
      key: "poster",
      label: "Posted By",
      render: (item) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            {item.posted_by?.profile_picture && <AvatarImage src={item.posted_by.profile_picture} />}
            <AvatarFallback className="text-[8px]">{item.posted_by?.display_name?.[0] || "S"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-xs font-medium leading-none">{item.posted_by?.display_name || "System"}</span>
            <span className="text-[10px] text-muted-foreground">@{item.posted_by?.username || "admin"}</span>
          </div>
        </div>
      ),
    },
    {
      key: "posted_at",
      label: "Posted Date",
      render: (item) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
          <Calendar className="h-3 w-3" />
          {formatDate(item.posted_at)}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Moderation",
      render: (item) => (
        <Button
          size="sm"
          variant="ghost"
          className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
          onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); }}
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Opportunity Moderation</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage and moderate all platform job/internship postings.</p>
          </div>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, company..."
            className="pl-9 h-10 border-muted/60 focus-visible:ring-primary/20"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={data}
              onRowClick={(item) => setSelectedId(item.id)}
              emptyMessage="No opportunities found matching your criteria."
            />
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full uppercase tracking-wider">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 shadow-sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 shadow-sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Remove Opportunity"
        description="Are you sure you want to delete this opportunity? This action is permanent and will notify the original poster."
        confirmLabel={deleting ? "Deleting..." : "Confirm Removal"}
        variant="destructive"
        onConfirm={handleDelete}
      />

      <Sheet open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent className="sm:max-w-2xl p-0 gap-0">
          {detailLoading ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="space-y-2 pt-8">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          ) : detail ? (
            <div className="flex flex-col h-full">
              <SheetHeader className="p-6 bg-muted/30 border-b">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <Badge variant="outline" className="mb-2 uppercase tracking-tighter font-bold text-[10px]">
                      {detail.type.replace("-", " ")}
                    </Badge>
                    <SheetTitle className="text-2xl font-bold">{detail.title}</SheetTitle>
                    <SheetDescription className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4" /> {typeof detail.company === 'string' ? detail.company : detail.company?.name}
                    </SheetDescription>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => setDeleteId(detail.id)}>
                    <Trash2 className="h-4 w-4 mr-2" /> Delete Posting
                  </Button>
                </div>
              </SheetHeader>

              <ScrollArea className="flex-1">
                <div className="p-6 space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border bg-card shadow-sm space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                        <MapPin className="h-3.5 w-3.5" /> Location
                      </div>
                      <p className="text-sm font-semibold">{detail.location} {detail.is_remote && "(Remote)"}</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-card shadow-sm space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                        <Clock className="h-3.5 w-3.5" /> Deadline
                      </div>
                      <p className="text-sm font-semibold">{formatDate(detail.deadline)}</p>
                    </div>
                  </div>

                  <section className="space-y-3">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary" /> Job Description
                    </h3>
                    <div className="text-sm text-muted-foreground leading-relaxed bg-muted/20 p-4 rounded-xl border italic">
                      {detail.description}
                    </div>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> Key Requirements
                    </h3>
                    <div className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none">
                      {detail.requirements}
                    </div>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-sm font-bold">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {detail.required_skills?.map(skill => (
                        <Badge key={skill} variant="secondary" className="bg-primary/5 text-primary border-primary/10">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </section>

                  <Separator />

                  <section className="space-y-4">
                    <h3 className="text-sm font-bold">About the Poster</h3>
                    <div className="flex items-center gap-4 p-4 rounded-xl border bg-muted/10">
                      <Avatar className="h-12 w-12 border-2 border-background shadow-md">
                        {detail.posted_by?.profile_picture && <AvatarImage src={detail.posted_by.profile_picture} />}
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                          {detail.posted_by?.display_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-bold text-sm">{detail.posted_by?.display_name}</p>
                        <p className="text-xs text-muted-foreground">@{detail.posted_by?.username}</p>
                        <Badge variant="outline" className="mt-1.5 h-4 px-1.5 text-[9px] uppercase font-bold">
                          {detail.posted_by?.role}
                        </Badge>
                      </div>
                      {detail.apply_link && (
                        <Button variant="outline" size="sm" asChild className="gap-2">
                          <a href={detail.apply_link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3.5 w-3.5" /> Visit Link
                          </a>
                        </Button>
                      )}
                    </div>
                  </section>
                </div>
              </ScrollArea>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
