import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import {
  User,
  Shield,
  Settings2,
  Mail,
  Smartphone,
  BadgeCheck,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const [securityStep, setSecurityStep] = useState<"initial" | "otp" | "reset">("initial");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifiedToken, setVerifiedToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Email Change State
  const [emailStep, setEmailStep] = useState<"view" | "request" | "verify">("view");
  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");

  const handleRequestEmailChange = async () => {
    if (!newEmail || !newEmail.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      await apiClient.patch("/api/admin/request-email-change", { new_email: newEmail });
      toast({
        title: "OTP Sent",
        description: `A verification code has been sent to ${newEmail}`,
      });
      setEmailStep("verify");
    } catch (error) {
      toast({
        title: "Request Failed",
        description: "Failed to initiate email change. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailChange = async () => {
    if (!emailOtp || emailOtp.length < 6) return;
    setLoading(true);
    try {
      const res = await apiClient.patch<{ message: string; new_email: string }>(
        "/api/admin/verify-email-change", 
        {
          new_email: newEmail,
          otp: emailOtp,
        }
      );
      
      // Update local context and storage
      updateUser({ email: res.new_email });
      
      toast({
        title: "Email Updated",
        description: `Your email has been updated successfully to ${res.new_email}.`,
      });
      
      setEmailStep("view");
      setNewEmail("");
      setEmailOtp("");
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Invalid or expired OTP.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      await apiClient.post("/api/auth/send-otp", {
        email: user.email,
        type: "forgot_password",
      });
      toast({
        title: "OTP Sent",
        description: `A 6-digit code has been sent to ${user.email}`,
      });
      setSecurityStep("otp");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!user?.email || !otp) return;
    setLoading(true);
    try {
      const res = await apiClient.post<{ verified_token: string }>("/api/auth/verify-otp", {
        email: user.email,
        otp,
        type: "forgot_password",
      });
      setVerifiedToken(res.verified_token);
      setSecurityStep("reset");
      toast({
        title: "OTP Verified",
        description: "Please set your new password.",
      });
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Invalid or expired OTP.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!verifiedToken || newPassword.length < 8) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      await apiClient.post("/api/auth/reset-password", {
        verified_token: verifiedToken,
        new_password: newPassword,
      });
      toast({
        title: "Password Updated",
        description: "Your password has been reset successfully.",
      });
      setSecurityStep("initial");
      setOtp("");
      setVerifiedToken("");
      setNewPassword("");
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and platform preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md mb-8">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your basic account details.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                <div className="space-y-1 col-span-1 sm:col-span-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-2">
                    <Mail className="h-3 w-3" /> Email Address
                  </Label>

                  {emailStep === "view" && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-muted/30 p-3 rounded-lg border border-dashed hover:border-primary/50 transition-colors group gap-3">
                      <p className="font-medium text-base sm:text-lg break-all sm:break-normal truncate-on-mobile sm:truncate-none min-w-0">{user?.email}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEmailStep("request")}
                        className="text-primary hover:text-primary hover:bg-primary/10 gap-2 shrink-0 self-end sm:self-auto"
                      >
                        Change
                      </Button>
                    </div>
                  )}

                  {emailStep === "request" && (
                    <div className="space-y-3 p-4 rounded-lg bg-primary/5 border border-primary/20 animate-in slide-in-from-top-2 duration-300">
                      <div className="space-y-2">
                        <Label htmlFor="new-email" className="text-[10px] uppercase font-bold tracking-wider text-primary">New Email Address</Label>
                        <Input
                          id="new-email"
                          placeholder="Enter your new university email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="bg-background"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEmailStep("view")} className="h-8">Cancel</Button>
                        <Button size="sm" onClick={handleRequestEmailChange} disabled={loading || !newEmail} className="h-8">
                          {loading ? "Sending..." : "Send Verification OTP"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {emailStep === "verify" && (
                    <div className="space-y-4 p-4 rounded-lg bg-primary/5 border border-primary/20 animate-in slide-in-from-top-2 duration-300 text-center">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold tracking-wider text-primary block">Verify New Email</Label>
                        <p className="text-xs text-muted-foreground">Enter the 6-digit code sent to <span className="text-foreground font-semibold">{newEmail}</span></p>
                        <div className="flex justify-center pt-2">
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
                      </div>
                      <div className="flex gap-2 justify-center pt-2">
                        <Button variant="ghost" size="sm" onClick={() => setEmailStep("request")} className="h-8">Back</Button>
                        <Button size="sm" onClick={handleVerifyEmailChange} disabled={loading || emailOtp.length < 6} className="h-8">
                          {loading ? "Verifying..." : "Update Email"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-2">
                    <Shield className="h-3 w-3" /> Account Role
                  </Label>
                  <div className="flex items-center gap-2 uppercase font-semibold text-xs text-primary bg-primary/10 w-fit px-2 py-1 rounded">
                    <BadgeCheck className="h-3 w-3" />
                    {user?.role}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Password & Security</CardTitle>
              <CardDescription>Securely update your password.</CardDescription>
            </CardHeader>
            <CardContent className="max-w-md">
              {securityStep === "initial" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border border-yellow-500/20">
                    <Shield className="h-5 w-5 shrink-0" />
                    <p className="text-sm">
                      For security, we'll send a 6-digit verification code to your email before you can change your password.
                    </p>
                  </div>
                  <Button onClick={handleSendOTP} disabled={loading} className="w-full">
                    {loading ? "Sending OTP..." : "Password Reset"}
                  </Button>
                </div>
              )}

              {securityStep === "otp" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Verification Code</Label>
                    <p className="text-xs text-muted-foreground mb-4">
                      Enter the code sent to your email address.
                    </p>
                    <div className="flex justify-center">
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
                    <Button variant="outline" onClick={() => setSecurityStep("initial")} className="flex-1">
                      Back
                    </Button>
                    <Button onClick={handleVerifyOTP} disabled={loading || otp.length < 6} className="flex-1">
                      {loading ? "Verifying..." : "Verify Code"}
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
                        placeholder="Min 8 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button onClick={handleResetPassword} disabled={loading || newPassword.length < 8} className="w-full">
                    {loading ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how the dashboard looks and feels.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark themes.
                  </p>
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


