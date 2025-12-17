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
      <div className="max-w-4xl space-y-4 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-muted/50 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
          <div className="space-y-1">
             <h2 className="text-xl font-semibold">Weekly Schedule</h2>
             <p className="text-sm text-muted-foreground">Manage your working hours and availability.</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
      </div>

      <div className="space-y-3">
          {days.map((day) => {
            const schedule = workingHours[day];
            const isClosed = !schedule;

            return (
              <div
                key={day}
                className={`flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-xl border transition-all duration-200 ${
                    isClosed 
                    ? "bg-muted/10 border-transparent opacity-70 hover:opacity-100" 
                    : "bg-card border-border/50 shadow-sm hover:border-primary/20"
                }`}
              >
                <div className="flex items-center gap-3 min-w-[160px]">
                   <Checkbox
                    checked={!isClosed}
                    onCheckedChange={() => toggleDay(day)}
                    className="h-5 w-5"
                  />
                  <span className="font-medium capitalize text-lg">{day}</span>
                </div>

                <div className="flex-1 flex gap-4 items-center">
                    {!isClosed ? (
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="grid gap-1.5 flex-1 md:flex-none">
                          <Label className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Start</Label>
                          <div className="relative">
                             <Input
                                type="time"
                                value={schedule?.start || "09:00"}
                                onChange={(e) =>
                                  updateDayTime(day, "start", e.target.value)
                                }
                                className="w-full md:w-32 bg-background/50 border-input"
                              />
                          </div>
                        </div>
                        <span className="text-muted-foreground mt-6 hidden md:block">→</span>
                        <div className="grid gap-1.5 flex-1 md:flex-none">
                          <Label className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">End</Label>
                          <Input
                            type="time"
                            value={schedule?.end || "17:00"}
                            onChange={(e) =>
                              updateDayTime(day, "end", e.target.value)
                            }
                            className="w-full md:w-32 bg-background/50 border-input"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-16 items-center px-4 rounded-lg bg-muted/20 text-muted-foreground text-sm italic w-full">
                        Not available
                      </div>
                    )}
                </div>
              </div>
            );
          })}
      </div>
      
      <div className="flex justify-end md:hidden">
         <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save Changes"}
         </Button>
      </div>
    </div>
  );
}

