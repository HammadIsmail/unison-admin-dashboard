import { useState, useEffect, useCallback } from "react";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, Trash2, ChevronLeft, ChevronRight, 
  Calendar, User, Tag, Clock, MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  date: string;
  hosted_by: string;
  host_username: string;
  [key: string]: any;
}

const PAGE_SIZE = 10;

export default function EventsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<{ total: number; page: number; data: Event[] }>(
        `/api/admin/events?page=${page}&limit=${PAGE_SIZE}&search=${encodeURIComponent(search)}`
      );

      setData(res.data || []);
      setTotal(res.total || 0);
    } catch {
      toast({ title: "Failed to load events", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [page, search, toast]);

  useEffect(() => {
    const debounce = setTimeout(fetchEvents, 300);
    return () => clearTimeout(debounce);
  }, [fetchEvents]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await apiClient.del(`/api/admin/events/${deleteId}`);
      toast({ title: "Event deleted", description: "The event has been removed from the platform." });
      fetchEvents();
    } catch {
      toast({ title: "Failed to delete event", variant: "destructive" });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const columns: Column<Event>[] = [
    {
      key: "title",
      label: "Event Information",
      render: (item: Event) => (
        <div className="flex flex-col py-1">
          <p className="text-sm font-bold leading-none mb-1.5">{item.title}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {formatDate(item.date)}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "hosted_by",
      label: "Organizer",
      render: (item: Event) => (
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
            {item.hosted_by.split(" ").map(n => n[0]).join("")}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold">{item.hosted_by}</span>
            <span className="text-[10px] text-muted-foreground font-mono">@{item.host_username}</span>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item: Event) => {
        const isPast = new Date(item.date) < new Date();
        return (
          <Badge variant={isPast ? "secondary" : "default"} className="text-[10px] uppercase font-bold px-1.5 py-0">
            {isPast ? "Past Event" : "Upcoming"}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      label: "Moderation",
      render: (item: Event) => (
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10 gap-2" 
          onClick={() => setDeleteId(item.id)}
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
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Event Moderation</h1>
            <p className="text-sm text-muted-foreground mt-1">{total} events listed on platform</p>
          </div>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search events..." 
            className="pl-9 h-10" 
            value={search} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setPage(1); }} 
          />
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
          ) : (
            <DataTable columns={columns} data={data} emptyMessage="No events found for moderation." />
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
        title="Delete Event"
        description="Are you sure you want to delete this event? This will remove it from all user feeds and cannot be undone."
        confirmLabel={deleting ? "Deleting..." : "Confirm Deletion"}
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
