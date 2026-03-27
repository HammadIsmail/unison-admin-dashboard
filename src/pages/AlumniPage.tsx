import { useState, useMemo } from "react";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Alumni {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  [key: string]: unknown;
}

const mockAlumni: Alumni[] = Array.from({ length: 42 }, (_, i) => ({
  id: String(i + 1),
  name: ["Arun Mehta", "Neha Singh", "Karthik Rajan", "Pooja Reddy", "Amit Shah", "Divya Nair", "Vikram Joshi"][i % 7],
  email: `user${i + 1}@example.com`,
  company: ["Google", "Microsoft", "Amazon", "Flipkart", "Infosys", "TCS", "Wipro"][i % 7],
  role: ["SDE", "Product Manager", "Data Scientist", "Designer", "DevOps Engineer"][i % 5],
}));

const PAGE_SIZE = 10;

export default function AlumniPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [data, setData] = useState(mockAlumni);
  const { toast } = useToast();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter((a) => a.name.toLowerCase().includes(q) || a.company.toLowerCase().includes(q) || a.email.toLowerCase().includes(q));
  }, [search, data]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = () => {
    setData((prev) => prev.filter((a) => a.id !== deleteId));
    toast({ title: "User deleted" });
    setDeleteId(null);
  };

  const columns: Column<Alumni>[] = [
    {
      key: "name",
      label: "Profile",
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
    { key: "company", label: "Company" },
    { key: "role", label: "Role" },
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
          <h1 className="text-2xl font-bold tracking-tight">Alumni</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} alumni members</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search alumni..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      <DataTable columns={columns} data={pageData} emptyMessage="No alumni found" />

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
        title="Delete Alumni"
        description="This action cannot be undone. The user account will be permanently removed."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
