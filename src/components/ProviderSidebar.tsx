"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Store, Briefcase, Users, Calendar, LogOut } from "lucide-react";

const items = [
  { name: "Dashboard", href: "/provider/dashboard", icon: LayoutDashboard },
  { name: "Business", href: "/provider/business", icon: Store },
  { name: "Services", href: "/provider/services", icon: Briefcase },
  { name: "Staff", href: "/staff", icon: Users }, // Note: Prompt said /staff
  { name: "Appointments", href: "/provider/appointments", icon: Calendar },
];

export function ProviderSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 border-r bg-muted/10 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b">
         <h2 className="text-xl font-bold flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            Provider
         </h2>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
               <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn("w-full justify-start gap-2", isActive && "bg-secondary")}
                asChild
               >
                 <span>
                   <item.icon className="h-4 w-4" />
                   {item.name}
                 </span>
               </Button>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <Link href="/login">
            <Button variant="outline" className="w-full gap-2">
                <LogOut className="h-4 w-4" /> Logout
            </Button>
        </Link>
      </div>
    </div>
  );
}
