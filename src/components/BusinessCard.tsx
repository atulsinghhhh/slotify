import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone } from "lucide-react";

interface Business {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
}

export function BusinessCard({ business }: { business: Business }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>{business.name}</CardTitle>
        <CardDescription className="line-clamp-2">{business.description || "No description available"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        {business.address && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{business.address}</span>
          </div>
        )}
        {business.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span>{business.phone}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Link href={`/business/${business.id}`} className="w-full">
          <Button className="w-full">Book Appointment</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
