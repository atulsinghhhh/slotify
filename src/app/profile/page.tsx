"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, User, Mail, Phone, Save } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phone: "",
        image: "",
    });

    useEffect(() => {
        if (status === "loading") return;
        
        if (!session?.user) {
            router.push("/login");
            return;
        }

        if (session.user.role !== "customer") {
            router.push("/");
            return;
        }

        fetchProfile();
    }, [session, status, router]); 

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await api.get(`/api/profile/${session?.user.id}`);
            setProfile({
                name: data.name || "",
                email: data.email || "",
                phone: data.phone || "",
                image: data.image || "",
            });
        } catch (error) {
            console.error("Failed to fetch profile:", error);
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put(`/api/profile/${session?.user.id}`, {
                name: profile.name,
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

    if (status === "loading" || loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl animate-in fade-in duration-500">
            <div className="flex items-center gap-4 mb-8">
                    <div className="h-16 w-16 rounded-full bg-linear-to-br from-primary to-accent p-[2px]">
                        <div className="h-full w-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                            <User className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                <div>
                    <h1 className="text-3xl font-bold">My Profile</h1>
                    <p className="text-muted-foreground">Manage your account settings</p>
                </div>
            </div>

            <Card className="border-border/50 shadow-lg">
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                        Update your personal information below
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
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="flex items-center gap-2 font-medium">
                                <User className="h-4 w-4 text-primary" />
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                placeholder="Enter your name"
                                className="h-11 bg-muted/20"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email" className="flex items-center gap-2 font-medium">
                                <Mail className="h-4 w-4 text-primary" />
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={profile.email}
                                disabled
                                className="h-11 bg-muted opacity-70 cursor-not-allowed"
                            />
                            <p className="text-xs text-muted-foreground">
                                Email cannot be changed
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone" className="flex items-center gap-2 font-medium">
                                <Phone className="h-4 w-4 text-primary" />
                                Phone Number
                            </Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={profile.phone}
                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                placeholder="Enter your phone number"
                                className="h-11 bg-muted/20"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t bg-muted/20 p-6">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={saving} className="bg-primary shadow-lg shadow-primary/25">
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
