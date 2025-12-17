"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Building2, Clock, MapPin, Phone, Plus, Pencil, Trash2, Calendar } from "lucide-react";

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
   const [businesses, setBusinesses] = useState<BusinessPayload[]>([]);
   const [isDialogOpen, setIsDialogOpen] = useState(false);
   const [editingBusiness, setEditingBusiness] = useState<BusinessPayload | null>(null);
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

   const fetchBusinesses = async () => {
      setLoading(true);
      try {
         const data = await api.get("/api/business");
         // Handle both single business and array response
         if (Array.isArray(data)) {
            setBusinesses(data.map(b => ({
               id: b.id,
               name: b.name ?? "",
               address: b.address ?? "",
               phone: b.phone ?? "",
               workingHours: {
                  days: Array.isArray(b.workingHours?.days) ? b.workingHours.days : [],
                  hours: typeof b.workingHours?.hours === "string" ? b.workingHours.hours : "09:00 - 18:00"
               }
            })));
         } else if (data && data.id) {
            const days = Array.isArray(data.workingHours?.days) ? data.workingHours.days : [];
            const hours = typeof data.workingHours?.hours === "string" ? data.workingHours.hours : "09:00 - 18:00";
            setBusinesses([{
               id: data.id,
               name: data.name ?? "",
               address: data.address ?? "",
               phone: data.phone ?? "",
               workingHours: { days, hours },
            }]);
         } else {
            setBusinesses([]);
         }
      } catch {
         setBusinesses([]);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchBusinesses();
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

   const handleCreateNew = () => {
      setEditingBusiness(null);
      setForm({
         id: undefined,
         name: "",
         address: "",
         phone: "",
         workingHours: { days: [], hours: "09:00 - 18:00" },
      });
      setIsDialogOpen(true);
   };

   const handleEdit = (business: BusinessPayload) => {
      setEditingBusiness(business);
      setForm({
         id: business.id,
         name: business.name,
         address: business.address,
         phone: business.phone,
         workingHours: business.workingHours,
      });
      setIsDialogOpen(true);
   };

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

         if (!form.id) {
            await api.post("/api/business", payload);
            toast.success("Business created successfully");
         } else {
            await api.put(`/api/business/${form.id}`, payload);
            toast.success("Business updated successfully");
         }
         
         setIsDialogOpen(false);
         fetchBusinesses();
      } catch {
         toast.error("Failed to save business details");
      } finally {
         setSaving(false);
      }
   };

   const handleDelete = async (businessId: string) => {
      if (!confirm("Are you sure you want to delete this business?")) return;
      
      setSaving(true);
      try {
         await api.delete(`/api/business/${businessId}`);
         toast.success("Business deleted successfully");
         fetchBusinesses();
      } catch {
         toast.error("Failed to delete business");
      } finally {
         setSaving(false);
      }
   };

   if (loading) {
      return (
         <div className="p-8 flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading businesses…
         </div>
      );
   }

   return (
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <Building2 className="h-6 w-6 text-primary" />
               <h1 className="text-3xl font-bold">My Businesses</h1>
            </div>
            <Button onClick={handleCreateNew}>
               <Plus className="h-4 w-4 mr-2" />
               Create Business
            </Button>
         </div>

         {businesses.length === 0 ? (
            <Card className="p-12">
               <div className="flex flex-col items-center justify-center text-center space-y-4">
                  <Building2 className="h-16 w-16 text-muted-foreground" />
                  <div className="space-y-2">
                     <h3 className="text-xl font-semibold">No businesses yet</h3>
                     <p className="text-muted-foreground">
                        Get started by creating your first business
                     </p>
                  </div>
                  <Button onClick={handleCreateNew}>
                     <Plus className="h-4 w-4 mr-2" />
                     Create Business
                  </Button>
               </div>
            </Card>
         ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
               {businesses.map((business) => (
                  <Card key={business.id} className="hover:shadow-lg transition-shadow">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Building2 className="h-5 w-5" />
                           {business.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-1">
                           {business.address || "No address provided"}
                        </CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                           <MapPin className="h-4 w-4" />
                           <span className="truncate">{business.address || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                           <Phone className="h-4 w-4" />
                           <span>{business.phone || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                           <Clock className="h-4 w-4" />
                           <span>{business.workingHours.hours}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                           <Calendar className="h-4 w-4 text-muted-foreground" />
                           <div className="flex flex-wrap gap-1">
                              {business.workingHours.days.length > 0 ? (
                                 business.workingHours.days.map((day) => (
                                    <span
                                       key={day}
                                       className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium"
                                    >
                                       {day}
                                    </span>
                                 ))
                              ) : (
                                 <span className="text-muted-foreground">No days set</span>
                              )}
                           </div>
                        </div>
                     </CardContent>
                     <CardFooter className="flex gap-2">
                        <Button
                           size="sm"
                           variant="outline"
                           className="flex-1"
                           onClick={() => handleEdit(business)}
                        >
                           <Pencil className="h-4 w-4 mr-2" />
                           Update
                        </Button>
                        <Button
                           size="sm"
                           variant="destructive"
                           onClick={() => handleDelete(business.id!)}
                           disabled={saving}
                        >
                           <Trash2 className="h-4 w-4" />
                        </Button>
                     </CardFooter>
                  </Card>
               ))}
            </div>
         )}

         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
               <DialogHeader>
                  <DialogTitle>
                     {editingBusiness ? "Update Business" : "Create New Business"}
                  </DialogTitle>
                  <DialogDescription>
                     {editingBusiness
                        ? "Update your business information below."
                        : "Fill in the details to create a new business."}
                  </DialogDescription>
               </DialogHeader>
               <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-2">
                     <Label htmlFor="name">Business Name</Label>
                     <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                     <Label htmlFor="hours" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Working Hours
                     </Label>
                     <Input
                        id="hours"
                        placeholder="09:00 - 18:00"
                        value={form.workingHours.hours}
                        onChange={(e) =>
                           setForm({
                              ...form,
                              workingHours: { ...form.workingHours, hours: e.target.value },
                           })
                        }
                     />
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="address" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> Address
                     </Label>
                     <Input
                        id="address"
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                     />
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" /> Phone Number
                     </Label>
                     <Input
                        id="phone"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                     />
                  </div>

                  <DialogFooter>
                     <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                     </Button>
                     <Button type="submit" disabled={saving}>
                        {saving ? (
                           <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                           </>
                        ) : editingBusiness ? (
                           "Update Business"
                        ) : (
                           "Create Business"
                        )}
                     </Button>
                  </DialogFooter>
               </form>
            </DialogContent>
         </Dialog>
      </div>
   );
}
