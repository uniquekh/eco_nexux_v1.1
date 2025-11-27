import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Recycle, Building2, User, ShieldCheck, Loader2, ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { api } from "@/lib/api";

interface EnhancedLoginPageProps {
  onLogin?: (role: "company" | "customer" | "admin") => void;
}

export default function EnhancedLoginPage({ onLogin }: EnhancedLoginPageProps) {
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Customer form
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPassword, setCustomerPassword] = useState("");
  const [customerName, setCustomerName] = useState("");
  
  // Company form
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPassword, setCompanyPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyContactName, setCompanyContactName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  
  // Admin form
  const [adminId, setAdminId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await api.loginCustomer({ email: customerEmail, password: customerPassword });
      if (result.success) {
        sessionStorage.setItem('userEmail', result.customer.email);
        sessionStorage.setItem('userRole', 'customer');
        toast({ title: "Success", description: "Logged in successfully" });
        onLogin?.("customer");
      } else {
        throw new Error(result.error || "Login failed");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Invalid credentials", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await api.registerCustomer({ name: customerName, email: customerEmail, password: customerPassword });
      if (result.success) {
        toast({ title: "Success", description: "Registration successful! Please login." });
        setIsSignUp(false);
        setCustomerPassword("");
      } else {
        throw new Error(result.error || "Registration failed");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Registration failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await api.loginCompany({ email: companyEmail, password: companyPassword });
      if (result.success) {
        sessionStorage.setItem('userEmail', result.company.email);
        sessionStorage.setItem('userRole', 'company');
        toast({ title: "Success", description: "Logged in successfully" });
        onLogin?.("company");
      } else {
        throw new Error(result.error || "Login failed");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Invalid credentials", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await api.registerCompany({
        name: companyContactName,
        email: companyEmail,
        password: companyPassword,
        companyName: companyName,
        registrationNumber: registrationNumber
      });
      if (result.success) {
        toast({ title: "Success", description: "Registration successful! Awaiting admin approval." });
        setIsSignUp(false);
        setCompanyPassword("");
      } else {
        throw new Error(result.error || "Registration failed");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Registration failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await api.loginAdmin({ adminId, password: adminPassword });
      if (result.success) {
        sessionStorage.setItem('userEmail', result.admin.email);
        sessionStorage.setItem('userRole', 'admin');
        toast({ title: "Success", description: "Logged in successfully" });
        onLogin?.("admin");
      } else {
        throw new Error(result.error || "Login failed");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Invalid credentials", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-bounce" style={{ animationDuration: '3s' }}>
        <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
          <Recycle className="w-8 h-8 text-white" />
        </div>
      </div>
      <div className="absolute bottom-20 right-10 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
        <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 animate-in fade-in-0 zoom-in-95 duration-700">
        <Link href="/">
          <Button variant="ghost" className="mb-4 text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <Card className="backdrop-blur-xl bg-white/95 dark:bg-gray-950/95 shadow-2xl border-2">
          <CardHeader className="text-center pb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Recycle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                EcoNexus
              </CardTitle>
            </div>
            <CardDescription className="text-lg">
              {isSignUp ? "Create your account" : "Welcome back! Please login to continue"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="customer" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="customer" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Customer
                </TabsTrigger>
                <TabsTrigger value="company" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Company
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Admin
                </TabsTrigger>
              </TabsList>

              {/* Customer Tab */}
              <TabsContent value="customer">
                <form onSubmit={isSignUp ? handleCustomerRegister : handleCustomerLogin} className="space-y-4">
                  {isSignUp && (
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Full Name</Label>
                      <Input
                        id="customerName"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Email</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="customer@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPassword">Password</Label>
                    <Input
                      id="customerPassword"
                      type="password"
                      value={customerPassword}
                      onChange={(e) => setCustomerPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isSignUp ? "Create Account" : "Login"}
                  </Button>
                  <Button type="button" variant="ghost" className="w-full" onClick={() => setIsSignUp(!isSignUp)}>
                    {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign up"}
                  </Button>
                </form>
              </TabsContent>

              {/* Company Tab */}
              <TabsContent value="company">
                <form onSubmit={isSignUp ? handleCompanyRegister : handleCompanyLogin} className="space-y-4">
                  {isSignUp && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="GreenEco Ltd"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactName">Contact Person Name</Label>
                        <Input
                          id="contactName"
                          value={companyContactName}
                          onChange={(e) => setCompanyContactName(e.target.value)}
                          placeholder="John Smith"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="registrationNumber">Registration Number</Label>
                        <Input
                          id="registrationNumber"
                          value={registrationNumber}
                          onChange={(e) => setRegistrationNumber(e.target.value)}
                          placeholder="REG-2024-001"
                          required
                        />
                      </div>
                    </>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="companyEmail">Company Email</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      placeholder="company@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyPassword">Password</Label>
                    <Input
                      id="companyPassword"
                      type="password"
                      value={companyPassword}
                      onChange={(e) => setCompanyPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isSignUp ? "Register Company" : "Login"}
                  </Button>
                  <Button type="button" variant="ghost" className="w-full" onClick={() => setIsSignUp(!isSignUp)}>
                    {isSignUp ? "Already registered? Login" : "New company? Register"}
                  </Button>
                </form>
              </TabsContent>

              {/* Admin Tab */}
              <TabsContent value="admin">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminId">Admin ID</Label>
                    <Input
                      id="adminId"
                      value={adminId}
                      onChange={(e) => setAdminId(e.target.value)}
                      placeholder="admin_001"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Password</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Admin Login
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper functions
export function getUserEmail(): string | null {
  return sessionStorage.getItem('userEmail');
}

export function getUserRole(): "customer" | "company" | "admin" | null {
  return sessionStorage.getItem('userRole') as "customer" | "company" | "admin" | null;
}

export function clearUserData(): void {
  sessionStorage.removeItem('userEmail');
  sessionStorage.removeItem('userRole');
}
