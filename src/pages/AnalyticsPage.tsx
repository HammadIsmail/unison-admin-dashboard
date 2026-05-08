import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { subDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { apiClient } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area, PieChart, Pie, Cell, RadialBarChart, RadialBar,
} from "recharts";
import { 
  MessageSquare, Users, UserPlus, GraduationCap, 
  TrendingUp, Award, RefreshCw, Layers, BrainCircuit 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DatePickerWithRange } from "@/components/dashboard/DateRangePicker";
import { cn } from "@/lib/utils";

// Types for the advanced analytics response
interface SkillGapItem {
  skill: string;
  demand: number;
  supply: number;
  gap: number;
  priority: "High" | "Medium" | "Low";
}

interface GrowthTrendItem {
  month: string;
  signups: number;
}

interface EngagementMetrics {
  messages_last_30_days: number;
  active_conversations: number;
  connections_activity: number;
}

interface DepartmentAnalysis {
  degree: string;
  student_count: number;
  top_skills: string[];
  [key: string]: unknown;
}

interface MentorshipImpact {
  active_mentors: number;
  mentored_students: number;
  interaction_density: number;
}

interface AdvancedAnalyticsResponse {
  skill_gap: SkillGapItem[];
  growth_trends: GrowthTrendItem[];
  engagement_metrics: EngagementMetrics;
  departmental_analysis: DepartmentAnalysis[];
  curriculum_alignment: { overall_alignment_score: number };
  mentorship_impact: MentorshipImpact;
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const { data, isLoading, isError, refetch, isFetching } = useQuery<AdvancedAnalyticsResponse>({
    queryKey: ["advanced-analytics", dateRange],
    queryFn: () => {
      let url = "/api/admin/advanced-analytics";
      if (dateRange?.from) {
        const from = format(dateRange.from, "yyyy-MM-dd");
        const to = dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : from;
        url += `?from=${from}&to=${to}`;
      }
      return apiClient.get<AdvancedAnalyticsResponse>(url);
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive">
          <BrainCircuit className="h-10 w-10" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold">Failed to load analytics</h3>
          <p className="text-sm text-muted-foreground">There was an error fetching the data from the server.</p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className={cn("mr-2 h-4 w-4", isFetching && "animate-spin")} />
          Try Again
        </Button>
      </div>
    );
  }

  const {
    skill_gap,
    growth_trends,
    engagement_metrics,
    departmental_analysis,
    curriculum_alignment,
    mentorship_impact,
  } = data;

  // Department Table Columns
  const departmentColumns: Column<DepartmentAnalysis>[] = [
    { key: "degree", label: "Degree Program" },
    { 
      key: "student_count", 
      label: "Students",
      render: (item) => <Badge variant="secondary" className="font-mono">{item.student_count}</Badge>
    },
    { 
      key: "top_skills", 
      label: "Top Skills",
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.top_skills.map((skill) => (
            <Badge key={skill} variant="outline" className="text-[10px] py-0">{skill}</Badge>
          ))}
        </div>
      )
    },
  ];

  // Gauge Data
  const gaugeData = [
    {
      name: "Alignment",
      value: curriculum_alignment.overall_alignment_score,
      fill: "hsl(var(--primary))",
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Executive Analytics
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Actionable insights and institutional performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            className="shadow-sm hover:shadow-md transition-all duration-300 h-10"
            disabled={isFetching}
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", isFetching && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Bento Box Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard
          title="Messages"
          value={engagement_metrics.messages_last_30_days.toLocaleString()}
          change="+12% from last month"
          icon={MessageSquare}
          className="xl:col-span-1 animate-in fade-in slide-in-from-bottom-4 duration-500"
        />
        <StatsCard
          title="Active Chats"
          value={engagement_metrics.active_conversations.toString()}
          change="+5 active today"
          icon={Users}
          className="xl:col-span-1 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75"
        />
        <StatsCard
          title="Connections"
          value={engagement_metrics.connections_activity.toString()}
          change="+18 new requests"
          icon={UserPlus}
          className="xl:col-span-1 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100"
        />
        <StatsCard
          title="Mentors"
          value={mentorship_impact.active_mentors.toString()}
          change="Available for students"
          icon={Award}
          className="xl:col-span-1 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150"
        />
        <StatsCard
          title="Mentored"
          value={mentorship_impact.mentored_students.toString()}
          change="Total student impact"
          icon={GraduationCap}
          className="xl:col-span-1 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200"
        />
        <StatsCard
          title="Density"
          value={mentorship_impact.interaction_density.toString()}
          change="Interactions / week"
          icon={Layers}
          className="xl:col-span-1 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Growth Trends */}
        <Card className="lg:col-span-8 shadow-sm border-muted/50 overflow-hidden hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold">Growth Trends</CardTitle>
              <CardDescription>Monthly signups and platform expansion</CardDescription>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growth_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/30" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      borderColor: "hsl(var(--border))",
                      borderRadius: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="signups" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorSignups)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Alignment Gauge */}
        <Card className="lg:col-span-4 shadow-sm border-muted/50 hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Curriculum Alignment</CardTitle>
            <CardDescription>Overall industry-academic sync</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-2">
            <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  innerRadius="70%" 
                  outerRadius="100%" 
                  data={gaugeData} 
                  startAngle={180} 
                  endAngle={0}
                >
                  <RadialBar
                    background
                    dataKey="value"
                    cornerRadius={30}
                    animationDuration={1500}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                <span className="text-5xl font-extrabold tracking-tighter">{curriculum_alignment.overall_alignment_score}%</span>
                <span className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Alignment Score</span>
              </div>
            </div>
            <div className="w-full mt-4 p-4 bg-muted/30 rounded-xl border border-muted/50">
              <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                \"This score reflects how well the current university curriculum matches the industry skills demanded by alumni companies.\"
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Skill Gap Analysis */}
        <Card className="lg:col-span-7 shadow-sm border-muted/50 hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Skill Demand vs. Supply</CardTitle>
            <CardDescription>Gap analysis for top technical competencies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={skill_gap} 
                  margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
                  barGap={8}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/30" />
                  <XAxis 
                    dataKey="skill" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      borderColor: "hsl(var(--border))",
                      borderRadius: "12px",
                      fontSize: "12px"
                    }} 
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
                  <Bar 
                    dataKey="demand" 
                    name="Demand" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]} 
                    animationDuration={1500}
                  />
                  <Bar 
                    dataKey="supply" 
                    name="Supply" 
                    fill="hsl(var(--info))" 
                    radius={[4, 4, 0, 0]} 
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Departmental Analysis */}
        <Card className="lg:col-span-5 shadow-sm border-muted/50 hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Departmental Breakdown</CardTitle>
            <CardDescription>Student distribution and expertise areas</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable 
              columns={departmentColumns} 
              data={departmental_analysis} 
              emptyMessage="No departmental data available" 
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Skeleton className="lg:col-span-8 h-[400px] rounded-xl" />
        <Skeleton className="lg:col-span-4 h-[400px] rounded-xl" />
        <Skeleton className="lg:col-span-7 h-[450px] rounded-xl" />
        <Skeleton className="lg:col-span-5 h-[450px] rounded-xl" />
      </div>
    </div>
  );
}
