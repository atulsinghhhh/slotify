"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { api } from "@/lib/api";

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSignup = async (role: "customer" | "provider") => {
    setLoading(true);
    try {
      const endpoint = role === "customer" ? "/api/customer" : "/api/signup";
      
      await api.post(endpoint, { ...formData }); 
      
      toast.success("Account created! Logging in...");
      
      const res = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
      });

      if (res?.ok) {
           if (role === "provider") {
               router.push("/provider/dashboard");
           } else {
               router.push("/business");
           }
      } else {
           router.push("/login"); // Fallback
      }

    } catch {
      toast.error("Signup failed. Email might be already in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] bg-background">
      <div className="w-full max-w-sm space-y-6 animate-in slide-in-from-bottom-8 duration-500 p-8">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
            <p className="text-sm text-muted-foreground">
                Enter your details below to create your account
            </p>
          </div>

          <div className="grid gap-6">
            <Tabs defaultValue="customer" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 h-11 bg-muted/30">
                  <TabsTrigger value="customer" className="h-9 rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">Customer</TabsTrigger>
                  <TabsTrigger value="provider" className="h-9 rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">Provider</TabsTrigger>
                </TabsList>

                <Button variant="outline" className="w-full h-11 relative mb-6 border-border/50 hover:bg-muted/50" onClick={() => signIn("google")}>
                  <GoogleIcon className="mr-2 h-4 w-4" />
                  Sign up with Google
                </Button>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or with email</span>
                  </div>
                </div>

                <TabsContent value="customer" className="mt-0 space-y-4">
                  <form onSubmit={(e) => { e.preventDefault(); handleSignup("customer"); }} className="space-y-4">
                      <div className="grid gap-2">
                          <Label>Full Name</Label>
                          <Input required onChange={(e) => setFormData({...formData, name: e.target.value})} className="h-11 bg-muted/30 border-border/50" placeholder="John Doe" />
                      </div>
                      <div className="grid gap-2">
                          <Label>Email</Label>
                          <Input type="email" required onChange={(e) => setFormData({...formData, email: e.target.value})} className="h-11 bg-muted/30 border-border/50" placeholder="m@example.com" />
                      </div>
                      <div className="grid gap-2">
                          <Label>Password</Label>
                          <Input type="password" required onChange={(e) => setFormData({...formData, password: e.target.value})} className="h-11 bg-muted/30 border-border/50" />
                      </div>
                      <Button type="submit" className="w-full h-11 shadow-lg shadow-primary/25" disabled={loading}>
                          {loading && <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                          Sign Up as Customer
                      </Button>
                  </form>
                </TabsContent>

                <TabsContent value="provider" className="mt-0 space-y-4">
                  <form onSubmit={(e) => { e.preventDefault(); handleSignup("provider"); }} className="space-y-4">
                      <div className="grid gap-2">
                          <Label>Full Name</Label>
                          <Input required onChange={(e) => setFormData({...formData, name: e.target.value})} className="h-11 bg-muted/30 border-border/50" placeholder="Jane Smith" />
                      </div>
                      <div className="grid gap-2">
                          <Label>Email</Label>
                          <Input type="email" required onChange={(e) => setFormData({...formData, email: e.target.value})} className="h-11 bg-muted/30 border-border/50" placeholder="pro@business.com" />
                      </div>
                      <div className="grid gap-2">
                          <Label>Password</Label>
                          <Input type="password" required onChange={(e) => setFormData({...formData, password: e.target.value})} className="h-11 bg-muted/30 border-border/50" />
                      </div>
                      <Button type="submit" className="w-full h-11 shadow-lg shadow-primary/25" disabled={loading}>
                          {loading && <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                          Sign Up as Provider
                      </Button>
                  </form>
                </TabsContent>
            </Tabs>
          </div>

          <p className="px-8 text-center text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-primary underline underline-offset-4">
                Already have an account? Sign In
            </Link>
          </p>
      </div>
    </div>
  );
}