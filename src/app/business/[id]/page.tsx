"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { ServiceCard } from "@/components/ServiceCard";
import { StaffCard } from "@/components/StaffCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BusinessDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [business, setBusiness] = useState<{ id: string; name: string; phone: string; address: string } | null>(null);
  const [services, setServices] = useState<Array<{ id: string; name: string; price: number; duration: number }>>([]);
  const [staff, setStaff] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const [businessData, servicesData, staffData] = await Promise.all([
          api.get(`/api/customer/${id}`),
          api.get(`/api/customer/${id}/services`),
          api.get(`/api/staff?businessId=${id}`)
        ]);
        setBusiness(businessData);
        setServices(servicesData);
        setStaff(staffData);
      } catch {
        // Error silently handled
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="container mx-auto p-8"><Skeleton className="h-64 w-full" /></div>;
  if (!business) return <div className="container mx-auto p-8">Business not found</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8 p-6 bg-card rounded-lg border shadow-sm flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
           <h1 className="text-3xl font-bold mb-2">{business.name}</h1>
           <p className="text-muted-foreground mb-4 max-w-2xl">{business.address}</p>
           <div className="flex gap-4 text-sm text-muted-foreground">
             {business.address && (
                <div className="flex items-center gap-1"><MapPin className="h-4 w-4"/> {business.address}</div>
             )}
             {business.phone && (
                <div className="flex items-center gap-1"><Phone className="h-4 w-4"/> {business.phone}</div>
             )}
           </div>
        </div>
        <Link href={`/book/${id}`}>
          <Button size="lg" className="gap-2">
            <Calendar className="h-4 w-4" /> Book Appointment
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="services" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>
        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map(s => (
                <ServiceCard key={s.id} service={s} />
            ))}
            {services.length === 0 && <div className="col-span-full text-center text-muted-foreground">No services listed.</div>}
          </div>
        </TabsContent>
        <TabsContent value="staff" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.map(s => (
                <StaffCard key={s.id} staff={s} />
            ))}
             {staff.length === 0 && <div className="col-span-full text-center text-muted-foreground">No staff listed.</div>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
