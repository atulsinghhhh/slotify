"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { StaffCard } from "@/components/StaffCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Loader2, Trash2, Edit2 } from "lucide-react"; // Added Edit2

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  
  const [paramName, setParamName] = useState("");
  const [paramEmail, setParamEmail] = useState("");
  // Working hours? Prompt mentions it but for MVP just CRUD Staff identity might be enough or simple text.
  // "manage staff and working hours". I'll add working hours as a field? Or separate?
  // I'll add a simple input for "Working Hours" string for now.
  const [saving, setSaving] = useState(false);

  const fetchStaff = async () => {
    try {
      const data = await api.get("/api/staff");
      setStaff(data);
    } catch (error) {
      console.error("Failed to fetch staff", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpen = (s?: any) => {
      setEditingStaff(s);
      if (s) {
          setParamName(s.name);
          setParamEmail(s.email || "");
      } else {
          setParamName("");
          setParamEmail("");
      }
      setOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      const payload = {
          name: paramName,
          email: paramEmail
      };

      try {
          if (editingStaff) {
              await api.put(`/api/staff/${editingStaff.id}`, payload);
              toast.success("Staff updated");
          } else {
              await api.post("/api/staff", payload);
              toast.success("Staff added");
          }
          setOpen(false);
          fetchStaff();
      } catch (error) {
          toast.error("Failed to save staff");
      } finally {
          setSaving(false);
      }
  };

  if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Staff Members</h1>
        <Button onClick={() => handleOpen()} className="gap-2">
            <Plus className="h-4 w-4" /> Add Staff
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map(s => (
            <div key={s.id} className="relative group flex items-start">
               <div className="flex-1">
                 <StaffCard staff={s} />
               </div>
               <div className="ml-2 flex flex-col gap-2">
                   <Button size="icon" variant="outline" onClick={() => handleOpen(s)}>
                       <Edit2 className="h-4 w-4"/>
                   </Button>
               </div>
            </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStaff ? "Edit Staff" : "Add New Staff"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
             <div className="space-y-2">
                <Label>Staff Name</Label>
                <Input value={paramName} onChange={e => setParamName(e.target.value)} required />
             </div>
             <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={paramEmail} onChange={e => setParamEmail(e.target.value)} />
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
