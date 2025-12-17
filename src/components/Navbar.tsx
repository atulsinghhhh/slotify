"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, User, LogOut, Settings, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hide on dashboard layouts that have their own sidebar/header
  if (pathname.startsWith("/provider") || pathname.startsWith("/staff") || pathname.startsWith("/user")) return null;
  // Hide on auth pages (split layout)
  if (pathname === "/login" || pathname === "/signup") return null;

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <nav className="border-b border-white/5 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
           <div className="h-8 w-8 rounded-lg bg-linear-to-br from-primary to-purple-600 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
           </div>
           <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-slate-400">
              Slotify
           </span>
        </Link>
        
        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {session?.user ? (
            <>
              <Link href="/appointments">
                <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/5">My Appointments</Button>
              </Link>
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-white/10 hover:ring-white/20 transition-all">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={session.user.image || undefined} alt={session.user.name || "User"} />
                      <AvatarFallback className="bg-primary/10 text-primary">{getInitials(session.user.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-card border-border/50" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user.name || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                      {session.user.role && (
                         <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary w-fit">
                            {session.user.role}
                         </div>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5" />
                  {session.user.role === "customer" && (
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {session.user.role === "provider" && (
                    <DropdownMenuItem asChild>
                      <Link href="/provider/dashboard" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-900/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              {!loading && (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/5">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 rounded-full px-6">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
            className="md:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

       {/* Mobile Nav */}
       {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-background p-4 flex flex-col gap-4 animate-in slide-in-from-top-4">
             {!session?.user ? (
               <>
                 <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white">Sign In</Link>
                 <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white">Get Started</Link>
               </>
             ) : (
                <>
                  <Link href="/appointments" className="text-slate-400 hover:text-white">My Appointments</Link>
                  <button onClick={handleLogout} className="text-left text-red-400">Log out</button>
                </>
             )}
          </div>
        )}
    </nav>
  );
}
