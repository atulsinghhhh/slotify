// Appointment status constants - must match Prisma AppointmentStatus enum
export const APPOINTMENT_STATUSES = {
  BOOKED: "BOOKED",
  COMPLETED: "COMPLETED",
  CANCELED: "CANCELED",
  NO_SHOW: "NO_SHOW",
} as const;

export type AppointmentStatus = typeof APPOINTMENT_STATUSES[keyof typeof APPOINTMENT_STATUSES];

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  BOOKED: "Booked",
  COMPLETED: "Completed",
  CANCELED: "Canceled",
  NO_SHOW: "No Show",
};

export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  BOOKED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELED: "bg-red-100 text-red-800",
  NO_SHOW: "bg-yellow-100 text-yellow-800",
};

export const VALID_STATUSES = Object.values(APPOINTMENT_STATUSES);
