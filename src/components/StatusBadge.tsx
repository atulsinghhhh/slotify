import { Badge } from "@/components/ui/badge";

export type Status = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

const statusStyles: Record<Status, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  CONFIRMED: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  CANCELLED: "bg-red-100 text-red-800 hover:bg-red-100",
  COMPLETED: "bg-green-100 text-green-800 hover:bg-green-100",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge className={statusStyles[status] || "bg-gray-100 text-gray-800"}>
      {status}
    </Badge>
  );
}
