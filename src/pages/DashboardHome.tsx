import { useEffect, useState } from "react";
import { 
  Users, GraduationCap, UserCheck, Briefcase, Building2,
  UserPlus, CheckCircle2, MessageSquare, RefreshCw, AlertCircle
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { apiClient } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: string;
  description: string;
  created_at: string;
}

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
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsData, activityData] = await Promise.all([
          apiClient.get<DashboardStats>("/api/admin/dashboard-stats"),
          apiClient.get<Activity[]>("/api/admin/recent-activity?limit=6")
        ]);
        setStats(statsData);
        setActivities(activityData);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))
            ) : activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground italic text-sm">
                No recent activity logged.
              </div>
            ) : (
              activities.map((item) => {
                const Icon = getActivityIcon(item.type);
                return (
                  <div key={item.id} className="flex items-start gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                    <div className={cn(
                      "p-2 rounded-full shrink-0",
                      getActivityColor(item.type)
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none">{item.description}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-bold">
                        {item.type.replace(/_/g, " ")}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap pt-0.5">
                      {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

function getActivityIcon(type: string) {
  switch (type) {
    case "USER_REGISTERED": return UserPlus;
    case "ACCOUNT_APPROVED": return CheckCircle2;
    case "OPPORTUNITY_POSTED": return Briefcase;
    case "PROFILE_UPDATED": return RefreshCw;
    case "ACCOUNT_REJECTED": return AlertCircle;
    default: return MessageSquare;
  }
}

function getActivityColor(type: string) {
  switch (type) {
    case "USER_REGISTERED": return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
    case "ACCOUNT_APPROVED": return "bg-green-500/10 text-green-600 dark:text-green-400";
    case "OPPORTUNITY_POSTED": return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
    case "PROFILE_UPDATED": return "bg-orange-500/10 text-orange-600 dark:text-orange-400";
    case "ACCOUNT_REJECTED": return "bg-destructive/10 text-destructive";
    default: return "bg-muted text-muted-foreground";
  }
}
