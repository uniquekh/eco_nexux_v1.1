import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Recycle, Building2, User, ShieldCheck, Loader2 } from "lucide-react";

interface LoginPageProps {
  onLogin?: (role: "company" | "customer" | "admin") => void;
}

const API_BASE_URL = "https://eco-login.vercel.app";

async function apiRequest(method: string, endpoint: string, data?: any) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Request failed");
  }

  return response;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPassword, setCustomerPassword] = useState("");
  const [customerName, setCustomerName] = useState("");
  
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPassword, setCompanyPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [contactName, setContactName] = useState("");
  
  const [adminId, setAdminId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const clearUserData = () => {
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userRole');
  };

  const customerLoginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/customer/login", { email, password });
      return await res.json();
    },
    onSuccess: (data) => {
      clearUserData();
      const email = data.customer?.email || data.email || customerEmail;
      sessionStorage.setItem('userEmail', email);
      sessionStorage.setItem('userRole', 'customer');
      toast({ title: "Success", description: "Logged in successfully" });
      onLogin?.("customer");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Invalid credentials", variant: "destructive" });
    },
  });

  const customerRegisterMutation = useMutation({
    mutationFn: async ({ email, password, name }: { email: string; password: string; name: string }) => {
      const res = await apiRequest("POST", "/api/auth/customer/register", { email, password, name });
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Registration successful! Please login." });
      setIsSignUp(false);
      setCustomerPassword("");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Registration failed", variant: "destructive" });
    },
  });

  const companyLoginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/company/login", { email, password });
      return await res.json();
    },
    onSuccess: (data) => {
      clearUserData();
      const email = data.company?.email || data.email || companyEmail;
      sessionStorage.setItem('userEmail', email);
      sessionStorage.setItem('userRole', 'company');
      toast({ title: "Success", description: "Logged in successfully" });
      onLogin?.("company");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Invalid credentials", variant: "destructive" });
    },
  });

  const companyRegisterMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; companyName: string; registrationNumber: string; name: string }) => {
      const res = await apiRequest("POST", "/api/auth/company/register", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Registration successful! Awaiting admin approval." });
      setIsSignUp(false);
      setCompanyPassword("");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Registration failed", variant: "destructive" });
    },
  });

  const adminLoginMutation = useMutation({
    mutationFn: async ({ adminId, password }: { adminId: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/admin/login", { adminId, password });
      return await res.json();
    },
    onSuccess: (data) => {
      clearUserData();
      const id = data.admin?.adminId || data.admin?.admin_id || "admin_001";
      sessionStorage.setItem('userEmail', id);
      sessionStorage.setItem('userRole', 'admin');
      toast({ title: "Success", description: "Logged in successfully" });
      onLogin?.("admin");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Invalid credentials", variant: "destructive" });
    },
  });

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      customerRegisterMutation.mutate({ email: customerEmail, password: customerPassword, name: customerName });
    } else {
      customerLoginMutation.mutate({ email: customerEmail, password: customerPassword });
    }
  };

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      companyRegisterMutation.mutate({
        email: companyEmail,
        password: companyPassword,
        companyName,
        registrationNumber,
        name: contactName,
      });
    } else {
      companyLoginMutation.mutate({ email: companyEmail, password: companyPassword });
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    adminLoginMutation.mutate({ adminId, password: adminPassword });
  };

  const isLoading =
    customerLoginMutation.isPending ||
    customerRegisterMutation.isPending ||
    companyLoginMutation.isPending ||
    companyRegisterMutation.isPending ||
    adminLoginMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 mx-auto flex items-center justify-center shadow-lg">
            <Recycle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            EcoNexus
          </h1>
          <p className="text-muted-foreground">
            Sustainable Product Lifecycle Platform
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>{isSignUp ? "Sign Up" : "Sign In"}</CardTitle>
            <CardDescription>
              {isSignUp ? "Create a new account" : "Choose your account type to continue"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="customer" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-green-100/50 dark:bg-green-900/20">
                <TabsTrigger value="customer" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
                  <User className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Customer</span>
                </TabsTrigger>
                <TabsTrigger value="company" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
                  <Building2 className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Company</span>
                </TabsTrigger>
                <TabsTrigger value="admin" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
                  <ShieldCheck className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Admin</span>
                </TabsTrigger>
              </TabsList>

              {/* Customer Tab */}
              <TabsContent value="customer">
                <form onSubmit={handleCustomerSubmit} className="space-y-4">
                  {isSignUp && (
                    <div className="space-y-2">
                      <Label htmlFor="customer-name">Name</Label>
                      <Input
                        id="customer-name"
                        type="text"
                        placeholder="Your name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="customer-email">Email</Label>
                    <Input
                      id="customer-email"
                      type="email"
                      placeholder="you@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-password">Password</Label>
                    <Input
                      id="customer-password"
                      type="password"
                      placeholder="Enter your password"
                      value={customerPassword}
                      onChange={(e) => setCustomerPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isSignUp ? "Sign Up" : "Sign In"}
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    className="w-full"
                    onClick={() => setIsSignUp(!isSignUp)}
                  >
                    {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
                  </Button>
                </form>
              </TabsContent>

              {/* Company Tab */}
              <TabsContent value="company">
                <form onSubmit={handleCompanySubmit} className="space-y-4">
                  {isSignUp && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="contact-name">Contact Name</Label>
                        <Input
                          id="contact-name"
                          type="text"
                          placeholder="Your name"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company-name">Company Name</Label>
                        <Input
                          id="company-name"
                          type="text"
                          placeholder="ABC Corp"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="registration-number">Registration Number</Label>
                        <Input
                          id="registration-number"
                          type="text"
                          placeholder="123456789"
                          value={registrationNumber}
                          onChange={(e) => setRegistrationNumber(e.target.value)}
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="company-email">Company Email</Label>
                    <Input
                      id="company-email"
                      type="email"
                      placeholder="company@example.com"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-password">Password</Label>
                    <Input
                      id="company-password"
                      type="password"
                      placeholder="Enter your password"
                      value={companyPassword}
                      onChange={(e) => setCompanyPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isSignUp ? "Sign Up" : "Sign In"}
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    className="w-full"
                    onClick={() => setIsSignUp(!isSignUp)}
                  >
                    {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
                  </Button>
                </form>
              </TabsContent>

              {/* Admin Tab */}
              <TabsContent value="admin">
                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-id">Admin ID</Label>
                    <Input
                      id="admin-id"
                      type="text"
                      placeholder="admin_001"
                      value={adminId}
                      onChange={(e) => setAdminId(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Sign In
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Admin accounts are created by system administrators only
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Test Accounts */}
        <div className="text-center text-sm text-muted-foreground bg-white/60 dark:bg-gray-950/60 rounded-lg p-4 border">
          <p className="font-semibold text-green-700 dark:text-green-400 mb-2">Test Accounts:</p>
          <p className="text-xs">Admin: admin_001 / admin123</p>
          <p className="text-xs">Company: company@example.com / company123</p>
        </div>
      </div>
    </div>
  );
}

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
