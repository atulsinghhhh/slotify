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

// Updated colors for dark theme premium look
export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  BOOKED: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  COMPLETED: "bg-green-500/15 text-green-400 border border-green-500/20",
  CANCELED: "bg-red-500/15 text-red-400 border border-red-500/20",
  NO_SHOW: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
};

export const VALID_STATUSES = Object.values(APPOINTMENT_STATUSES);
