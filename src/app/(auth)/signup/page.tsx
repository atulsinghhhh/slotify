"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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

  // Handle Signup (Create User via API then Login logic)
  // Assuming Backend endpoint /api/signup supports { ...data, role: "CUSTOMER" | "PROVIDER" }
  // OR we use separate endpoints. 
  // Codebase had `Mongoose Pre-Save Error` in previous conversations, implying Mongoose/MongoDB or Prisma?
  // Current package.json has Prisma.
  // I will use a generic signup endpoint and pass Role.

  const handleSignup = async (role: "customer" | "provider") => {
    setLoading(true);
    try {
      // Use different endpoints based on role
      const endpoint = role === "customer" ? "/api/customer" : "/api/signup";
      
      await api.post(endpoint, { ...formData }); 
      
      toast.success("Account created! Logging in...");
      
      const res = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
      });

      if (res?.ok) {
           // Fetch session to double check role if needed, or just redirect based on signup role
           // Since we just created it, we know the role.
           if (role === "provider") {
               router.push("/provider/dashboard");
           } else {
               router.push("/");
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
    <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] bg-muted/20">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Join Slotify today</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="customer" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="customer">Customer</TabsTrigger>
              <TabsTrigger value="provider">Provider</TabsTrigger>
            </TabsList>
            
            {/* GOOGLE SIGN UP (Common for both? Or separate?) */}
            {/* Usually Google sign up defaults to a specific role or checks DB. */}
            <Button variant="outline" className="w-full mb-4" onClick={() => signIn("google")}>
                 <GoogleIcon className="mr-2 h-4 w-4" />
                 Sign up with Google
            </Button>

            <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or with email</span>
                </div>
            </div>

            <TabsContent value="customer">
               <form onSubmit={(e) => { e.preventDefault(); handleSignup("customer"); }} className="space-y-4">
                 <div className="space-y-2">
                   <Label>Full Name</Label>
                   <Input placeholder="John Doe" required onChange={(e) => setFormData({...formData, name: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                   <Label>Email</Label>
                   <Input type="email" placeholder="m@example.com" required onChange={(e) => setFormData({...formData, email: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                   <Label>Password</Label>
                   <Input type="password" required onChange={(e) => setFormData({...formData, password: e.target.value})} />
                 </div>
                 <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating..." : "Sign Up as Customer"}</Button>
               </form>
            </TabsContent>

            <TabsContent value="provider">
               <form onSubmit={(e) => { e.preventDefault(); handleSignup("provider"); }} className="space-y-4">
                 <div className="space-y-2">
                   <Label>Full Name</Label>
                   <Input placeholder="Jane Smith" required onChange={(e) => setFormData({...formData, name: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                   <Label>Email</Label>
                   <Input type="email" placeholder="pro@business.com" required onChange={(e) => setFormData({...formData, email: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                   <Label>Password</Label>
                   <Input type="password" required onChange={(e) => setFormData({...formData, password: e.target.value})} />
                 </div>
                 <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating..." : "Sign Up as Provider"}</Button>
               </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}