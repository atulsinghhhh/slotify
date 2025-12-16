export function generateSlotTimes(
  start: string,
  end: string,
  slotDuration: number,
  appointments: { startTime: string; endTime: string }[]
) {
  const slots: string[] = [];

  // Expect ONLY "HH:MM" format here
  const toMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const startMinutes = toMinutes(start);
  const endMinutes = toMinutes(end);

  // Safety checks
  if (
    isNaN(startMinutes) ||
    isNaN(endMinutes) ||
    startMinutes >= endMinutes ||
    slotDuration <= 0
  ) {
    return [];
  }

  let current = startMinutes;

  while (current + slotDuration <= endMinutes) {
    const slotStart = current;
    const slotEnd = current + slotDuration;

    const hasOverlap = appointments.some(appt => {
      const apptStart = toMinutes(appt.startTime);
      const apptEnd = toMinutes(appt.endTime);

      return slotStart < apptEnd && slotEnd > apptStart;
    });

    if (!hasOverlap) {
      const hours = Math.floor(slotStart / 60)
        .toString()
        .padStart(2, "0");
      const minutes = (slotStart % 60)
        .toString()
        .padStart(2, "0");

      slots.push(`${hours}:${minutes}`);
    }

    current += slotDuration;
  }

  return slots;
}
