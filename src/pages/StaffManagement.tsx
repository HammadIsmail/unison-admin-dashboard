import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, UserPlus, Trash2, Loader2, Mail, User } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface StaffMember {
  id: string;
  username: string;
  display_name: string;
  role: string;
  email: string;
  profile_picture?: string;
}

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Create Staff Form State
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    display_name: "",
    role: "moderator",
  });

  // Delete Confirmation State
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);

  const { toast } = useToast();

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<StaffMember[]>("/api/admin/staff");
      setStaff(res);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch staff list.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post("/api/admin/staff", formData);
      toast({ title: "Success", description: "New staff member added successfully." });
      setIsCreateModalOpen(false);
      setFormData({ email: "", password: "", username: "", display_name: "", role: "moderator" });
      fetchStaff();
    } catch (error) {
      toast({ title: "Error", description: "Failed to add staff member.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!staffToDelete) return;
    try {
      await apiClient.del(`/api/admin/staff/${staffToDelete.id}`);
      toast({ title: "Success", description: "Staff member removed." });
      setStaff(prev => prev.filter(s => s.id !== staffToDelete.id));
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove staff member.", variant: "destructive" });
    } finally {
      setStaffToDelete(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-gradient-to-br from-primary/5 to-background p-8 rounded-2xl border border-primary/10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage administrators and moderators for the UNISON platform.</p>
          </div>
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="h-12 px-8 gap-2 shadow-xl shadow-primary/10 hover:shadow-primary/20 transition-all font-bold">
              <UserPlus className="h-4 w-4" /> Create Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new administrative account.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateStaff} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="display_name">Full Name</Label>
                <Input
                  id="display_name"
                  placeholder="e.g. John Doe"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(val) => setFormData({ ...formData, role: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@unison.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Initial Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Account
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-primary/10 overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-xl">Staff Directory</CardTitle>
          <CardDescription>A list of all current administrators and moderators.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Staff Member</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-10 w-40 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-5 w-48 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-6 w-20 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell className="text-right"><div className="h-8 w-8 ml-auto bg-muted animate-pulse rounded" /></TableCell>
                    </TableRow>
                  ))
                ) : staff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      No staff members found.
                    </TableCell>
                  </TableRow>
                ) : (
                  staff.map((member) => (
                    <TableRow key={member.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden">
                            {member.profile_picture ? (
                              <img src={member.profile_picture} alt={member.display_name} className="h-full w-full object-cover" />
                            ) : (
                              <User className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{member.display_name}</p>
                            <p className="text-xs text-muted-foreground italic">@{member.username}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {member.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.role === "admin" ? "default" : "secondary"} className="capitalize font-bold tracking-tight">
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setStaffToDelete(member)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!staffToDelete} onOpenChange={(open) => !open && setStaffToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{staffToDelete?.display_name}</strong> from the staff team. 
              They will no longer have access to the admin dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStaff} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove Staff Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
