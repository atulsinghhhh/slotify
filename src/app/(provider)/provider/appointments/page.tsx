"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { StatusBadge, Status } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";
import { format } from "date-fns";

export default function ProviderAppointmentsPage() {
  const [appointments, setAppointments] = useState<Array<{ id: string; service?: { name: string }; customer?: { name: string }; startTime: string; status: Status; date: string; staff?: { name: string } }>>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const data = await api.get("/api/appointment"); // As per prompt: GET /api/appointments
      console.log("Fetched appointments:", data.appointments);
      setAppointments(data.appointments || []);
    } catch {
      // Error silently handled
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
        fetchAppointments();
    } catch {
        toast.error("Failed to update status");
    }
  };

  if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Appointments</h1>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">No appointments found.</TableCell>
                </TableRow>
            ) : (
                appointments.map((apt) => (
                    <TableRow key={apt.id}>
                        <TableCell>{format(new Date(apt.date), "PPP")}</TableCell>
                        <TableCell>{apt.startTime}</TableCell>
                        <TableCell>{apt.customer?.name || "Guest"}</TableCell>
                        <TableCell>{apt.service?.name}</TableCell>
                        <TableCell>{apt.staff?.name || "-"}</TableCell>
                        <TableCell><StatusBadge status={apt.status} /></TableCell>
                        <TableCell className="text-right">
                            <Select
                                value={apt.status}
                                onValueChange={(value) => handleStatusUpdate(apt.id, value)}
                            >
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </TableCell>
                    </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
