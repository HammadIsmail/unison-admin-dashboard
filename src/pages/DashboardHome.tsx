import { Users, GraduationCap, UserCheck, Briefcase, Building2 } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const barData = [
  { month: "Jan", alumni: 120, students: 80 },
  { month: "Feb", alumni: 150, students: 95 },
  { month: "Mar", alumni: 180, students: 110 },
  { month: "Apr", alumni: 200, students: 130 },
  { month: "May", alumni: 240, students: 145 },
  { month: "Jun", alumni: 280, students: 160 },
];

const lineData = [
  { month: "Jul", users: 320 },
  { month: "Aug", users: 380 },
  { month: "Sep", users: 420 },
  { month: "Oct", users: 490 },
  { month: "Nov", users: 560 },
  { month: "Dec", users: 640 },
];

const pieData = [
  { name: "React", value: 35 },
  { name: "Python", value: 25 },
  { name: "Machine Learning", value: 20 },
  { name: "Cloud/AWS", value: 12 },
  { name: "UI/UX", value: 8 },
];

const PIE_COLORS = [
  "hsl(221, 83%, 53%)",
  "hsl(199, 89%, 48%)",
  "hsl(142, 76%, 36%)",
  "hsl(38, 92%, 50%)",
  "hsl(262, 83%, 58%)",
];

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back. Here's an overview of your network.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard title="Total Alumni" value="2,847" change="+12.5% from last month" changeType="positive" icon={Users} />
        <StatsCard title="Total Students" value="1,234" change="+8.2% from last month" changeType="positive" icon={GraduationCap} />
        <StatsCard title="Pending Accounts" value="23" change="5 new today" changeType="neutral" icon={UserCheck} />
        <StatsCard title="Opportunities" value="156" change="+3 this week" changeType="positive" icon={Briefcase} />
        <StatsCard title="Companies" value="89" change="+2 this month" changeType="positive" icon={Building2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Alumni vs Students" description="Monthly registration comparison">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-xs" tick={{ fill: "hsl(215, 16%, 47%)" }} />
              <YAxis className="text-xs" tick={{ fill: "hsl(215, 16%, 47%)" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="alumni" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="students" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Growth Trend" description="Total user growth over time">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fill: "hsl(215, 16%, 47%)" }} />
              <YAxis tick={{ fill: "hsl(215, 16%, 47%)" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Line type="monotone" dataKey="users" stroke="hsl(221, 83%, 53%)" strokeWidth={2} dot={{ fill: "hsl(221, 83%, 53%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Most Common Skills" description="Top skills across alumni network">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {pieData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
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
