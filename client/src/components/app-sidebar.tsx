import { 
  Building2, 
  User, 
  ShieldCheck, 
  Package, 
  Recycle, 
  Truck,
  LayoutDashboard,
  LogOut,
  ChevronDown
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getUserEmail } from "@/pages/LoginPage";

const companyMenuItems = [
  { title: "Dashboard", url: "/company", icon: LayoutDashboard },
];

const customerMenuItems = [
  { title: "Dashboard", url: "/customer", icon: LayoutDashboard },
];

const adminMenuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
];

interface AppSidebarProps {
  role: "company" | "customer" | "admin";
  onLogout?: () => void;
}

export function AppSidebar({ role, onLogout }: AppSidebarProps) {
  const [location] = useLocation();
  const userEmail = getUserEmail();
  const [showStats, setShowStats] = useState(true);

  const { data: stats } = useQuery({
    queryKey: [`stats_${role}`, userEmail],
    queryFn: async () => {
      if (role === "admin") {
        const data = await api.getAllProducts();
        const products = data.products || [];
        return {
          activePickups: products.filter((p: any) => p.currentStatus === "Pending Pickup").length,
          inventoryCount: products.filter((p: any) => p.currentStatus === "Collected" || p.currentStatus === "Processing").length,
          batchesSent: products.filter((p: any) => p.currentStatus === "Recycled").length,
        };
      } else if (role === "customer" && userEmail) {
        const data = await api.getProductsByEmail(userEmail);
        const products = data.products || [];
        return {
          total: products.length,
          pending: products.filter((p: any) => p.currentStatus === "Pending Pickup").length,
          collected: products.filter((p: any) => p.currentStatus === "Collected" || p.currentStatus === "Processing").length,
          recycled: products.filter((p: any) => p.currentStatus === "Recycled").length,
        };
      }
      return null;
    },
    enabled: role === "admin" || (role === "customer" && !!userEmail),
    staleTime: 60000,
  });

  const menuItems = 
    role === "company" ? companyMenuItems :
    role === "customer" ? customerMenuItems :
    adminMenuItems;

  const roleIcons = {
    company: Building2,
    customer: User,
    admin: ShieldCheck,
  };

  const roleLabels = {
    company: "Company",
    customer: "Customer",
    admin: "Admin",
  };

  const RoleIcon = roleIcons[role];

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Recycle className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm">EcoNexus</div>
            <div className="text-xs text-muted-foreground">{roleLabels[role]}</div>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="flex flex-col flex-1">
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <RoleIcon className="w-4 h-4" />
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url || (item.url !== '/' && location.startsWith(item.url))}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Summary Stats */}
        {stats && (
          <SidebarGroup className="mt-auto">
            <div 
              className="flex items-center justify-between px-2 py-2 cursor-pointer hover:bg-muted rounded-lg transition-colors"
              onClick={() => setShowStats(!showStats)}
            >
              <SidebarGroupLabel className="m-0 text-xs">Summary</SidebarGroupLabel>
              <ChevronDown className={`w-4 h-4 transition-transform ${showStats ? 'rotate-180' : ''}`} />
            </div>
            {showStats && (
              <SidebarGroupContent className="mt-2">
                <div className="px-2 py-2 bg-muted/50 rounded text-xs space-y-2">
                  {role === "admin" ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pickups</span>
                        <Badge variant="destructive" className="text-xs h-5">{(stats as any).activePickups}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Inventory</span>
                        <Badge variant="secondary" className="text-xs h-5">{(stats as any).inventoryCount}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Recycled</span>
                        <Badge className="text-xs h-5 bg-green-600">{(stats as any).batchesSent}</Badge>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total</span>
                        <Badge variant="secondary" className="text-xs h-5">{(stats as any).total}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pending</span>
                        <Badge variant="destructive" className="text-xs h-5">{(stats as any).pending}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Recycled</span>
                        <Badge className="text-xs h-5 bg-green-600">{(stats as any).recycled}</Badge>
                      </div>
                    </>
                  )}
                </div>
              </SidebarGroupContent>
            )}
          </SidebarGroup>
        )}
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-xs"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
