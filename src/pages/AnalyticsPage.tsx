import { useState, useEffect } from "react";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserSearchSelect, type UserOption } from "@/components/dashboard/UserSearchSelect";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiClient } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Network, Building2, TrendingUp, ArrowRight } from "lucide-react";

// Types for API responses
interface CentralityItem {
  alumni_id: string;
  display_name: string;
  connections_count: number;
  centrality_score: number;
  [key: string]: unknown;
}

interface CompanyItem {
  company: string;
  alumni_count: number;
}

interface SkillTrendsResponse {
  most_required_in_opportunities: string[];
  most_common_among_alumni: string[];
  gap: string[];
}

interface BatchItem {
  batch: string;
  total_alumni: number;
  top_companies: string[];
  top_roles: string[];
  avg_connections: number;
}

export default function AnalyticsPage() {
  // Shortest path state
  const [fromUserId, setFromUserId] = useState("");
  const [fromUserName, setFromUserName] = useState("");
  const [toUserId, setToUserId] = useState("");
  const [toUserName, setToUserName] = useState("");
  const [pathResult, setPathResult] = useState<string[] | null>(null);
  const [pathHops, setPathHops] = useState<number | null>(null);
  const [pathLoading, setPathLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<UserOption[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Data state
  const [centralityData, setCentralityData] = useState<CentralityItem[]>([]);
  const [companiesData, setCompaniesData] = useState<CompanyItem[]>([]);
  const [skillTrends, setSkillTrends] = useState<SkillTrendsResponse | null>(null);
  const [batchData, setBatchData] = useState<BatchItem[]>([]);
  const [loadingStates, setLoadingStates] = useState({
    centrality: true, companies: true, skills: true, batch: true,
  });

  // Fetch all data on mount
  useEffect(() => {
    apiClient.get<CentralityItem[]>("/api/network/centrality")
      .then(setCentralityData)
      .catch(() => {})
      .finally(() => setLoadingStates((s) => ({ ...s, centrality: false })));

    apiClient.get<CompanyItem[]>("/api/network/top-companies")
      .then(setCompaniesData)
      .catch(() => {})
      .finally(() => setLoadingStates((s) => ({ ...s, companies: false })));

    apiClient.get<SkillTrendsResponse>("/api/network/skill-trends")
      .then(setSkillTrends)
      .catch(() => {})
      .finally(() => setLoadingStates((s) => ({ ...s, skills: false })));

    apiClient.get<BatchItem[]>("/api/network/batch-analysis")
      .then(setBatchData)
      .catch(() => {})
      .finally(() => setLoadingStates((s) => ({ ...s, batch: false })));

    // Fetch users for shortest path dropdowns
    (async () => {
      setUsersLoading(true);
      try {
        const [alumniRes, studentsRes] = await Promise.allSettled([
          apiClient.get<{ data?: Array<{ id: string; username?: string; display_name: string }> }>("/api/admin/all-alumni?limit=500"),
          apiClient.get<{ data?: Array<{ id: string; username?: string; display_name: string }> }>("/api/admin/all-students?limit=500"),
        ]);
        const users: UserOption[] = [];
        if (alumniRes.status === "fulfilled" && alumniRes.value?.data) {
          alumniRes.value.data.forEach((u) => users.push({ 
            id: u.id, 
            username: u.username || u.display_name || "Unknown", 
            name: u.display_name || "" 
          }));
        }
        if (studentsRes.status === "fulfilled" && studentsRes.value?.data) {
          studentsRes.value.data.forEach((u) => users.push({ 
            id: u.id, 
            username: u.username || u.display_name || "Unknown", 
            name: u.display_name || "" 
          }));
        }
        setAllUsers(users);
      } catch {}
      setUsersLoading(false);
    })();
  }, []);

  const handleFindPath = async () => {
    if (!fromUserId || !toUserId) return;
    setPathLoading(true);
    setPathResult(null);
    setPathHops(null);
    try {
      const res = await apiClient.get<{ path: string[]; hops: number }>(
        `/api/network/shortest-path?from=${fromUserId}&to=${toUserId}`
      );
      setPathResult(res.path || []);
      setPathHops(res.hops ?? (res.path ? res.path.length - 1 : null));
    } catch {
      setPathResult(null);
      setPathHops(null);
    } finally {
      setPathLoading(false);
    }
  };

  // Prepare chart data
  const centralityChartData = centralityData.map((d) => ({
    name: d.display_name.split(" ").slice(-1)[0],
    connections: d.connections_count,
  }));

  const companiesChartData = companiesData.map((c) => ({
    name: c.company,
    count: c.alumni_count,
  }));

  // Build skill comparison data from the trends response
  const skillChartData = (() => {
    if (!skillTrends) return [];
    const allSkills = new Set([
      ...skillTrends.most_required_in_opportunities,
      ...skillTrends.most_common_among_alumni,
    ]);
    return Array.from(allSkills).slice(0, 8).map((skill) => ({
      skill,
      demand: skillTrends.most_required_in_opportunities.includes(skill) ? 80 : 30,
      supply: skillTrends.most_common_among_alumni.includes(skill) ? 75 : 25,
    }));
  })();

  const batchChartData = batchData.map((b) => ({
    batch: b.batch,
    count: b.total_alumni,
  }));

  // Centrality table columns
  const centralityColumns: Column<CentralityItem>[] = [
    { key: "display_name", label: "Name" },
    {
      key: "connections_count",
      label: "Connections",
      render: (item) => <Badge variant="secondary" className="font-mono">{item.connections_count}</Badge>,
    },
    {
      key: "centrality_score",
      label: "Score",
      render: (item) => <span className="text-sm">{item.centrality_score?.toFixed(2)}</span>,
    },
  ];

  // Batch summary stats
  const avgConnections = batchData.length
    ? (batchData.reduce((s, b) => s + b.avg_connections, 0) / batchData.length).toFixed(1)
    : "—";
  const topCompanyFromBatch = batchData.flatMap((b) => b.top_companies)[0] || "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Network Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Deep insights into your alumni network</p>
      </div>

      <Tabs defaultValue="influential" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="influential">Influential Alumni</TabsTrigger>
          <TabsTrigger value="path">Shortest Path</TabsTrigger>
          <TabsTrigger value="companies">Top Companies</TabsTrigger>
          <TabsTrigger value="skills">Skill Trends</TabsTrigger>
          <TabsTrigger value="batch">Batch Analysis</TabsTrigger>
        </TabsList>

        {/* Influential Alumni */}
        <TabsContent value="influential" className="space-y-6">
          {loadingStates.centrality ? (
            <Skeleton className="h-72 rounded-xl" />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Most Connected Alumni" description="By number of connections">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={centralityChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                    <Bar dataKey="connections" fill="hsl(221, 83%, 53%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
              <DataTable columns={centralityColumns} data={centralityData} emptyMessage="No centrality data" />
            </div>
          )}
        </TabsContent>

        {/* Shortest Path */}
        <TabsContent value="path" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Find Shortest Path</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <Label>From User</Label>
                  <UserSearchSelect users={allUsers} value={fromUserId} onChange={(id, name) => { setFromUserId(id); setFromUserName(name); }} placeholder="Select user..." loading={usersLoading} />
                </div>
                <div className="space-y-2">
                  <Label>To User</Label>
                  <UserSearchSelect users={allUsers} value={toUserId} onChange={(id, name) => { setToUserId(id); setToUserName(name); }} placeholder="Select user..." loading={usersLoading} />
                </div>
                <Button onClick={handleFindPath} disabled={!fromUserId || !toUserId || pathLoading}>
                  {pathLoading ? "Finding..." : "Find Path"}
                </Button>
              </div>

              {pathResult && pathResult.length > 0 && (
                <div className="mt-6 p-4 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-3">Path Found ({pathHops ?? pathResult.length - 1} hops):</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {pathResult.map((node, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Badge variant={i === 0 || i === pathResult.length - 1 ? "default" : "secondary"}>{node}</Badge>
                        {i < pathResult.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pathResult && pathResult.length === 0 && (
                <div className="mt-6 p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">No path found between these users.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Companies */}
        <TabsContent value="companies" className="space-y-6">
          {loadingStates.companies ? (
            <Skeleton className="h-96 rounded-xl" />
          ) : (
            <ChartCard title="Top Companies" description="Companies with most alumni">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={companiesChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 12 }} />
                  <YAxis tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                  <Bar dataKey="count" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </TabsContent>

        {/* Skill Trends */}
        <TabsContent value="skills" className="space-y-6">
          {loadingStates.skills ? (
            <Skeleton className="h-96 rounded-xl" />
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ChartCard title="Skill Demand vs Supply" description="Market analysis across top skills" className="lg:col-span-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={skillChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="skill" tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 11 }} />
                      <YAxis tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                      <Bar dataKey="demand" fill="hsl(var(--primary))" name="Demand (%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="supply" fill="hsl(var(--success))" name="Supply (%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-base">Market Gap Analysis</CardTitle>
                    <p className="text-xs text-muted-foreground">Skills with high demand but low talent supply</p>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    {skillTrends?.gap && skillTrends.gap.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {skillTrends.gap.map((s) => (
                          <Badge key={s} variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic text-center py-10">No significant gaps detected.</p>
                    )}
                    <div className="pt-4 border-t mt-auto">
                      <p className="text-xs font-medium mb-2 uppercase tracking-wider text-muted-foreground">Actionable Insight</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Encourage students to pick up {skillTrends?.gap?.[0] || "emerging"} technologies to align with current market requirements.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Batch Analysis */}
        <TabsContent value="batch" className="space-y-6">
          {loadingStates.batch ? (
            <Skeleton className="h-72 rounded-xl" />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatsCard title="Avg Connections" value={avgConnections} change="Per alumni member" icon={Network} />
                <StatsCard title="Top Company" value={topCompanyFromBatch} icon={Building2} />
                <StatsCard title="Total Batches" value={String(batchData.length)} change="Tracked batches" icon={TrendingUp} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Batch-wise Distribution" description="Alumni by batch">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={batchChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="batch" tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 11 }} />
                      <YAxis tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                      <Bar dataKey="count" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Batch Success Insights</CardTitle>
                    <p className="text-xs text-muted-foreground">Top companies & primary career roles</p>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-6">
                        {batchData.map((b) => (
                          <div key={b.batch} className="space-y-2 pb-4 border-b last:border-0 last:pb-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-bold">Class of {b.batch}</h4>
                              <span className="text-xs text-muted-foreground">{b.total_alumni} Alumni</span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-1.5">
                                <span className="text-[10px] text-muted-foreground uppercase font-semibold mr-1 mt-1 shrink-0">Companies:</span>
                                {b.top_companies.map((c) => (
                                  <Badge key={c} variant="secondary" className="text-[9px] h-4 px-1.5">{c}</Badge>
                                ))}
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                <span className="text-[10px] text-muted-foreground uppercase font-semibold mr-1 mt-1 shrink-0">Top Roles:</span>
                                {b.top_roles.map((r) => (
                                  <Badge key={r} variant="outline" className="text-[9px] h-4 px-1.5">{r}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
