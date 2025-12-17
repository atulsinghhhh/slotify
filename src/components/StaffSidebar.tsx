"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Calendar, User, Clock, LayoutGrid } from "lucide-react";

export function StaffSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

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
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-6 flex flex-col">
      <Link href="/staff/dashboard" className="font-bold text-lg mb-8">
        Staff Panel
      </Link>

      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start gap-3 ${
                  isActive ? "bg-primary" : "text-white hover:bg-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-700 pt-4 text-xs text-slate-400">
        <p>{session?.user?.name}</p>
        <p>{session?.user?.email}</p>
      </div>
    </aside>
  );
}
