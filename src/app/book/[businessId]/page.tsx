"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ServiceCard } from "@/components/ServiceCard";
import { StaffCard } from "@/components/StaffCard";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { format } from "date-fns";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export default function BookingPage() {
    const params = useParams();
    const router = useRouter();
    const businessId = params?.businessId as string;

    const [step, setStep] = useState(1);
    const [services, setServices] = useState<Array<{ id: string; name: string; duration: number; price: number }>>([]);
    const [staffList, setStaffList] = useState<Array<{ id: string; name: string; email: string }>>([]);
    const [availability, setAvailability] = useState<string[]>([]);
    
    const [selectedService, setSelectedService] = useState<{ id: string; name: string; duration: number; price: number } | null>(null);
    const [selectedStaff, setSelectedStaff] = useState<{ id: string; name: string; email: string } | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!businessId) return;
        const fetchInitialData = async () => {
            try {
                const servicesData = await api.get(`/api/customer/${businessId}/services`);
                setServices(servicesData);
            } catch {
                toast.error("Failed to load options");
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [businessId]);

  // Fetch staff when entering Step 2 (Staff Selection)
    useEffect(() => {
        if (step === 2 && selectedService) {
            const fetchStaff = async () => {
                setLoading(true);
                try {
                    // Assuming API endpoint: /api/services/:serviceId/staff 
                    // OR /api/staff?serviceId=:serviceId
                    const data = await api.get(`/api/staff?serviceId=${selectedService.id}`);
                    setStaffList(data);
                } catch (error) {
                    console.error("Failed to fetch staff", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchStaff();
        }
    }, [step, selectedService]);

    useEffect(() => {
        if (step === 3 && selectedDate && selectedService) {
            const fetchAvailability = async () => {
                setAvailability([]); 
                try {
                    const dateStr = format(selectedDate, "yyyy-MM-dd");
                    const staffQuery = selectedStaff ? `&staffId=${selectedStaff.id}` : "";
                    const data = await api.get(`/api/availability?businessId=${businessId}&serviceId=${selectedService.id}${staffQuery}&date=${dateStr}`);
                    console.log("Fetched availability: ", data.slots);
                    setAvailability(data.slots || []);
                } catch (error) {
                    console.error("Failed to fetch availability", error);
                    setAvailability(["09:00", "09:30", "10:00", "11:00", "14:00", "15:30"]);
                }
            };
            fetchAvailability();
        }
    }, [step, selectedDate, selectedService, selectedStaff, businessId]);

    const handleNext = () => {
        setStep(s => s + 1);
    };
    
    const handleBack = () => {
        setStep(s => s - 1);
    };

    const handleBook = async () => {
        if (!selectedService || !selectedDate || !selectedTime) return;
        setSubmitting(true);
        try {
            await api.post("/api/appointment", {
                businessId,
                serviceId: selectedService.id,
                staffId: selectedStaff?.id,
                date: format(selectedDate, "yyyy-MM-dd"),
                startTime: selectedTime,
                endTime: "calculate-based-on-duration-or-handled-by-backend" // Backend should handle duration
            });
            toast.success("Appointment booked successfully!");
            router.push("/appointments");
        } catch {
            toast.error("Booking failed. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Book Appointment</CardTitle>
                    <CardDescription>Step {step} of 4</CardDescription>
                </CardHeader>
                <CardContent>
                    {step === 1 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Select Service</h3>
                            <div className="grid gap-3">
                                {services.map(s => (
                                    <ServiceCard 
                                        key={s.id} 
                                        service={s} 
                                        selected={selectedService?.id === s.id}
                                        onSelect={() => setSelectedService(s)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {step === 2 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Select Staff (Optional)</h3>
                            <div className="grid gap-3">
                                <StaffCard 
                                    staff={{ id: "any", name: "Any Staff Member" }}
                                    selected={selectedStaff === null}
                                    onSelect={() => setSelectedStaff(null)}
                                />
                                {loading ? <Loader2 className="animate-spin" /> : staffList.map(s => (
                                    <StaffCard 
                                        key={s.id} 
                                        staff={s} 
                                        selected={selectedStaff?.id === s.id}
                                        onSelect={() => setSelectedStaff(s)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium">Select Date & Time</h3>
                            <div className="flex flex-col md:flex-row gap-8 justify-center">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    disabled={(date) => date.getTime() < new Date().setHours(0,0,0,0)}
                                    className="rounded-md border shadow"
                                />
                                <div className="flex-1">
                                    <h4 className="mb-2 font-sm text-muted-foreground">Available Slots</h4>
                                    {!selectedDate ? (
                                        <p className="text-sm">Please select a date first.</p>
                                    ) : availability.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-2">
                                            {availability.map(slot => (
                                                <Button 
                                                    key={slot} 
                                                    variant={selectedTime === slot ? "default" : "outline"} 
                                                    size="sm"
                                                    onClick={() => setSelectedTime(slot)}
                                                >
                                                    {slot}
                                                </Button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm">No slots available on this date.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Confirm Booking</h3>
                            <div className="space-y-2 bg-muted p-4 rounded-md">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Service:</span>
                                    <span className="font-medium">{selectedService?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Staff:</span>
                                    <span className="font-medium">{selectedStaff ? selectedStaff.name : "Any Staff"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Date:</span>
                                    <span className="font-medium">{selectedDate ? format(selectedDate, "PPP") : ""}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Time:</span>
                                    <span className="font-medium">{selectedTime}</span>
                                </div>
                                <div className="flex justify-between border-t pt-2 mt-2">
                                    <span className="font-bold">Price:</span>
                                    <span className="font-bold">${selectedService?.price}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={handleBack} disabled={step === 1}>
                        <ChevronLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    
                    {step < 4 ? (
                        <Button onClick={handleNext} disabled={
                            (step === 1 && !selectedService) ||
                            (step === 3 && (!selectedDate || !selectedTime))
                        }>
                            Next <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button onClick={handleBook} disabled={submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Booking <Check className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
