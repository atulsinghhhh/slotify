"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface DaySchedule {
  start?: string;
  end?: string;
}

interface WorkingHours {
  [key: string]: DaySchedule | null;
}

const days = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export default function StaffAvailability() {
  const { status: sessionStatus } = useSession();
  const [workingHours, setWorkingHours] = useState<WorkingHours>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (sessionStatus !== "authenticated") return;

    const fetchAvailability = async () => {
      try {
        const response = await api.get("/api/staff/me/availability");
        setWorkingHours(response.workingHours || {});
      } catch (error) {
        console.error("Failed to fetch availability:", error);
        toast.error("Failed to load availability");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [sessionStatus]);

  const toggleDay = (day: string) => {
    if (workingHours[day]) {
      setWorkingHours({ ...workingHours, [day]: null });
    } else {
      setWorkingHours({
        ...workingHours,
        [day]: { start: "09:00", end: "17:00" },
      });
    }
  };

  const updateDayTime = (
    day: string,
    field: "start" | "end",
    value: string
  ) => {
    if (workingHours[day]) {
      setWorkingHours({
        ...workingHours,
        [day]: { ...workingHours[day], [field]: value },
      });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.patch("/api/staff/me/availability", {
        workingHours,
      });
      toast.success("Availability updated successfully");
    } catch (error) {
      console.error("Error saving availability:", error);
      toast.error("Failed to update availability");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-3xl space-y-4">
        <Skeleton className="h-8 w-32" />
        {[...Array(7)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Availability</h1>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Working Hours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {days.map((day) => {
            const schedule = workingHours[day];
            const isClosed = !schedule;

            return (
              <div
                key={day}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                <div className="w-24 font-medium capitalize">{day}</div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={!isClosed}
                    onCheckedChange={() => toggleDay(day)}
                  />
                  <span className="text-sm text-muted-foreground">Open</span>
                </div>

                {!isClosed ? (
                  <div className="flex gap-4 flex-1">
                    <div>
                      <Label className="text-xs">Start</Label>
                      <Input
                        type="time"
                        value={schedule?.start || "09:00"}
                        onChange={(e) =>
                          updateDayTime(day, "start", e.target.value)
                        }
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">End</Label>
                      <Input
                        type="time"
                        value={schedule?.end || "17:00"}
                        onChange={(e) =>
                          updateDayTime(day, "end", e.target.value)
                        }
                        className="h-8"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 text-sm text-muted-foreground">
                    Closed
                  </div>
                )}
              </div>
            );
          })}

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save Schedule"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
