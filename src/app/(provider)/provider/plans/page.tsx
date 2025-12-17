"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Starter",
    description: "Perfect for solopreneurs getting started",
    price: "$0",
    period: "/month",
    features: [
      "1 Provider Account",
      "Up to 50 Appointments/mo",
      "Basic Calendar Management",
      "Email Notifications",
      "Standard Support"
    ],
    buttonText: "Current Plan",
    current: true,
  },
  {
    name: "Pro",
    description: "For growing businesses needing more power",
    price: "$29",
    period: "/month",
    features: [
      "Up to 5 Provider Accounts",
      "Unlimited Appointments",
      "Advanced Analytics",
      "SMS Reminders",
      "Custom Branding",
      "Priority Support"
    ],
    buttonText: "Upgrade to Pro",
    popular: true,
    current: false,
  },
  {
    name: "Business",
    description: "Scale your operations with ease",
    price: "$79",
    period: "/month",
    features: [
      "Unlimited Provider Accounts",
      "Multi-location Support",
      "API Access",
      "White-label Solution",
      "Dedicated Account Manager",
      "24/7 Phone Support"
    ],
    buttonText: "Contact Sales",
    current: false,
  }
];

export default function PlansPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto py-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-primary to-purple-400">
            Choose the Right Plan for You
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Scale your business with our flexible pricing plans. No hidden fees, cancel anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card 
            key={plan.name} 
            className={`relative flex flex-col h-full hover:shadow-xl transition-all duration-300 border-border/50 ${plan.popular ? 'border-primary shadow-lg shadow-primary/10' : ''}`}
          >
            {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                   <Badge className="bg-primary hover:bg-primary px-3 py-1">Most Popular</Badge>
                </div>
            )}
            
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground ml-2">{plan.period}</span>
              </div>
              
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-foreground/80">
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${plan.popular ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        <Check className="h-3 w-3" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                variant={plan.popular ? "default" : "outline"} 
                className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25' : ''}`}
                disabled={plan.current}
              >
                {plan.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center bg-muted/20 rounded-2xl p-8 border border-white/5">
         <h3 className="text-xl font-semibold mb-2">Need a custom solution?</h3>
         <p className="text-muted-foreground mb-6">We prioritize your specific business needs. Let&apos;s talk about how Slotify can work for you.</p>
         <Button variant="outline">Contact Enterprise Sales</Button>
      </div>
    </div>
  );
}
