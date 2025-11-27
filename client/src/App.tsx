import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AppSidebar } from "@/components/app-sidebar";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import LoginPage, { getUserRole, clearUserData } from "@/pages/LoginPage";
import CompanyDashboard from "@/pages/CompanyDashboard";
import CustomerDashboard from "@/pages/CustomerDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import ProductDetails from "@/pages/ProductDetails";

function Router() {
  const [userRole, setUserRole] = useState<"company" | "customer" | "admin" | null>(null);
  const [location, setLocation] = useLocation();

  // Check sessionStorage for user role on mount, when storage changes, and on location change
  useEffect(() => {
    const checkUserRole = () => {
      const role = getUserRole();
      setUserRole(role);
      
      // If user is logged in but on public routes, redirect to dashboard
      if (role && (location === '/' || location === '/login' || location === '/register')) {
        if (role === "company") {
          setLocation("/company");
        } else if (role === "customer") {
          setLocation("/customer");
        } else if (role === "admin") {
          setLocation("/admin");
        }
      }
      
      // If user is not logged in but on protected routes, redirect to login
      if (!role && location !== '/' && location !== '/login' && location !== '/register' && !location.startsWith('/product/')) {
        setLocation("/login");
      }
    };

    // Check on mount and location change
    checkUserRole();

    // Listen for storage changes (in case user logs in from another tab)
    window.addEventListener('storage', checkUserRole);
    
    // Custom event for same-tab updates
    window.addEventListener('userRoleChanged', checkUserRole);
    
    // Listen for popstate (browser back/forward)
    window.addEventListener('popstate', checkUserRole);

    return () => {
      window.removeEventListener('storage', checkUserRole);
      window.removeEventListener('userRoleChanged', checkUserRole);
      window.removeEventListener('popstate', checkUserRole);
    };
  }, [location, setLocation]);

  const handleLogin = (role: "company" | "customer" | "admin") => {
    setUserRole(role);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('userRoleChanged'));
    
    // Redirect to appropriate dashboard
    if (role === "company") {
      setLocation("/company");
    } else if (role === "customer") {
      setLocation("/customer");
    } else if (role === "admin") {
      setLocation("/admin");
    }
  };

  const handleLogout = () => {
    // Clear sessionStorage
    clearUserData();
    
    // Clear React Query cache
    queryClient.clear();
    
    // Update state
    setUserRole(null);
    
    // Dispatch event
    window.dispatchEvent(new Event('userRoleChanged'));
    
    // Redirect to login
    setLocation("/login");
  };

  // Show public routes when not logged in
  if (!userRole) {
    return (
      <Switch>
        <Route path="/login">
          <LoginPage onLogin={handleLogin} />
        </Route>
        <Route path="/register">
          <LoginPage onLogin={handleLogin} />
        </Route>
        <Route path="/">
          <HomePage />
        </Route>
        <Route path="/product/:id">
          {/* Allow viewing product details without login */}
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Please Login</h2>
              <p className="text-muted-foreground">You need to be logged in to view product details.</p>
              <button 
                onClick={() => setLocation("/login")}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Go to Login
              </button>
            </div>
          </div>
        </Route>
        <Route>
          {/* Redirect any other route to home */}
          <HomePage />
        </Route>
      </Switch>
    );
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar role={userRole} onLogout={handleLogout} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b gap-4 flex-shrink-0">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 max-w-7xl">
              <Switch>
                <Route path="/login">
                  {/* If already logged in, redirect to dashboard */}
                  {userRole ? (
                    userRole === "company" ? <CompanyDashboard /> :
                    userRole === "customer" ? <CustomerDashboard /> :
                    <AdminDashboard />
                  ) : (
                    <LoginPage onLogin={handleLogin} />
                  )}
                </Route>
                
                <Route path="/company">
                  {userRole === "company" ? <CompanyDashboard /> : <NotFound />}
                </Route>
                
                <Route path="/customer">
                  {userRole === "customer" ? <CustomerDashboard /> : <NotFound />}
                </Route>
                
                <Route path="/admin">
                  {userRole === "admin" ? <AdminDashboard /> : <NotFound />}
                </Route>
                
                <Route path="/product/:id">
                  <ProductDetails />
                </Route>
                
                <Route path="/">
                  {userRole === "company" && <CompanyDashboard />}
                  {userRole === "customer" && <CustomerDashboard />}
                  {userRole === "admin" && <AdminDashboard />}
                  {!userRole && <HomePage />}
                </Route>
                
                <Route>
                  <NotFound />
                </Route>
              </Switch>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}