import { prisma } from "@/lib/prisma";

export type ReminderType = "24_HOURS_BEFORE" | "1_HOUR_BEFORE" | "ON_BOOKING";

interface ReminderConfig {
  type: ReminderType;
  minutesBefore: number;
}

const REMINDER_TYPES: Record<ReminderType, ReminderConfig> = {
  "24_HOURS_BEFORE": { type: "24_HOURS_BEFORE", minutesBefore: 24 * 60 },
  "1_HOUR_BEFORE": { type: "1_HOUR_BEFORE", minutesBefore: 60 },
  "ON_BOOKING": { type: "ON_BOOKING", minutesBefore: 0 },
};

/**
 * Sends reminders for upcoming appointments
 * Called by cron job - safe to call multiple times
 */
export async function processReminders() {
  try {
    const now = new Date();
    const results = {
      processed: 0,
      remindersSent: 0,
      errors: 0,
    };

    // Find all BOOKED appointments that are upcoming
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        status: "BOOKED",
        startTime: {
          gt: now,
          // Look ahead 24+ hours to catch all reminders
          lte: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      include: {
        reminders: {
          select: {
            type: true,
          },
        },
      },
    });

    // Process each appointment for reminders
    for (const appointment of upcomingAppointments) {
      results.processed++;
      const timeUntilAppointment = appointment.startTime.getTime() - now.getTime();
      const minutesUntil = Math.floor(timeUntilAppointment / (1000 * 60));

      // Check which reminders should be sent
      for (const [reminderType, config] of Object.entries(REMINDER_TYPES)) {
        // Skip ON_BOOKING for cron (only for immediate booking)
        if (reminderType === "ON_BOOKING") continue;

        // Check if appointment is within the reminder window
        const isWithinWindow =
          minutesUntil <= config.minutesBefore &&
          minutesUntil > config.minutesBefore - 5; // 5 minute grace period

        if (!isWithinWindow) continue;

        // Check if reminder already sent
        const reminderExists = appointment.reminders.some(
          (r) => r.type === reminderType
        );

        if (reminderExists) {
          continue;
        }

        // Send reminder and create record
        try {
          await sendReminder(appointment.id, reminderType as ReminderType);
          results.remindersSent++;
        } catch (error) {
          console.error(
            `Failed to send ${reminderType} reminder for appointment ${appointment.id}:`,
            error
          );
          results.errors++;
        }
      }
    }

    return results;
  } catch (error) {
    console.error("Error processing reminders:", error);
    throw error;
  }
}

/**
 * Sends a single reminder and creates a Reminder record
 */
async function sendReminder(
  appointmentId: string,
  reminderType: ReminderType
): Promise<void> {
  // Get appointment details
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      customer: { select: { name: true, email: true } },
      service: { select: { name: true } },
    },
  });

  if (!appointment) {
    throw new Error(`Appointment ${appointmentId} not found`);
  }

  // Create reminder record in database
  const reminder = await prisma.reminder.create({
    data: {
      appointmentId,
      type: reminderType,
    },
  });

  // Log the reminder (in production, send email/SMS here)
  logReminder(reminderType, appointment, reminder.id);
}

/**
 * Logs reminder information (replaces actual email/SMS in MVP)
 */
function logReminder(
  reminderType: ReminderType,
  appointment: any,
  reminderId: string
): void {
  const timeString = appointment.startTime.toLocaleString();
  const message = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📬 REMINDER SENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type: ${reminderType}
Reminder ID: ${reminderId}
Appointment ID: ${appointment.id}
Customer: ${appointment.customer?.name || "Unknown"}
Email: ${appointment.customer?.email || "No email"}
Service: ${appointment.service?.name}
Scheduled Time: ${timeString}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `;
  console.log(message);
}

/**
 * Gets all reminders for an appointment
 */
export async function getAppointmentReminders(appointmentId: string) {
  return prisma.reminder.findMany({
    where: { appointmentId },
    orderBy: { sentAt: "desc" },
  });
}

/**
 * Gets all reminders (for admin/debugging)
 */
export async function getAllReminders(limit: number = 100) {
  return prisma.reminder.findMany({
    include: {
      appointment: {
        select: {
          id: true,
          startTime: true,
          customer: { select: { name: true, email: true } },
          service: { select: { name: true } },
        },
      },
    },
    orderBy: { sentAt: "desc" },
    take: limit,
  });
}
