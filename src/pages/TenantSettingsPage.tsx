import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { adminApi } from "@/lib/admin.api";
import { TenantSettings } from "@/types/admin.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Building2,
  Mail,
  Image,
  Globe,
  Plus,
  X,
  Save,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

export default function TenantSettingsPage() {
  const { tenant: authTenant, setTenant } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<TenantSettings | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [domains, setDomains] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState("");

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getCurrentTenantSettings();
      setSettings(data);
      setName(data.name || "");
      setContactEmail(data.contact_email || "");
      setLogoUrl(data.logo_url || "");
      setDomains(data.allowed_email_domains || []);
    } catch (err: any) {
      toast({
        title: "Error loading settings",
        description: err.message || "Failed to fetch university settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleAddDomain = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newDomain.trim().toLowerCase().replace(/^@/, "");
    if (!trimmed) return;

    if (domains.includes(trimmed)) {
      toast({
        title: "Duplicate Domain",
        description: `Domain "${trimmed}" is already in the allowed list`,
        variant: "destructive",
      });
      return;
    }

    setDomains([...domains, trimmed]);
    setNewDomain("");
  };

  const handleRemoveDomain = (domainToRemove: string) => {
    setDomains(domains.filter((d) => d !== domainToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "University name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const updated = await adminApi.updateCurrentTenantSettings({
        name: name.trim(),
        contact_email: contactEmail.trim() || undefined,
        logo_url: logoUrl.trim() || undefined,
        allowed_email_domains: domains,
      });

      setSettings(updated);
      // Update Auth context tenant branding if available
      if (setTenant) {
        setTenant({
          id: updated.id,
          name: updated.name,
          slug: updated.slug,
          logo_url: updated.logo_url || null,
        });
      }

      toast({
        title: "Settings Saved",
        description: "University tenant information updated successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Save Failed",
        description: err.message || "Could not update university settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">University Settings</h1>
            {settings?.status === "active" ? (
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 bg-emerald-500/10">
                Active Tenant
              </Badge>
            ) : (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Suspended
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Configure institutional profile, branding, and allowed email domains for alumni and student onboarding.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSettings} disabled={loading} className="self-start sm:self-auto">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Institutional Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Institutional Identity
            </CardTitle>
            <CardDescription>
              Basic details and unique tenant identifier assigned to your university on the UNISON platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tenant-name">University / Campus Name</Label>
                <Input
                  id="tenant-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. FAST National University - Islamabad"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenant-slug">Tenant Slug (Identifier)</Label>
                <Input
                  id="tenant-slug"
                  value={settings?.slug || ""}
                  disabled
                  className="bg-muted font-mono text-xs cursor-not-allowed"
                />
                <p className="text-[11px] text-muted-foreground">
                  Unique immutable system code used in multi-tenant API routing and domain resolution.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-email">Institutional Contact / Support Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contact-email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="admin@university.edu.pk"
                  className="pl-9"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Inquiries from students, pending alumni, and support requests will be directed here.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Branding & Logo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Image className="h-5 w-5 text-primary" />
              University Branding & Logo
            </CardTitle>
            <CardDescription>
              Custom visual branding displayed on alumni registration pages, dashboards, and navigation bars.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="w-24 h-24 rounded-xl border border-dashed border-border bg-muted/40 flex items-center justify-center overflow-hidden flex-shrink-0">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={name}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <Building2 className="h-10 w-10 text-muted-foreground/40" />
                )}
              </div>

              <div className="flex-1 space-y-2 w-full">
                <Label htmlFor="logo-url">Logo Image URL</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="logo-url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="pl-9"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Provide a direct HTTPS link to a PNG, SVG, or high-res JPG. Recommended size: 256x256 transparent background.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Allowed Email Domains */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Allowed Email Domains
            </CardTitle>
            <CardDescription>
              Institutional email domain suffixes (e.g. <code>nu.edu.pk</code>) permitted for registration and verification under this university.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="e.g. isb.nu.edu.pk (without @)"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddDomain();
                    }
                  }}
                />
              </div>
              <Button type="button" variant="secondary" onClick={() => handleAddDomain()}>
                <Plus className="h-4 w-4 mr-1" />
                Add Domain
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {domains.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No domain restrictions currently enforced. Students and alumni can register using any email domain.
                </p>
              ) : (
                domains.map((domain) => (
                  <Badge
                    key={domain}
                    variant="secondary"
                    className="px-3 py-1 text-sm flex items-center gap-1.5 bg-secondary/70 hover:bg-secondary"
                  >
                    <span>@{domain}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDomain(domain)}
                      className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="submit" disabled={saving} className="px-6">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save University Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
