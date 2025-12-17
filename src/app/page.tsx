"use client";

import Link from "next/link";
import { 
  Calendar, 
  Clock, 
  Users, 
  ShieldCheck, 
  Zap, 
  Settings, 
  ArrowRight, 
  CheckCircle2, 
  XCircle,
  Menu,
  X,
  ChevronRight,
  Play,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 overflow-x-hidden dark">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Slotify
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it works</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
            <div className="flex items-center gap-4 ml-4">
              <Link href="/login">
                <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/5">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 rounded-full px-6">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-background p-4 flex flex-col gap-4">
             <Link href="#features" className="text-sm font-medium text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Features</Link>
             <Link href="#how-it-works" className="text-sm font-medium text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>How it works</Link>
             <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
             <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 rounded-full blur-[100px] -z-10 opacity-50" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] -z-10 opacity-30" />

        <div className="container mx-auto px-4 text-center max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            New v2.0 is live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Smart Appointment Booking<br />
            <span className="bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent">
              For Modern Businesses
            </span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Stop wasting time with manual scheduling. Slotify automates your bookings, 
            reminders, and staff management so you can focus on growing your business.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-black hover:bg-slate-200 rounded-full px-8 h-12 text-base font-semibold shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/5 rounded-full h-12 px-8">
                <Play className="mr-2 h-4 w-4" />
                View Demo
              </Button>
            </Link>
          </div>

          <div className="mt-16 flex items-center justify-center gap-8 text-slate-500 animate-in fade-in duration-1000 delay-500">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span className="text-sm font-medium">Smart Calendar</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span className="text-sm font-medium">24/7 Booking</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span className="text-sm font-medium">Team Management</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02]">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-slate-500 font-medium mb-8">TRUSTED BY SERVICE BUSINESSES WORLDWIDE</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Abstract Logo Placeholders */}
             {[1, 2, 3, 4, 5].map((i) => (
               <div key={i} className="flex items-center gap-2 text-slate-300 font-semibold text-lg">
                  <div className="h-6 w-6 bg-slate-600 rounded-sm opacity-50" />
                  <span>Company {i}</span>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="py-24 container mx-auto px-4">
         <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-semibold uppercase tracking-wider">
                  The Problem
               </div>
               <h2 className="text-3xl md:text-4xl font-bold">Manual booking is killing your productivity</h2>
               <div className="space-y-6">
                  {[
                    "Double-booked appointments causing conflicts",
                    "Endless back-and-forth phone calls and emails",
                    "Missed appointments and lost revenue",
                    "Messy spreadsheets and paper calendars"
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-red-500/10 bg-red-500/5">
                       <XCircle className="h-6 w-6 text-red-400 shrink-0" />
                       <p className="text-slate-300">{item}</p>
                    </div>
                  ))}
               </div>
            </div>

            <div className="space-y-8 relative">
               <div className="absolute -inset-4 bg-primary/20 rounded-3xl blur-3xl -z-10 opacity-20" />
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/20 bg-green-500/10 text-green-400 text-xs font-semibold uppercase tracking-wider">
                  The Solution
               </div>
               <h2 className="text-3xl md:text-4xl font-bold">Slotify makes scheduling effortless</h2>
               <div className="space-y-6">
                  {[
                     "Automated booking with real-time availability",
                     "Instant confirmations and smart reminders",
                     "Self-service portal for your clients",
                     "Centralized dashboard for your entire team"
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-green-500/20 bg-green-500/10 shadow-lg shadow-green-900/10">
                       <CheckCircle2 className="h-6 w-6 text-green-400 shrink-0" />
                       <p className="text-white font-medium">{item}</p>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to run your business</h2>
            <p className="text-slate-400 text-lg">Powerful features designed to help you manage specific needs of your service business.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
             {[
               { icon: Settings, title: "Business Management", desc: "Configure your services, duration, and pricing in minutes." },
               { icon: Users, title: "Staff Scheduling", desc: "Manage team shifts, holidays, and specific working hours." },
               { icon: Calendar, title: "Self-Service Booking", desc: "Give clients a beautiful booking page to schedule 24/7." },
               { icon: Clock, title: "Real-Time Availability", desc: "Never worry about double bookings. We handle the logic." },
               { icon: Zap, title: "Automated Reminders", desc: "Reduce no-shows with email and SMS notifications." },
               { icon: ShieldCheck, title: "Secure Access", desc: "Role-based permissions for owners, managers, and staff." }
             ].map((feature, i) => (
               <div key={i} className="group p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 hover:-translate-y-1">
                 <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                   <feature.icon className="h-6 w-6 text-primary" />
                 </div>
                 <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                 <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 container mx-auto px-4">
         <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get started in 3 simple steps</h2>
            <p className="text-slate-400 text-lg">Running your business shouldn't be complicated.</p>
         </div>

         <div className="relative grid md:grid-cols-3 gap-12">
            <div className="absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent hidden md:block" />
            
            {[
              { step: 1, title: "Create Business", desc: "Sign up and set up your company profile." },
              { step: 2, title: "Add Services", desc: "Define what you offer and your team's schedule." },
              { step: 3, title: "Start Booking", desc: "Share your link and watch appointments roll in." }
            ].map((item, i) => (
               <div key={i} className="relative flex flex-col items-center text-center space-y-4">
                  <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full border-4 border-background bg-slate-900 shadow-xl">
                     <span className="text-3xl font-bold text-primary">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="text-slate-400">{item.desc}</p>
               </div>
            ))}
         </div>
      </section>

      {/* Availability / Highlight */}
      <section className="py-24 relative overflow-hidden">
         <div className="absolute inset-0 bg-primary/5 opacity-20" />
         <div className="container mx-auto px-4 relative">
             <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border border-white/10 p-12 md:p-20 text-center overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                
                <h2 className="text-3xl md:text-5xl font-bold mb-8">
                   No Overlaps. <span className="text-primary">No No-Shows.</span>
                </h2>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12">
                   Our smart availability engine ensures 100% accurate scheduling. 
                   Combined with automated reminders, you'll maximize your billable hours.
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                   <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400">
                      <CheckCircle2 className="h-4 w-4" /> 99.9% Uptime
                   </div>
                   <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                      <ShieldCheck className="h-4 w-4" /> Enterprise Security
                   </div>
                   <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">
                      <Zap className="h-4 w-4" /> Instant Sync
                   </div>
                </div>
             </div>
         </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 container mx-auto px-4 text-center">
         <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
               Start Managing Appointments<br />
               <span className="text-primary">The Smart Way</span>
            </h2>
            <p className="text-xl text-slate-400 mb-8">
               Join thousands of businesses streamlining their operations with Slotify.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <Link href="/signup">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-10 h-14 text-lg shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105">
                     Create Your Business
                     <ChevronRight className="ml-2" />
                  </Button>
               </Link>
               <Link href="/login">
                  <Button size="lg" variant="outline" className="border-white/10 hover:bg-white/5 rounded-full px-10 h-14 text-lg">
                     Sign In
                  </Button>
               </Link>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950 py-16 text-sm text-slate-400">
         <div className="container mx-auto px-4">
             <div className="grid md:grid-cols-4 gap-12 mb-12">
                <div className="col-span-1 md:col-span-2 space-y-4">
                   <div className="flex items-center gap-2 text-white font-bold text-xl">
                      <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                         <Calendar className="h-5 w-5 text-white" />
                      </div>
                      Slotify
                   </div>
                   <p className="max-w-xs">Smart scheduling infrastructure for the modern web. Built for service businesses of all sizes.</p>
                </div>
                <div>
                   <h4 className="font-semibold text-white mb-4">Product</h4>
                   <ul className="space-y-2">
                      <li><Link href="#" className="hover:text-primary transition-colors">Features</Link></li>
                      <li><Link href="#" className="hover:text-primary transition-colors">Pricing</Link></li>
                      <li><Link href="#" className="hover:text-primary transition-colors">Showcase</Link></li>
                   </ul>
                </div>
                <div>
                   <h4 className="font-semibold text-white mb-4">Legal</h4>
                   <ul className="space-y-2">
                      <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                      <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                      <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
                   </ul>
                </div>
             </div>
             <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <p>&copy; 2025 Slotify Inc. All rights reserved.</p>
                <div className="flex gap-6">
                   <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
                   <Link href="#" className="hover:text-white transition-colors">GitHub</Link>
                   <Link href="#" className="hover:text-white transition-colors">LinkedIn</Link>
                </div>
             </div>
         </div>
      </footer>
    </div>
  );
}
