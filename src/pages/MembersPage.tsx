import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StudentsTab from "@/components/members/StudentsTab";
import AlumniTab from "@/components/members/AlumniTab";
import PartnersTab from "@/components/members/PartnersTab";
import { Users, GraduationCap, Building2 } from "lucide-react";

export default function MembersPage() {
  const [activeTab, setActiveTab] = useState("students");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Member Management</h1>
        <p className="text-sm text-muted-foreground">
          View and manage all registered members of the UNISON network.
        </p>
      </div>

      <Tabs defaultValue="students" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-8 bg-muted/50 p-1">
          <TabsTrigger value="students" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            Students
          </TabsTrigger>
          <TabsTrigger value="alumni" className="gap-2">
            <Users className="h-4 w-4" />
            Alumni
          </TabsTrigger>
          <TabsTrigger value="partners" className="gap-2">
            <Building2 className="h-4 w-4" />
            Partners
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-0 outline-none">
          <StudentsTab />
        </TabsContent>

        <TabsContent value="alumni" className="mt-0 outline-none">
          <AlumniTab />
        </TabsContent>

        <TabsContent value="partners" className="mt-0 outline-none">
          <PartnersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
