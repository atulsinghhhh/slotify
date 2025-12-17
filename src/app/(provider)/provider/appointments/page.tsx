"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { AppointmentStatus as Status } from "@/lib/appointment-statuses";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Clock, CheckCircle, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function ProviderAppointmentsPage() {
  const [appointments, setAppointments] = useState<Array<{ id: string; service?: { name: string }; customer?: { name: string }; startTime: string; status: Status; date: string; staff?: { name: string } }>>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const data = await api.get("/api/appointment");
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
        await api.patch(`/api/appointment/${id}/status`, { status });
        toast.success("Status updated");
        // Optimistic update or refetch
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: status as Status } : a));
    } catch {
        toast.error("Failed to update status");
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Coming Up</h2>
        {/* Filter or Sort could go here */}
      </div>

      <div className="grid gap-4">
          {appointments.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground border-dashed">
                  No appointments found.
              </Card>
          ) : (
              appointments.map((apt) => (
                  <Card key={apt.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-4 hover:border-primary/50 transition-colors">
                      <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center justify-center p-3 bg-muted/30 rounded-xl min-w-[70px]">
                             <span className="text-xs text-muted-foreground uppercase font-semibold">{format(new Date(apt.date), "MMM")}</span>
                             <span className="text-xl font-bold">{format(new Date(apt.date), "d")}</span>
                          </div>
                          <div className="space-y-1">
                              <h3 className="font-semibold text-lg">{apt.service?.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span>{apt.startTime}</span>
                                  <span>•</span>
                                  <span>with {apt.staff?.name || "Provider"}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm font-medium">
                                 <div className="h-5 w-5 rounded-full bg-accent flex items-center justify-center text-[10px] text-accent-foreground">
                                     {apt.customer?.name?.[0] || "?"}
                                 </div>
                                 {apt.customer?.name || "Guest"}
                              </div>
                          </div>
                      </div>

                      <div className="flex items-center gap-4 self-end md:self-center">
                          <StatusBadge status={apt.status} />
                          <Select
                                value={apt.status}
                                onValueChange={(value) => handleStatusUpdate(apt.id, value)}
                            >
                                <SelectTrigger className="w-[140px] h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BOOKED">Booked</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="CANCELED">Canceled</SelectItem>
                                    <SelectItem value="NO_SHOW">No Show</SelectItem>
                                </SelectContent>
                            </Select>
                      </div>
                  </Card>
              ))
          )}
      </div>
    </div>
  );
}
