"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea"; // Need to ensure it's installed or use Input
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function BusinessPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState({
      id: "",
      name: "",
      description: "",
      address: "",
      phone: ""
  });
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const data = await api.get("/api/business");
        if (data && data.length > 0) {
             setBusiness(data[0]); // Assuming one business per provider for MVP
        } else if (data && data.id) {
             setBusiness(data);
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
        if (isNew) {
            const res = await api.post("/api/business", business);
            setBusiness(res);
            setIsNew(false);
            toast.success("Business created successfully");
        } else {
            const res = await api.put(`/api/business/${business.id}`, business);
            setBusiness(res);
            toast.success("Business updated successfully");
        }
    } catch (error) {
        toast.error("Failed to save business details");
    } finally {
        setSaving(false);
    }
  };

   const handleDelete = async () => {
      if (!business.id) return;
      setSaving(true);
      try {
         await api.delete(`/api/business/${business.id}`);
         toast.success("Business deleted successfully");
         setBusiness({ id: "", name: "", description: "", address: "", phone: "" });
         setIsNew(true);
      } catch (error) {
         toast.error("Failed to delete business");
      } finally {
         setSaving(false);
      }
   };

  if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Business Profile</h1>
      <Card>
        <CardHeader>
           <CardTitle>{isNew ? "Create Business" : "Edit Business Details"}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSave}>
           <CardContent className="space-y-4">
              <div className="space-y-2">
                 <Label htmlFor="name">Business Name</Label>
                 <Input 
                    id="name" 
                    value={business.name} 
                    onChange={e => setBusiness({...business, name: e.target.value})}
                    required 
                 />
              </div>
              <div className="space-y-2">
                 <Label htmlFor="address">Address</Label>
                 <Input 
                    id="address" 
                    value={business.address} 
                    onChange={e => setBusiness({...business, address: e.target.value})}
                 />
              </div>
              <div className="space-y-2">
                 <Label htmlFor="phone">Phone</Label>
                 <Input 
                    id="phone" 
                    value={business.phone} 
                    onChange={e => setBusiness({...business, phone: e.target.value})}
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
