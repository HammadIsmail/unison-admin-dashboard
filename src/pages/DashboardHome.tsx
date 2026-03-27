import { useEffect, useState } from "react";
import { Users, GraduationCap, UserCheck, Briefcase, Building2 } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { apiClient } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  total_alumni: number;
  total_students: number;
  pending_accounts: number;
  total_opportunities: number;
  total_companies: number;
  most_common_skills: string[];
}

const PIE_COLORS = [
  "hsl(221, 83%, 53%)",
  "hsl(199, 89%, 48%)",
  "hsl(142, 76%, 36%)",
  "hsl(38, 92%, 50%)",
  "hsl(262, 83%, 58%)",
];

const lineData = [
  { month: "Jul", users: 320 },
  { month: "Aug", users: 380 },
  { month: "Sep", users: 420 },
  { month: "Oct", users: 490 },
  { month: "Nov", users: 560 },
  { month: "Dec", users: 640 },
];

export default function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<DashboardStats>("/api/admin/dashboard-stats")
      .then(setStats)
      .catch(() => console.error("Failed to load dashboard stats"))
      .finally(() => setLoading(false));
  }, []);

  const barData = stats ? [
    { label: "Alumni", count: stats.total_alumni },
    { label: "Students", count: stats.total_students },
  ] : [];

  const pieData = stats?.most_common_skills?.map((skill, i) => ({
    name: skill,
    value: Math.max(30 - i * 5, 5),
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back. Here's an overview of your network.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))
        ) : (
          <>
            <StatsCard title="Total Alumni" value={String(stats?.total_alumni ?? 0)} icon={Users} />
            <StatsCard title="Total Students" value={String(stats?.total_students ?? 0)} icon={GraduationCap} />
            <StatsCard title="Pending Accounts" value={String(stats?.pending_accounts ?? 0)} icon={UserCheck} />
            <StatsCard title="Opportunities" value={String(stats?.total_opportunities ?? 0)} icon={Briefcase} />
            <StatsCard title="Companies" value={String(stats?.total_companies ?? 0)} icon={Building2} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Alumni vs Students" description="Total count comparison">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="label" tick={{ fill: "hsl(215, 16%, 47%)" }} />
              <YAxis tick={{ fill: "hsl(215, 16%, 47%)" }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="count" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Growth Trend" description="Total user growth over time">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fill: "hsl(215, 16%, 47%)" }} />
              <YAxis tick={{ fill: "hsl(215, 16%, 47%)" }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
              <Line type="monotone" dataKey="users" stroke="hsl(221, 83%, 53%)" strokeWidth={2} dot={{ fill: "hsl(221, 83%, 53%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Most Common Skills" description="Top skills across alumni network">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                {pieData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {pieData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Recent Activity" description="Latest platform events" className="lg:col-span-2">
          <div className="space-y-3">
            {[
              { action: "New alumni registered", user: "Sarah Chen", time: "2 min ago" },
              { action: "Account approved", user: "John Smith", time: "15 min ago" },
              { action: "New opportunity posted", user: "TechCorp", time: "1 hour ago" },
              { action: "Student registered", user: "Alex Kumar", time: "2 hours ago" },
              { action: "Profile updated", user: "Maria Garcia", time: "3 hours ago" },
              { action: "New company added", user: "InnovateTech", time: "5 hours ago" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.user}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
