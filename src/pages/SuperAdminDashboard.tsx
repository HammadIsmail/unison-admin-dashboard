import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { superAdminApi } from "@/lib/super-admin.api";
import { SuperAdminStats } from "@/types/admin.types";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Building2,
  Users,
  GraduationCap,
  Briefcase,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const ROLE_COLORS = [
  "hsl(221, 83%, 53%)", // Alumni (Blue)
  "hsl(142, 76%, 36%)", // Students (Green)
  "hsl(38, 92%, 50%)",  // Partners (Amber)
  "hsl(262, 83%, 58%)", // Admins (Purple)
];

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await superAdminApi.getPlatformStats();
      setStats(data);
    } catch (err: any) {
      toast({
        title: "Error loading platform statistics",
        description: err.message || "Could not retrieve super-admin aggregate metrics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const roleData = stats
    ? [
        { name: "Alumni", value: stats.users_by_role?.alumni || 0 },
        { name: "Students", value: stats.users_by_role?.students || 0 },
        { name: "Partners", value: stats.users_by_role?.partners || 0 },
        { name: "Admins", value: stats.users_by_role?.admins || 0 },
      ]
    : [];

  const tenantStatusData = stats
    ? [
        { name: "Active", count: stats.active_tenants },
        { name: "Suspended", count: stats.suspended_tenants },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Platform Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Platform Oversight</h1>
            <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary font-medium text-xs">
              Super Admin
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Global management of universities, institutional tenants, and platform-wide user health.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchStats}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => navigate("/super-admin/tenants")}>
            <Building2 className="h-4 w-4 mr-1.5" />
            Manage Universities
          </Button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Universities"
          value={stats?.total_tenants ?? 0}
          icon={Building2}
          description={`${stats?.active_tenants ?? 0} active, ${stats?.suspended_tenants ?? 0} suspended`}
        />

        <StatsCard
          title="Total Platform Users"
          value={stats?.total_users ?? 0}
          icon={Users}
          description="Alumni, students, and staff"
        />

        <StatsCard
          title="Network Opportunities"
          value={stats?.total_opportunities ?? 0}
          icon={Briefcase}
          description="Jobs and internships posted"
        />

        <StatsCard
          title="Campus Events"
          value={stats?.total_events ?? 0}
          icon={Calendar}
          description="Across all university networks"
        />
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution by Role */}
        <ChartCard
          title="Platform User Distribution"
          subtitle="Breakdown of accounts by institutional role"
        >
          <div className="h-72 w-full flex items-center justify-center">
            {stats && stats.total_users > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {roleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={ROLE_COLORS[index % ROLE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-sm text-muted-foreground">No user data registered yet.</div>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t">
            {roleData.map((role, idx) => (
              <div key={role.name} className="flex flex-col items-center p-2 rounded-lg bg-muted/40 text-center">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ROLE_COLORS[idx] }} />
                  <span className="text-xs font-medium text-muted-foreground">{role.name}</span>
                </div>
                <span className="text-lg font-bold text-foreground">{role.value}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Tenant Status & Quick Management */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Institutional Health & Status</CardTitle>
            <CardDescription>Overview of university deployments and licensing states</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border bg-card/60 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Active Campuses</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.active_tenants ?? 0}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border bg-card/60 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Suspended Campuses</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.suspended_tenants ?? 0}</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-dashed border-border bg-muted/20 space-y-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                University Multi-Tenancy Architecture
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                UNISON isolates each university with strict multi-tenant boundaries. User data, announcements, and events are scoped to their respective tenant while enabling cross-campus alumni discoveries where permitted.
              </p>
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between"
                  onClick={() => navigate("/super-admin/tenants")}
                >
                  <span>Go to University Management</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
