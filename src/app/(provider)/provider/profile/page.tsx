"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, User, Mail, Store } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

export default function ProviderProfilePage() {
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        businessName: "",
        phone: "",
        image: "",
    });

    useEffect(() => {
        if (status === "loading") return;
        
        const fetchProfile = async () => {
            try {
                
                
                const data = await api.get(`/api/provider/me`); 
                setProfile({
                    name: data.name || "",
                    email: data.email || "",
                    businessName: data.business?.name || "",
                    phone: data.business?.phone || "",
                    image: data.image || "",
                });
            } catch (error) {
                console.error("Failed to fetch provider profile:", error);
                // Fallback to loading basic user data if provider/me fails or doesn't exist yet
                if (session?.user) {
                     setProfile(p => ({ ...p, name: session.user.name || "", email: session.user.email || "" }));
                }
            } finally {
                setLoading(false);
            }
        };

        if (status === "authenticated") {
            fetchProfile();
        }
    }, [status, session]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.patch(`/api/provider/me`, {
                name: profile.name,
                businessName: profile.businessName,
                phone: profile.phone,
                image: profile.image,
            });
            toast.success("Profile updated successfully");
        } catch (error) {
            console.error("Failed to update profile:", error);
            toast.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl">
            <div>
                 <h2 className="text-3xl font-bold tracking-tight">Provider Profile</h2>
                 <p className="text-muted-foreground">Manage your account and business details.</p>
            </div>

            <Card className="border-border/50 shadow-md">
                <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>
                        Update your personal and business details visible to customers.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSave}>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col gap-4">
                            <Label>Profile Photo</Label>
                            <ImageUpload 
                                value={profile.image ? [profile.image] : []}
                                disabled={saving}
                                onChange={(url) => setProfile({ ...profile, image: url })}
                                onRemove={() => setProfile({ ...profile, image: "" })}
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        className="pl-9"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        value={profile.email}
                                        disabled
                                        className="pl-9 bg-muted opacity-70"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="businessName">Business Name</Label>
                                <div className="relative">
                                    <Store className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="businessName"
                                        value={profile.businessName}
                                        onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                                        className="pl-9"
                                        placeholder="Acme Inc."
                                    />
                                </div>
                            </div>
                             {/* Phone is often linked to Business, not just User, depending on schema */}
                             <div className="space-y-2">
                                <Label htmlFor="phone">Business Phone</Label>
                                <Input
                                    id="phone"
                                    value={profile.phone}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t bg-muted/20 p-6">
                        <Button type="button" variant="ghost">Cancel</Button>
                        <Button type="submit" disabled={saving}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
