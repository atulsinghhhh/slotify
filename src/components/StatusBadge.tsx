import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS, STATUS_LABELS, AppointmentStatus } from "@/lib/appointment-statuses";

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const colorClass = STATUS_COLORS[status] || "bg-gray-100 text-gray-800";
  const label = STATUS_LABELS[status] ?? status;

  return (
    <Badge className={colorClass}>
      {label}
    </Badge>
  );
}
