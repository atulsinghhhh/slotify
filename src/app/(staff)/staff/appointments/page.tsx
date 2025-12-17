"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import { CheckCircle, X } from "lucide-react";
import { AppointmentStatus, APPOINTMENT_STATUSES } from "@/lib/appointment-statuses";

interface Appointment {
  id: string;
  startTime: string;
  customer: { name: string };
  service: { name: string };
  status: AppointmentStatus;
}

export default function StaffAppointments() {
  const { status: sessionStatus } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStatus !== "authenticated") return;

    const fetchAppointments = async () => {
      try {
        const response = await api.get("/api/staff/appointments");
        setAppointments(response.appointments || []);
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
        toast.error("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [sessionStatus]);

  const handleComplete = async (appointmentId: string) => {
    try {
      setUpdating(appointmentId);
      await api.patch(`/api/appointments/${appointmentId}/complete`, {});
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId
            ? { ...apt, status: APPOINTMENT_STATUSES.COMPLETED }
            : apt
        )
      );
      toast.success("Appointment marked as completed");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update appointment");
    } finally {
      setUpdating(null);
    }
  };

  const handleNoShow = async (appointmentId: string) => {
    try {
      setUpdating(appointmentId);
      await api.patch(`/api/appointments/${appointmentId}/no-show`, {});
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId
            ? { ...apt, status: APPOINTMENT_STATUSES.NO_SHOW }
            : apt
        )
      );
      toast.success("Appointment marked as no-show");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update appointment");
    } finally {
      setUpdating(null);
    }
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayApts = appointments.filter(
    (apt) =>
      new Date(apt.startTime) >= today && new Date(apt.startTime) < tomorrow
  );

  const upcomingApts = appointments.filter(
    (apt) => new Date(apt.startTime) >= tomorrow
  );

  const pastApts = appointments.filter(
    (apt) => new Date(apt.startTime) < today
  );

  const AptCard = ({ apt }: { apt: Appointment }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <p className="font-semibold">{apt.customer.name}</p>
            <p className="text-sm text-muted-foreground">{apt.service.name}</p>
            <p className="text-sm font-medium">
              {format(new Date(apt.startTime), "p")}
            </p>
            <StatusBadge status={apt.status} />
          </div>
          {apt.status === APPOINTMENT_STATUSES.BOOKED && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleComplete(apt.id)}
                disabled={updating === apt.id}
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleNoShow(apt.id)}
                disabled={updating === apt.id}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Appointments</h1>

      <Tabs defaultValue="today" className="w-full">
        <TabsList>
          <TabsTrigger value="today">
            Today ({todayApts.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingApts.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastApts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4 mt-6">
          {todayApts.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <p className="text-muted-foreground">No appointments today</p>
            </div>
          ) : (
            todayApts.map((apt) => <AptCard key={apt.id} apt={apt} />)
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4 mt-6">
          {upcomingApts.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <p className="text-muted-foreground">No upcoming appointments</p>
            </div>
          ) : (
            upcomingApts.map((apt) => <AptCard key={apt.id} apt={apt} />)
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4 mt-6">
          {pastApts.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <p className="text-muted-foreground">No past appointments</p>
            </div>
          ) : (
            pastApts.map((apt) => <AptCard key={apt.id} apt={apt} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
