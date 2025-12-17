"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { signIn, getSession } from "next-auth/react";

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid credentials");
        setLoading(false);
        return;
      }

      // Fetch session to determine role and redirect
      const session = await getSession();
      if (session?.user) {
        // Assume 'role' is part of the session user object
        const user = session.user as { role?: string };
        
        toast.success("Logged in successfully");
        
        if (user.role === "provider") { 
           router.push("/provider/dashboard");
        } 
        else if (user.role === "staff") {
           router.push("/staff/dashboard");
        }
        else {
           router.push("/business");
        }
      } else {
        router.push("/");
      }

    } catch (error) {
      toast.error("Login unexpected error");
      console.error(error);
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/" }); 
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] bg-background">
      <div className="w-full max-w-sm space-y-6 animate-in slide-in-from-bottom-8 duration-500 p-8">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
                Enter your email to sign in to your account
            </p>
          </div>

          <div className="grid gap-6">
            <Button variant="outline" className="h-11 border-border/50 hover:bg-muted/50 transition-colors" onClick={handleGoogleLogin}>
                <GoogleIcon className="mr-2 h-4 w-4" />
                Continue with Google
            </Button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
            </div>

            <form onSubmit={handleCredentialsLogin}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        placeholder="name@example.com"
                        type="email"
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect="off"
                        disabled={loading}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11 bg-muted/30 border-border/50"
                      />
                  </div>
                  <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link href="#" className="ml-auto text-sm text-primary hover:underline">
                            Forgot password?
                        </Link>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        disabled={loading}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11 bg-muted/30 border-border/50"
                      />
                  </div>
                  <Button type="submit" disabled={loading} className="h-11 shadow-lg shadow-primary/25">
                      {loading && (
                        <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      Sign In with Email
                  </Button>
                </div>
            </form>
          </div>

          <p className="px-8 text-center text-sm text-muted-foreground">
            <Link href="/signup" className="hover:text-primary underline underline-offset-4">
                Don&apos;t have an account? Sign Up
            </Link>
          </p>
      </div>
    </div>
  );
}
