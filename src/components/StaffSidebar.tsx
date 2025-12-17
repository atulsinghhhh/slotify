"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, User, Clock, LayoutGrid, Store } from "lucide-react";

export function StaffSidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      label: "Dashboard",
      href: "/staff/dashboard",
      icon: LayoutGrid,
    },
    {
      label: "Appointments",
      href: "/staff/appointments",
      icon: Calendar,
    },
    {
      label: "Availability",
      href: "/staff/availability",
      icon: Clock,
    },
    {
      label: "Profile",
      href: "/staff/profile",
      icon: User,
    },
  ];

  return (
    <aside className="sticky top-0 h-screen w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground hidden md:flex flex-col">
       <div className="flex h-16 items-center border-b border-sidebar-border px-6">
         <div className="flex items-center gap-2 font-bold text-xl text-sidebar-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Store className="h-5 w-5" />
            </div>
            Staff Panel
         </div>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="grid items-start px-2 text-sm font-medium gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
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
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
       <div className="border-t border-sidebar-border p-4">
         {/* Footer or User Info if not in header */}
      </div>
    </aside>
  );
}
