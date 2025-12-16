import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Staff {
  id: string;
  name: string;
  email?: string;
  image?: string;
}

export function StaffCard({ 
  staff, 
  onSelect, 
  selected 
}: { 
  staff: Staff; 
  onSelect?: (staff: Staff) => void;
  selected?: boolean; 
}) {
  return (
    <Card 
      className={`flex items-center p-4 gap-4 cursor-pointer transition-all ${selected ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'}`}
      onClick={() => onSelect?.(staff)}
    >
      <Avatar className="h-12 w-12">
        <AvatarImage src={staff.image} />
        <AvatarFallback>{staff.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <CardTitle className="text-base">{staff.name}</CardTitle>
        {staff.email && <CardDescription>{staff.email}</CardDescription>}
      </div>
       {onSelect && (
         <Button size="sm" variant={selected ? "default" : "ghost"}>
            {selected ? "Selected" : "Select"}
         </Button>
       )}
    </Card>
  );
}
