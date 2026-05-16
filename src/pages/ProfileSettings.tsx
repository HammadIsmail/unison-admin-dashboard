import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiClient, getAuthToken } from "@/lib/api";
import {
  UserCog, Camera, Loader2, User, Save, RefreshCcw,
  Shield, Settings2, Mail, Lock, Eye, EyeOff
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface AdminProfile {
  username: string;
  display_name: string;
  profile_picture: string;
  role: string;
}

export default function ProfileSettingsPage() {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    username: "",
    display_name: "",
    profile_picture: "",
    role: "",
  });

  const [newProfilePic, setNewProfilePic] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Security & Password State
  const [securityStep, setSecurityStep] = useState<"initial" | "otp" | "reset">("initial");
  const [otp, setOtp] = useState("");
  const [verifiedToken, setVerifiedToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Email Change State
  const [emailStep, setEmailStep] = useState<"view" | "request" | "verify">("view");
  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<AdminProfile>("/api/admin/profile");
      setProfile(res);
      setPreviewUrl(res.profile_picture);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load profile.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewProfilePic(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("username", profile.username);
      formData.append("display_name", profile.display_name);
      if (newProfilePic) {
        formData.append("profile_picture", newProfilePic);
      }

      const token = getAuthToken();
      const baseUrl = import.meta.env.VITE_NEXT_PUBLIC_API_BASE_URL;

      const response = await fetch(`${baseUrl}/api/admin/profile`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error("Update failed");

      const updatedData = await response.json();
      setProfile(updatedData);
      updateUser(updatedData);

      toast({ title: "Success", description: "Profile updated successfully." });
      setNewProfilePic(null);
    } catch (error) {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Email Change Handlers
  const handleRequestEmailChange = async () => {
    if (!newEmail || !newEmail.includes("@")) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await apiClient.patch("/api/admin/request-email-change", { new_email: newEmail });
      toast({ title: "OTP Sent", description: `A verification code has been sent to ${newEmail}` });
      setEmailStep("verify");
    } catch {
      toast({ title: "Request Failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyEmailChange = async () => {
    if (!emailOtp || emailOtp.length < 6) return;
    setSaving(true);
    try {
      const res = await apiClient.patch<{ message: string; new_email: string }>(
        "/api/admin/verify-email-change",
        { new_email: newEmail, otp: emailOtp }
      );
      updateUser({ email: res.new_email });
      toast({ title: "Email Updated", description: `Your email has been updated successfully to ${res.new_email}.` });
      setEmailStep("view");
      setNewEmail("");
      setEmailOtp("");
    } catch {
      toast({ title: "Verification Failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Password Security Handlers
  const handleSendOTP = async () => {
    if (!user?.email) return;
    setSaving(true);
    try {
      await apiClient.post("/api/auth/send-otp", { email: user.email, type: "forgot_password" });
      toast({ title: "OTP Sent", description: `A 6-digit code has been sent to ${user.email}` });
      setSecurityStep("otp");
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!user?.email || !otp) return;
    setSaving(true);
    try {
      const res = await apiClient.post<{ verified_token: string }>("/api/auth/verify-otp", {
        email: user.email,
        otp,
        type: "forgot_password",
      });
      setVerifiedToken(res.verified_token);
      setSecurityStep("reset");
    } catch {
      toast({ title: "Verification Failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!verifiedToken || newPassword.length < 8) {
      toast({ title: "Invalid Password", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await apiClient.post("/api/auth/reset-password", {
        verified_token: verifiedToken,
        new_password: newPassword,
      });
      toast({ title: "Password Updated", description: "Your password has been reset successfully." });
      setSecurityStep("initial");
      setOtp("");
      setVerifiedToken("");
      setNewPassword("");
    } catch {
      toast({ title: "Update Failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">Loading your settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-gradient-to-br from-primary/5 to-background p-8 rounded-3xl border border-primary/10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <UserCog className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your profile, security, and interface preferences.</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md mb-8 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="profile" className="rounded-lg gap-2 data-[state=active]:shadow-md">
            <User className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg gap-2 data-[state=active]:shadow-md">
            <Shield className="h-4 w-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="preferences" className="rounded-lg gap-2 data-[state=active]:shadow-md">
            <Settings2 className="h-4 w-4" /> Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1 border-primary/10 h-fit overflow-hidden">
              <div className="p-8 text-center bg-muted/20">
                <div className="relative mx-auto w-32 h-32 mb-6 group">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-background shadow-xl bg-muted flex items-center justify-center">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <label htmlFor="avatar-upload" className="absolute bottom-1 right-1 p-2.5 bg-primary text-primary-foreground rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform ring-4 ring-background">
                    <Camera className="h-4 w-4" />
                    <input id="avatar-upload" type="file" hidden accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
                <h2 className="text-xl font-bold tracking-tight">{profile.display_name}</h2>
                <p className="text-sm text-muted-foreground mt-1">@{profile.username}</p>
                <div className="mt-4">
                  <Badge variant={profile.role === "admin" ? "default" : "secondary"} className="capitalize px-4 py-1 font-bold">
                    {profile.role}
                  </Badge>
                </div>
              </div>
              <div className="p-6 border-t bg-muted/5">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">{user?.email}</span>
                </div>
              </div>
            </Card>

            <Card className="lg:col-span-2 border-primary/10">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Modify how you appear to other staff members and users.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Display Name</Label>
                      <Input
                        id="edit-name"
                        value={profile.display_name}
                        onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-username">Username</Label>
                      <Input
                        id="edit-username"
                        value={profile.username}
                        onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pt-4">
                    <Button type="submit" disabled={saving} className="gap-2 px-8 h-11">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Profile
                    </Button>
                    <Button type="button" variant="ghost" onClick={fetchProfile} className="gap-2 h-11">
                      <RefreshCcw className="h-4 w-4" /> Discard
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" /> Password & Security
                </CardTitle>
                <CardDescription>Securely update your account password.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {securityStep === "initial" && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20 text-sm flex gap-3">
                      <Shield className="h-5 w-5 shrink-0 mt-0.5" />
                      <p>For your security, we'll send a 6-digit verification code to your email before you can change your password.</p>
                    </div>
                    <Button onClick={handleSendOTP} disabled={saving} className="w-full h-11">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Request Password Reset
                    </Button>
                  </div>
                )}

                {securityStep === "otp" && (
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Verification Code</Label>
                      <div className="flex justify-center pt-2">
                        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setSecurityStep("initial")} className="flex-1 h-11">Back</Button>
                      <Button onClick={handleVerifyOTP} disabled={saving || otp.length < 6} className="flex-1 h-11">
                        {saving ? "Verifying..." : "Verify OTP"}
                      </Button>
                    </div>
                  </div>
                )}

                {securityStep === "reset" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="At least 8 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="h-11"
                        />
                        <button className="absolute right-3 top-3 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    <Button onClick={handleResetPassword} disabled={saving || newPassword.length < 8} className="w-full h-11">
                      {saving ? "Updating..." : "Update Password"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" /> Email Management
                </CardTitle>
                <CardDescription>Update your primary account email address.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {emailStep === "view" && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-muted/30 border border-dashed flex flex-col gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current Email</p>
                        <p className="text-lg font-bold truncate">{user?.email}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setEmailStep("request")} className="w-fit gap-2">
                        Change Email Address
                      </Button>
                    </div>
                  </div>
                )}

                {emailStep === "request" && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <Label>New Email Address</Label>
                      <Input placeholder="Enter new email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="h-11" />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => setEmailStep("view")}>Cancel</Button>
                      <Button onClick={handleRequestEmailChange} disabled={saving || !newEmail}>
                        {saving ? "Sending..." : "Send OTP"}
                      </Button>
                    </div>
                  </div>
                )}

                {emailStep === "verify" && (
                  <div className="space-y-4 text-center">
                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Verify New Email</Label>
                    <p className="text-xs text-muted-foreground">Code sent to <b>{newEmail}</b></p>
                    <div className="flex justify-center py-2">
                      <InputOTP maxLength={6} value={emailOtp} onChange={setEmailOtp}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    <div className="flex gap-2 justify-center pt-2">
                      <Button variant="ghost" onClick={() => setEmailStep("request")}>Back</Button>
                      <Button onClick={handleVerifyEmailChange} disabled={saving || emailOtp.length < 6}>
                        Update Email
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="animate-in slide-in-from-bottom-4 duration-500">
          <Card className="max-w-2xl border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-primary" /> Appearance Preferences
              </CardTitle>
              <CardDescription>Customize the look and feel of your admin dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border">
                <div className="space-y-0.5">
                  <Label className="text-base">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Toggle between light and dark visual themes.</p>
                </div>
                <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
