import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number; // minutes
  price: number;
}

export function ServiceCard({ 
  service, 
  onSelect, 
  selected 
}: { 
  service: Service; 
  onSelect?: (service: Service) => void; 
  selected?: boolean;
}) {
  return (
    <Card 
      className={`cursor-pointer transition-all ${selected ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'}`}
      onClick={() => onSelect?.(service)}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{service.name}</CardTitle>
          <span className="font-bold text-lg">${service.price}</span>
        </div>
        <CardDescription>{service.duration} mins</CardDescription>
      </CardHeader>
      {service.description && (
        <CardContent>
          <p className="text-sm text-muted-foreground">{service.description}</p>
        </CardContent>
      )}
      {onSelect && (
        <CardFooter>
            <Button variant={selected ? "default" : "outline"} className="w-full">
                {selected ? "Selected" : "Select Service"}
            </Button>
        </CardFooter>
      )}
    </Card>
  );
}
