"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, CheckCircle, Clock } from "lucide-react";
import { StatusBadge, Status } from "@/components/StatusBadge";

export default function ProviderDashboard() {
  const [appointments, setAppointments] = useState<Array<{ id: string; date: string; status: string; service?: { name: string }; customer?: { name: string }; startTime: string }>>([]);
  const [stats, setStats] = useState({ today: 0, pending: 0, completed: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.get("/api/appointment");
        const aptList = Array.isArray(data) ? data : (data?.appointments || []);
        setAppointments(aptList);
        
        const today = new Date().toISOString().split("T")[0];
        const todayCount = aptList.filter((a: { date?: string }) => a.date && a.date.startsWith(today)).length;
        const pendingCount = aptList.filter((a: { status?: string }) => a.status === "PENDING").length;
        const completedCount = aptList.filter((a: { status?: string }) => a.status === "COMPLETED").length;
        
        setStats({ today: todayCount, pending: pendingCount, completed: completedCount });
      } catch (error) {
        console.error("Failed to fetch provider appointments", error);
        setAppointments([]);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Appointments</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.today}</div>
            <p className="text-xs text-muted-foreground mt-1">+0% from yesterday</p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
            <div className="p-2 bg-orange-500/10 rounded-full">
              <Clock className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Total</CardTitle>
            <div className="p-2 bg-green-500/10 rounded-full">
               <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.completed}</div>
             <p className="text-xs text-muted-foreground mt-1">Lifetime bookings</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
           <h2 className="text-xl font-semibold tracking-tight">Today's Schedule</h2>
        </div>
        
        {appointments.length === 0 ? (
           <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed">
              <div className="p-4 bg-muted/50 rounded-full mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No appointments today</h3>
              <p className="text-sm text-muted-foreground mt-1">Enjoy your free time!</p>
           </Card>
        ) : (
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {appointments.slice(0, 5).map(apt => (
                <Card key={apt.id} className="group hover:shadow-md transition-all border-l-4 border-l-primary/50">
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                           <div className="font-semibold text-lg">{apt.service?.name || "Service"}</div>
                           <StatusBadge status={apt.status as Status} />
                        </div>
                    </CardHeader>
                    <CardContent className="text-sm">
                        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {apt.startTime ? new Date(apt.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "—"}
                        </div>
                        <div className="flex items-center gap-2 text-foreground font-medium">
                            <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center text-xs">
                                {apt.customer?.name?.[0] || "G"}
                            </div>
                            {apt.customer?.name || "Guest"}
                        </div>
                    </CardContent>
                </Card>
             ))}
           </div>
        )}
      </div>
    </div>
  );
}
