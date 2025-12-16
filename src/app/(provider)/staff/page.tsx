"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Loader2, Edit2, Trash2, Save, Users } from "lucide-react";

type StaffRow = { id: string; name: string; email: string; workingHours?: string; services?: { id: string; name: string }[] };

export default function StaffPage() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workingHours, setWorkingHours] = useState("");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  const isEdit = !!editingId;

  const fetchBusinessAndData = async () => {
    try {
      const biz = await api.get("/api/business");
      const id = biz?.id ?? biz?.business?.id ?? null;
      if (!id) throw new Error("No business found for provider");
      setBusinessId(id);

      const [staffList, svc] = await Promise.all([
        api.get(`/api/staff?businessId=${id}`),
        api.get(`/api/service`),
      ]);

      setStaff(Array.isArray(staffList) ? staffList : []);
      const svcArr = Array.isArray(svc?.services) ? svc.services : [];
      setServices(svcArr.map((s: any) => ({ id: s.id, name: s.name })));
    } catch (e) {
      toast.error("Failed to load staff/services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessAndData();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setPassword("");
    setWorkingHours("");
    setSelectedServiceIds([]);
    setOpen(true);
  };

  const openEdit = async (id: string) => {
    try {
      setSaving(true);
      const data = await api.get(`/api/staff/${id}`);
      setEditingId(id);
      setName(data?.user?.name ?? "");
      setEmail(data?.user?.email ?? "");
      setPassword("");
      setWorkingHours(data?.workingHours ?? "");
      setSelectedServiceIds(Array.isArray(data?.services) ? data.services.map((s: any) => s.id) : []);
      setOpen(true);
    } catch (e) {
      toast.error("Failed to load staff details");
    } finally {
      setSaving(false);
    }
  };

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!isEdit) {
        if (!name || !email || !password) {
          toast.error("Name, Email and Password are required");
          return;
        }
        await api.post("/api/staff", { name, email, password });
        toast.success("Staff created");
      } else {
        await api.put(`/api/staff/${editingId}`, { workingHours, services: selectedServiceIds });
        toast.success("Staff updated");
      }
      setOpen(false);
      await fetchBusinessAndData();
    } catch (e) {
      toast.error("Failed to save staff");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this staff?")) return;
    setSaving(true);
    try {
      await api.delete(`/api/staff/${id}`);
      toast.success("Staff deleted");
      await fetchBusinessAndData();
    } catch (e) {
      toast.error("Failed to delete staff");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2"><Users className="h-6 w-6 text-primary" /><h1 className="text-3xl font-bold">Staff Management</h1></div>
        <Card>
          <CardHeader><CardTitle>Loading Staff…</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Staff Management</h1>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Add Staff</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Working Hours</TableHead>
                <TableHead>Services</TableHead>
                <TableHead className="w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>{s.workingHours ?? "—"}</TableCell>
                  <TableCell>{Array.isArray((s as any).services) ? (s as any).services.map((x:any)=>x.name).join(", ") : "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(s.id)}><Edit2 className="h-4 w-4" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(s.id)} disabled={saving}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Staff" : "Add Staff"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isEdit && (
              <>
                <div className="space-y-2">
                  <Label>Staff Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label>Working Hours</Label>
              <Input placeholder="10:00 - 17:00" value={workingHours} onChange={(e)=>setWorkingHours(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Assigned Services</Label>
              <div className="grid grid-cols-2 gap-2">
                {services.map((svc) => {
                  const checked = selectedServiceIds.includes(svc.id);
                  return (
                    <Button
                      key={svc.id}
                      type="button"
                      variant={checked ? "default" : "outline"}
                      onClick={() => toggleService(svc.id)}
                      className="justify-start"
                    >
                      {svc.name}
                    </Button>
                  );
                })}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {isEdit ? "Save" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
