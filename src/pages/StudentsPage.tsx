import { useState, useMemo } from "react";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  semester: string;
  [key: string]: unknown;
}

const mockStudents: Student[] = Array.from({ length: 30 }, (_, i) => ({
  id: String(i + 1),
  name: ["Ravi Kumar", "Meera Jain", "Suresh Babu", "Fatima Khan", "Arjun Pillai"][i % 5],
  email: `student${i + 1}@unison.edu`,
  rollNumber: `UN${String(2024000 + i + 1)}`,
  semester: `Semester ${(i % 8) + 1}`,
}));

const PAGE_SIZE = 10;

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [data, setData] = useState(mockStudents);
  const { toast } = useToast();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter((s) => s.name.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q));
  }, [search, data]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = () => {
    setData((prev) => prev.filter((s) => s.id !== deleteId));
    toast({ title: "Student deleted" });
    setDeleteId(null);
  };

  const columns: Column<Student>[] = [
    {
      key: "name",
      label: "Student",
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
    { key: "rollNumber", label: "Roll Number" },
    { key: "semester", label: "Semester" },
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
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} students enrolled</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search students..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      <DataTable columns={columns} data={pageData} emptyMessage="No students found" />

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
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
