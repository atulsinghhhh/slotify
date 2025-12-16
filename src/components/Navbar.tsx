"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar, User } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  // TODO: Add auth check here to show/hide Login/Dashboard links
  // For MVP, showing standard links

  if (pathname.startsWith("/provider")) return null; // Don't show on provider dashboard

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          Slotify
        </Link>
        <div className="flex items-center gap-4">
            <Link href="/appointments">
              <Button variant="ghost">My Appointments</Button>
            </Link>
            <Link href="/login">
              <Button>Login</Button>
            </Link>
        </div>
      </div>
    </nav>
  );
}
