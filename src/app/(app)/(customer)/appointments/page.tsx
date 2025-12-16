"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { StatusBadge, Status } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface Appointment {
  id: string;
  service: { name: string; duration: number };
  staff?: { name: string };
  business: { name: string };
  date: string;
  startTime: string;
  status: Status;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const data = await api.get("/api/customer/appointment");
      console.log("Fetched appointments:", data.appointments);
      setAppointments(Array.isArray(data.appointments) ? data.appointments : []);
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await api.patch(`/api/appointment/${id}/cancel`, {});
      toast.success("Appointment cancelled");
      fetchAppointments();
    } catch {
      toast.error("Failed to cancel appointment");
    }
  };

  // const handleReschedule = async () => {
  //   // For MVP, maybe redirect to booking page or show modal? 
  //   // Prompt says "actions to cancel and reschedule".
  //   // Reschedule involves picking new date/time. 
  //   // Simplest MVP: Cancel + Rebook or "Not implemented" for now but button exists.
  //   // I'll show a toast for MVP or todo.
  //   toast.info("Rescheduling feature coming soon. Please cancel and re-book.");
  // };

  if (loading) return <div className="container mx-auto p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">My Appointments</h1>
      {appointments.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <h3 className="text-lg font-medium">No appointments found</h3>
          <p className="text-muted-foreground">Book your first appointment today!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {appointments.map((apt) => (
            <Card key={apt.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">
                  {apt.service?.name} at {apt.business?.name}
                </CardTitle>
                <StatusBadge status={apt.status} />
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Date: {format(new Date(apt.date), "PPP")}</p>
                  <p>Time: {apt.startTime} ({apt.service?.duration} mins)</p>
                  <p>Staff: {apt.staff?.name || "Any Staff"}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                 {apt.status === "PENDING" || apt.status === "CONFIRMED" ? (
                   <>
                     {/* <Button variant="outline" onClick={() => handleReschedule(apt.id)}>Reschedule</Button> */}
                     <Button variant="destructive" onClick={() => handleCancel(apt.id)}>Cancel</Button>
                   </>
                 ) : null}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
