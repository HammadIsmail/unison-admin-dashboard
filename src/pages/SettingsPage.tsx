import { Card, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your admin preferences</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Settings className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Settings</h3>
          <p className="text-sm text-muted-foreground mt-1 text-center max-w-sm">
            Platform settings and configuration options will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
