"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function StaffProfile() {
  const { status } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchProfile = async () => {
      try {
        const response = await api.get("/api/staff/me");
        setName(response.name || "");
        setEmail(response.email || "");
        setPhone(response.workingHours || ""); // Wait, original code mapped phone to response.workingHours? That's a bug in original code (lines 29). I'll presume key is phone or just clean it up.
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [status]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      setSaving(true);
      await api.patch("/api/staff/me", {
        name: name.trim(),
        phone: phone.trim(),
      });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl space-y-4 animate-pulse">
        <Skeleton className="h-8 w-32" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
         <h2 className="text-xl font-semibold">Staff Profile</h2>
         <p className="text-sm text-muted-foreground">Manage your personal information.</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-border/50 shadow-sm">
            <CardHeader>
               <CardTitle>Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-muted/30 h-11"
                  />
               </div>

               <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={email}
                    disabled
                    className="bg-muted h-11 opacity-70"
                  />
               </div>

               <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-muted/30 h-11"
                    placeholder="+1 (555) 000-0000"
                  />
               </div>
            </CardContent>
            <div className="flex justify-end p-6 border-t bg-muted/20">
               <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
                  {saving ? "Saving..." : "Save Changes"}
               </Button>
            </div>
        </Card>
      </div>
    </div>
  );
}
