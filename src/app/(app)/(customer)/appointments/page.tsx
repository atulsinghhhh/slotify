"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { APPOINTMENT_STATUSES, AppointmentStatus } from "@/lib/appointment-statuses";

interface Appointment {
  id: string;
  service: { name: string; duration: number };
  staff?: { name: string };
  business: { name: string };
  date: string;
  startTime: string;
  status: AppointmentStatus;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [rescheduleDialog, setRescheduleDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

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
      await api.put(`/api/appointment/${id}/cancel`, {});
      toast.success("Appointment cancelled");
      fetchAppointments();
    } catch {
      toast.error("Failed to cancel appointment");
    }
  };

  const openRescheduleDialog = (apt: Appointment) => {
    setSelectedAppointment(apt.id);
    setNewDate(apt.date);
    setNewTime(apt.startTime);
    setRescheduleDialog(true);
  };

  const handleReschedule = async () => {
    if (!selectedAppointment || !newDate || !newTime) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      // Send plain date and time; API will convert to DateTime
      await api.put(`/api/appointment/${selectedAppointment}/reschedule`, {
        date: newDate,
        startTime: newTime,
      });
      toast.success("Appointment rescheduled");
      setRescheduleDialog(false);
      setSelectedAppointment(null);
      setNewDate("");
      setNewTime("");
      fetchAppointments();
    } catch {
      toast.error("Failed to reschedule appointment");
    }
  };

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
                 {apt.status === APPOINTMENT_STATUSES.BOOKED ? (
                   <>
                     <Button variant="outline" onClick={() => openRescheduleDialog(apt)}>Reschedule</Button>
                     <Button variant="destructive" onClick={() => handleCancel(apt.id)}>Cancel</Button>
                   </>
                 ) : null}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={rescheduleDialog} onOpenChange={setRescheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Select a new date and time for your appointment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleReschedule}>Confirm Reschedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
