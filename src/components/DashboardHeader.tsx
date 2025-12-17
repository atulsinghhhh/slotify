"use client";

import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Bell, Search, User, LogOut, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { NotificationBell } from "@/components/NotificationBell";

export function DashboardHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const getPageTitle = (path: string) => {
    const segments = path.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    if (!lastSegment) return "Dashboard";
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  };

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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center gap-4 border-b bg-background/95 backdrop-blur-md px-6 shadow-sm">
      <div className="flex flex-1 items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground md:text-xl">
          {getPageTitle(pathname)}
        </h1>
        {/* Optional Search Bar */}
        {/* <div className="hidden md:flex relative w-full max-w-sm items-center">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full bg-background pl-8 md:w-[200px] lg:w-[300px]"
            />
        </div> */}
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8 border border-border">
                <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name || "User"} />
                <AvatarFallback>{getInitials(session?.user?.name)}</AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
               <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{session?.user?.name || "User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email}
                  </p>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
