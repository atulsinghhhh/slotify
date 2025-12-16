"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ServiceCard } from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Loader2, Trash2 } from "lucide-react";

export default function ServicesPage() {
  const [services, setServices] = useState<Array<{ id: string; name: string; price: number; duration: number; description?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingService, setEditingService] = useState<{ id: string; name: string; price: number; duration: number; description?: string } | null>(null);
  
  const [paramName, setParamName] = useState("");
  const [paramPrice, setParamPrice] = useState("");
  const [paramDuration, setParamDuration] = useState("");
  const [paramDesc, setParamDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchServices = async () => {
    try {
      const data = await api.get("/api/service");
      setServices(data.services);
    } catch (error) {
      console.error("Failed to fetch services", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpen = (service?: { id: string; name: string; price: number; duration: number; description?: string }) => {
      setEditingService(service ?? null);
      if (service) {
          setParamName(service.name);
          setParamPrice(service.price.toString());
          setParamDuration(service.duration.toString());
          setParamDesc(service.description || "");
      } else {
          setParamName("");
          setParamPrice("");
          setParamDuration("");
          setParamDesc("");
      }
      setOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      const payload = {
          name: paramName,
          price: parseFloat(paramPrice),
          duration: parseInt(paramDuration),
          description: paramDesc
      };

      try {
          if (editingService) {
              await api.put(`/api/service/${editingService.id}`, payload);
              toast.success("Service updated");
          } else {
              await api.post("/api/service", payload);
              toast.success("Service added");
          }
          setOpen(false);
          fetchServices();
      } catch {
          toast.error("Failed to save service");
      } finally {
          setSaving(false);
      }
  };

  const handleDelete = async (id: string) => {
      if (!confirm("Delete this service?")) return;
      try {
          await api.delete(`/api/service/${id}`);
          toast.success("Service deleted");
          fetchServices();
      } catch {
          toast.error("Failed to delete service");
      }
  };

  if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Services</h1>
        <Button onClick={() => handleOpen()} className="gap-2">
            <Plus className="h-4 w-4" /> Add Service
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(s => (
            <div key={s.id} className="relative group">
                <ServiceCard service={s} />
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 p-1 rounded">
                    <Button size="sm" variant="outline" onClick={() => handleOpen(s)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(s.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingService ? "Edit Service" : "Add New Service"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
             <div className="space-y-2">
                <Label>Service Name</Label>
                <Input value={paramName} onChange={e => setParamName(e.target.value)} required />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Price ($)</Label>
                    <Input type="number" value={paramPrice} onChange={e => setParamPrice(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label>Duration (min)</Label>
                    <Input type="number" value={paramDuration} onChange={e => setParamDuration(e.target.value)} required />
                </div>
             </div>
             <DialogFooter>
                <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
             </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
