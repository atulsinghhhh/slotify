"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Building2, Clock3, MapPin, Phone } from "lucide-react";

type BusinessPayload = {
   id?: string;
   name: string;
   address: string;
   phone: string;
   workingHours: {
      days: string[];
      hours: string;
   };
};

const dayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function BusinessPage() {
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [isNew, setIsNew] = useState(false);
   const [form, setForm] = useState<BusinessPayload>({
      id: undefined,
      name: "",
      address: "",
      phone: "",
      workingHours: {
         days: [],
         hours: "09:00 - 18:00",
      },
   });

   useEffect(() => {
      const fetchBusiness = async () => {
         try {
            const data = await api.get("/api/business");
            if (data && data.id) {
               const days = Array.isArray(data.workingHours?.days) ? data.workingHours.days : [];
               const hours = typeof data.workingHours?.hours === "string" ? data.workingHours.hours : "";
               setForm({
                  id: data.id,
                  name: data.name ?? "",
                  address: data.address ?? "",
                  phone: data.phone ?? "",
                  workingHours: { days, hours },
               });
               setIsNew(false);
            } else {
               setIsNew(true);
            }
         } catch (error) {
            setIsNew(true);
         } finally {
            setLoading(false);
         }
      };
      fetchBusiness();
   }, []);

   const toggleDay = (day: string) => {
      setForm((prev) => {
         const exists = prev.workingHours.days.includes(day);
         const days = exists
            ? prev.workingHours.days.filter((d) => d !== day)
            : [...prev.workingHours.days, day];
         return { ...prev, workingHours: { ...prev.workingHours, days } };
      });
   };

   const selectedDaysLabel = useMemo(() => {
      if (!form.workingHours.days.length) return "Select working days";
      return form.workingHours.days.join(", ");
   }, [form.workingHours.days]);

   const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      try {
         const payload = {
            name: form.name,
            address: form.address,
            phone: form.phone,
            workingHours: form.workingHours,
         };

         if (isNew || !form.id) {
            const res = await api.post("/api/business", payload);
            setForm({
               id: res.id,
               name: res.name ?? "",
               address: res.address ?? "",
               phone: res.phone ?? "",
               workingHours: {
                  days: Array.isArray(res.workingHours?.days) ? res.workingHours.days : [],
                  hours: typeof res.workingHours?.hours === "string" ? res.workingHours.hours : form.workingHours.hours,
               },
            });
            setIsNew(false);
            toast.success("Business created successfully");
         } else {
            const res = await api.put(`/api/business/${form.id}`, payload);
            setForm({
               id: res.id,
               name: res.name ?? "",
               address: res.address ?? "",
               phone: res.phone ?? "",
               workingHours: {
                  days: Array.isArray(res.workingHours?.days) ? res.workingHours.days : form.workingHours.days,
                  hours: typeof res.workingHours?.hours === "string" ? res.workingHours.hours : form.workingHours.hours,
               },
            });
            toast.success("Business updated successfully");
         }
      } catch (error) {
         toast.error("Failed to save business details");
      } finally {
         setSaving(false);
      }
   };

   const handleDelete = async () => {
      if (!form.id) return;
      setSaving(true);
      try {
         await api.delete(`/api/business/${form.id}`);
         toast.success("Business deleted successfully");
         setForm({
            id: undefined,
            name: "",
            address: "",
            phone: "",
            workingHours: { days: [], hours: "09:00 - 18:00" },
         });
         setIsNew(true);
      } catch (error) {
         toast.error("Failed to delete business");
      } finally {
         setSaving(false);
      }
   };

   if (loading) return <div className="p-8 flex items-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Loading business…</div>;

   return (
      <div className="max-w-2xl space-y-4">
         <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">My Business</h1>
         </div>
         <Card>
            <CardHeader>
                <CardTitle>{isNew ? "Create Business" : "Edit Business"}</CardTitle>
            </CardHeader>
            <form onSubmit={handleSave} className="space-y-1">
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                         <Label htmlFor="name">Business Name</Label>
                         <Input 
                              id="name" 
                              value={form.name} 
                              onChange={e => setForm({...form, name: e.target.value})}
                              required 
                         />
                     </div>

                     <div className="space-y-2">
                        <Label>Working Days</Label>
                        <div className="flex flex-wrap gap-2">
                           {dayOptions.map((day) => {
                              const active = form.workingHours.days.includes(day);
                              return (
                                 <Button
                                    key={day}
                                    type="button"
                                    variant={active ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => toggleDay(day)}
                                 >
                                    {day}
                                 </Button>
                              );
                           })}
                        </div>
                        <p className="text-sm text-muted-foreground">{selectedDaysLabel}</p>
                     </div>

                     <div className="space-y-2">
                        <Label htmlFor="hours" className="flex items-center gap-2"><Clock3 className="h-4 w-4" /> Working Hours</Label>
                        <Input
                           id="hours"
                           placeholder="09:00 - 18:00"
                           value={form.workingHours.hours}
                           onChange={(e) => setForm({
                              ...form,
                              workingHours: { ...form.workingHours, hours: e.target.value },
                           })}
                        />
                     </div>

                     <div className="space-y-2">
                         <Label htmlFor="address" className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Address</Label>
                         <Input 
                              id="address" 
                              value={form.address} 
                              onChange={e => setForm({...form, address: e.target.value})}
                         />
                     </div>

                     <div className="space-y-2">
                         <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="h-4 w-4" /> Phone Number</Label>
                         <Input 
                              id="phone" 
                              value={form.phone} 
                              onChange={e => setForm({...form, phone: e.target.value})}
                         />
                     </div>
                </CardContent>
                <CardFooter className="flex gap-3">
                     <Button type="submit" disabled={saving}>
                         {saving ? "Saving..." : isNew ? "Create" : "Save Changes"}
                     </Button>
                     {!isNew && (
                        <Button type="button" variant="destructive" onClick={handleDelete} disabled={saving}>
                           Delete
                        </Button>
                     )}
                </CardFooter>
            </form>
         </Card>
      </div>
   );
}
