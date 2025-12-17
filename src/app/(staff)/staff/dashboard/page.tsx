"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Calendar, ArrowRight } from "lucide-react";

interface DashboardData {
  todayCount: number;
  weekCount: number;
  nextAppointment: {
    id: string;
    customer: { name: string };
    service: { name: string };
    startTime: string;
  } | null;
}

export default function StaffDashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ... logic mostly same, just updating UI wrapper ... 
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/api/staff/dashboard");
        setData(response);
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
       <div className="flex h-[50vh] items-center justify-center">
          <Skeleton className="h-8 w-64" />
       </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome back, {session?.user?.name?.split(" ")[0]}</h2>
            <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your schedule today.</p>
          </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Appointments</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data?.todayCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
            <div className="p-2 bg-purple-500/10 rounded-full">
              <Clock className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data?.weekCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Total appointments</p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Next Up</CardTitle>
            <div className="p-2 bg-green-500/10 rounded-full">
              <ArrowRight className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            {data?.nextAppointment ? (
               <div className="flex flex-col gap-1">
                 <span className="font-semibold text-lg truncate">{data.nextAppointment.customer.name}</span>
                 <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="bg-muted px-1.5 py-0.5 rounded text-foreground">{data.nextAppointment.service.name}</span>
                    <span>{new Date(data.nextAppointment.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                 </div>
               </div>
            ) : (
               <div>
                  <div className="text-xl font-medium text-muted-foreground">Free</div>
                  <p className="text-xs text-muted-foreground mt-1">No upcoming appointments</p>
               </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {/* Quick Actions / Navigation Cards - Styled to match premium feel */}
         <Link href="/staff/appointments" className="block group">
            <Card className="h-full hover:border-primary/50 transition-colors hover:shadow-md cursor-pointer">
               <CardHeader>
                  <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                     <Calendar className="h-5 w-5" />
                     Manage Appointments
                  </CardTitle>
                  <CardDescription>View your full schedule and management details</CardDescription>
               </CardHeader>
            </Card>
         </Link>

         <Link href="/staff/availability" className="block group">
            <Card className="h-full hover:border-primary/50 transition-colors hover:shadow-md cursor-pointer">
               <CardHeader>
                  <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                     <Clock className="h-5 w-5" />
                     Update Availability
                  </CardTitle>
                  <CardDescription>Set your working hours and breaks</CardDescription>
               </CardHeader>
            </Card>
         </Link>
      </div>
    </div>
  );
}
