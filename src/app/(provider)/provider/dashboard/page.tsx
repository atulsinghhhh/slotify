"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Calendar, CheckCircle, Clock } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

export default function ProviderDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState({ today: 0, pending: 0, completed: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.get("/api/provider/appointments");
        setAppointments(data);
        
        // Calculate stats client-side for MVP
        const today = new Date().toISOString().split("T")[0];
        const todayCount = data.filter((a: any) => a.date.startsWith(today)).length;
        const pendingCount = data.filter((a: any) => a.status === "PENDING").length;
        const completedCount = data.filter((a: any) => a.status === "COMPLETED").length;
        
        setStats({ today: todayCount, pending: pendingCount, completed: completedCount });
      } catch (error) {
        console.error("Failed to fetch provider appointments", error);
        // Mock data for demo
        setAppointments([]);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Total</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Today's Schedule</h2>
        {appointments.length === 0 ? (
           <p className="text-muted-foreground">No appointments for today.</p>
        ) : (
           <div className="grid gap-4">
             {appointments.slice(0, 5).map(apt => (
                <Card key={apt.id}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="font-semibold">{apt.service.name}</div>
                        <StatusBadge status={apt.status} />
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        <div>Customer: {apt.customer?.name || "Guest"}</div>
                        <div>Time: {apt.startTime}</div>
                    </CardContent>
                </Card>
             ))}
           </div>
        )}
      </div>
    </div>
  );
}
