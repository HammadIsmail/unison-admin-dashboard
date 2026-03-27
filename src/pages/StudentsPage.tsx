import { useState, useEffect, useCallback } from "react";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, Trash2, ChevronLeft, ChevronRight,
  Mail, Phone, Linkedin, Building2, Calendar, User, 
  Info, MapPin, ExternalLink, GraduationCap, BookOpen, Clock
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
import { cn } from "@/lib/utils";

interface Student {
  id: string;
  name?: string | null;
  display_name?: string;
  username?: string;
  email?: string;
  phone?: string | null;
  bio?: string | null;
  roll_number: string;
  semester: number;
  degree?: string;
  batch?: string;
  profile_picture?: string;
  registered_at?: string;
  [key: string]: any;
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
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
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
      render: (item) => {
        const displayName = item.name || item.display_name || item.username || "Unknown";
        return (
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setSelectedStudent(item)}
          >
            <Avatar className="h-9 w-9 border-2 border-transparent group-hover:border-primary/20 transition-all">
              {item.profile_picture && <AvatarImage src={item.profile_picture} />}
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {displayName.split(" ").filter(Boolean).map((n) => n[0]).join("") || "?"}
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
      render: (item) => <span className="text-muted-foreground">{item.email || "—"}</span>
    },
    { 
      key: "roll_number", 
      label: "Roll Number",
      render: (item) => <span className="font-mono text-xs">{item.roll_number}</span>
    },
    {
      key: "semester",
      label: "Semester",
      render: (item) => <Badge variant="secondary" className="font-mono">S-{item.semester}</Badge>,
    },
    { key: "degree", label: "Degree" },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setSelectedStudent(item)}>
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

      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0">
          <DialogHeader className="sr-only">
            <DialogTitle>{selectedStudent?.name || "Student Profile"}</DialogTitle>
            <DialogDescription>Detailed information about the student member.</DialogDescription>
          </DialogHeader>
          <div className="h-32 bg-gradient-to-r from-blue-500/20 via-blue-500/10 to-transparent relative">
            <div className="absolute -bottom-12 left-6">
              <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                {selectedStudent?.profile_picture && <AvatarImage src={selectedStudent.profile_picture} />}
                <AvatarFallback className="bg-blue-500/10 text-blue-600 text-2xl font-bold">
                  {(selectedStudent?.name || selectedStudent?.display_name || selectedStudent?.username || "?")
                    .split(" ").filter(Boolean).map(n => n[0]).join("") || "?"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          
          <div className="pt-14 pb-8 px-8 space-y-6">
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold tracking-tight">{selectedStudent?.name || selectedStudent?.display_name || selectedStudent?.username}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-mono text-muted-foreground">@{selectedStudent?.username}</span>
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
                        <span className="truncate">{selectedStudent?.email}</span>
                      </div>
                      {selectedStudent?.phone && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span>{selectedStudent.phone}</span>
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
                          <p className="text-sm font-semibold">{selectedStudent?.degree || "Undergraduate"}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Batch {selectedStudent?.batch || "N/A"}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Roll Number</p>
                          <p className="text-xs font-mono mt-0.5">{selectedStudent?.roll_number}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Current Semester</p>
                          <p className="text-xs mt-0.5 font-semibold">{selectedStudent?.semester || "?"}th Semester</p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="space-y-6">
                  {selectedStudent?.bio && (
                    <section>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">About</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed italic">
                        "{selectedStudent.bio}"
                      </p>
                    </section>
                  )}

                  <section>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Profile Statistics</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs p-2 bg-muted/50 rounded-lg">
                        <span className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> Registered</span>
                        <span className="font-medium">{selectedStudent?.registered_at ? new Date(selectedStudent.registered_at).toLocaleDateString() : "New Account"}</span>
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
