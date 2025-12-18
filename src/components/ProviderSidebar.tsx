"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Store, Briefcase, Users, Calendar, Settings } from "lucide-react";

// Updated items with consistent icons
const items = [
  { name: "Dashboard", href: "/provider/dashboard", icon: LayoutDashboard },
  { name: "Business", href: "/provider/business", icon: Store },
  { name: "Services", href: "/provider/services", icon: Briefcase },
  { name: "Staff", href: "/user", icon: Users },
  { name: "Appointments", href: "/provider/appointments", icon: Calendar },
  { name: "Profile", href: "/provider/profile", icon: Users },
  // { name: "Settings", href: "/provider/settings", icon: Settings },
];

export function ProviderSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 h-screen w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground hidden md:flex flex-col">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
         <div className="flex items-center gap-2 font-bold text-xl text-sidebar-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Store className="h-5 w-5" />
            </div>
            Slotify
         </div>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="grid items-start px-2 text-sm font-medium gap-1">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 px-3 py-2.5 text-sidebar-foreground/70 transition-all hover:text-sidebar-foreground hover:bg-sidebar-accent hover:pl-4",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm hover:pl-3"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t border-sidebar-border p-4">
         <Link href="/provider/plans">
             <div className="rounded-xl bg-sidebar-accent/50 p-4 hover:bg-sidebar-accent transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-semibold group-hover:text-primary transition-colors">Pro Plan</h4>
                    <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded uppercase font-bold">New</span>
                </div>
                <p className="text-xs text-muted-foreground">Upgrade for more features</p>
                <div className="mt-3 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-2/3 rounded-full" />
                </div>
             </div>
         </Link>
      </div>
    </aside>
  );
}
