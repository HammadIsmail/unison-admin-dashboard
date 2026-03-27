import { useState } from "react";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Network, Building2, TrendingUp, Users, ArrowRight } from "lucide-react";

// Mock data
const centralityData = [
  { id: "1", name: "Dr. Arun Mehta", connections: 145, field: "AI/ML", [Symbol.toPrimitive as unknown as string]: "" },
  { id: "2", name: "Neha Singh", connections: 132, field: "Cloud", [Symbol.toPrimitive as unknown as string]: "" },
  { id: "3", name: "Karthik Rajan", connections: 118, field: "Data Science", [Symbol.toPrimitive as unknown as string]: "" },
  { id: "4", name: "Pooja Reddy", connections: 105, field: "Product", [Symbol.toPrimitive as unknown as string]: "" },
  { id: "5", name: "Vikram Joshi", connections: 98, field: "DevOps", [Symbol.toPrimitive as unknown as string]: "" },
];

const topCompanies = [
  { name: "Google", count: 45 },
  { name: "Microsoft", count: 38 },
  { name: "Amazon", count: 32 },
  { name: "Flipkart", count: 28 },
  { name: "Infosys", count: 22 },
  { name: "TCS", count: 18 },
];

const skillTrends = [
  { skill: "React", demand: 85, supply: 65 },
  { skill: "Python", demand: 90, supply: 78 },
  { skill: "AWS", demand: 72, supply: 45 },
  { skill: "ML/AI", demand: 80, supply: 40 },
  { skill: "DevOps", demand: 68, supply: 50 },
  { skill: "SQL", demand: 60, supply: 70 },
];

interface CentralityItem {
  id: string;
  name: string;
  connections: number;
  field: string;
  [key: string]: unknown;
}

export default function AnalyticsPage() {
  const [fromUser, setFromUser] = useState("");
  const [toUser, setToUser] = useState("");
  const [pathResult, setPathResult] = useState<string[] | null>(null);

  const handleFindPath = () => {
    if (fromUser && toUser) {
      setPathResult([fromUser, "Dr. Arun Mehta", "Neha Singh", toUser]);
    }
  };

  const centralityColumns: Column<CentralityItem>[] = [
    { key: "name", label: "Name" },
    { key: "field", label: "Field" },
    {
      key: "connections",
      label: "Connections",
      render: (item) => (
        <Badge variant="secondary" className="font-mono">{item.connections}</Badge>
      ),
    },
  ];

  const centralityChartData = centralityData.map((d) => ({
    name: d.name.split(" ").slice(-1)[0],
    connections: d.connections,
  }));

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

        <TabsContent value="influential" className="space-y-6">
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
            <div>
              <DataTable columns={centralityColumns} data={centralityData as unknown as CentralityItem[]} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="path" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Find Shortest Path</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <Label>From User</Label>
                  <Input placeholder="Enter name or ID" value={fromUser} onChange={(e) => setFromUser(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>To User</Label>
                  <Input placeholder="Enter name or ID" value={toUser} onChange={(e) => setToUser(e.target.value)} />
                </div>
                <Button onClick={handleFindPath} disabled={!fromUser || !toUser}>Find Path</Button>
              </div>

              {pathResult && (
                <div className="mt-6 p-4 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-3">Path Found ({pathResult.length - 1} steps):</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {pathResult.map((node, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Badge variant={i === 0 || i === pathResult.length - 1 ? "default" : "secondary"}>
                          {node}
                        </Badge>
                        {i < pathResult.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies" className="space-y-6">
          <ChartCard title="Top Companies" description="Companies with most alumni">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={topCompanies}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="count" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <ChartCard title="Skill Demand vs Supply" description="Gap analysis across top skills">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={skillTrends}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="skill" tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="demand" fill="hsl(221, 83%, 53%)" name="Demand" radius={[4, 4, 0, 0]} />
                <Bar dataKey="supply" fill="hsl(142, 76%, 36%)" name="Supply" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="batch" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatsCard title="Avg Connections" value="12.4" change="Per alumni member" icon={Network} />
            <StatsCard title="Top Company" value="Google" change="45 alumni placed" icon={Building2} />
            <StatsCard title="Placement Rate" value="94%" change="+2.3% vs last year" changeType="positive" icon={TrendingUp} />
          </div>

          <ChartCard title="Batch-wise Distribution" description="Alumni by graduation year">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { batch: "2020", count: 120 },
                  { batch: "2021", count: 145 },
                  { batch: "2022", count: 168 },
                  { batch: "2023", count: 190 },
                  { batch: "2024", count: 210 },
                  { batch: "2025", count: 185 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="batch" tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="count" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
