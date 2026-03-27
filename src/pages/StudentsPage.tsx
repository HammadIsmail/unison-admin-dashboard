import { useState, useEffect, useCallback } from "react";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api";

interface Student {
  id: string;
  display_name: string;
  roll_number: string;
  semester: number;
  profile_picture?: string;
  [key: string]: unknown;
}

const PAGE_SIZE = 10;

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<{ total: number; page: number; data: Student[] }>(
        `/api/admin/all-students?page=${page}&limit=${PAGE_SIZE}&search=${encodeURIComponent(search)}`
      );
      setData(res.data || []);
      setTotal(res.total || 0);
    } catch {
      toast({ title: "Failed to load students", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const debounce = setTimeout(fetchStudents, 300);
    return () => clearTimeout(debounce);
  }, [fetchStudents]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await apiClient.del(`/api/admin/remove-account/${deleteId}`);
      toast({ title: "Student deleted" });
      fetchStudents();
    } catch {
      toast({ title: "Failed to delete student", variant: "destructive" });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const columns: Column<Student>[] = [
    {
      key: "display_name",
      label: "Student",
      render: (item) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            {item.profile_picture && <AvatarImage src={item.profile_picture} />}
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {item.display_name?.split(" ").map((n) => n[0]).join("") || "?"}
            </AvatarFallback>
          </Avatar>
          <p className="text-sm font-medium">{item.display_name}</p>
        </div>
      ),
    },
    { key: "roll_number", label: "Roll Number" },
    {
      key: "semester",
      label: "Semester",
      render: (item) => <span>Semester {item.semester}</span>,
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Students</h1>
          <p className="text-sm text-muted-foreground mt-1">{total} students enrolled</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search students..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
      ) : (
        <DataTable columns={columns} data={data} emptyMessage="No students found" />
      )}

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
        title="Delete Student"
        description="This action cannot be undone. The student account will be permanently removed."
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
