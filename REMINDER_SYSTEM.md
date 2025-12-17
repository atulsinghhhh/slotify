# Appointment Reminder System

## Overview

Backend reminder system for sending appointment notifications. Currently logs reminders instead of sending real emails/SMS (MVP).

## Architecture

### Core Files
- `src/lib/reminders.ts` - Core reminder logic
- `src/app/api/system/reminders/run/route.ts` - Cron endpoint
- `src/app/api/system/reminders/route.ts` - Debug: List all reminders
- `src/app/api/system/reminders/[appointmentId]/route.ts` - Debug: List reminders for appointment

## API Endpoints

### 1. Cron Endpoint (MAIN)
```
POST /api/system/reminders/run
```

**Purpose**: Process and send appointment reminders

**When to call**: Every 5-15 minutes from your cron service

**No auth required** - Safe for cron jobs

**Request**:
```bash
curl -X POST http://localhost:3000/api/system/reminders/run
```

**Response**:
```json
{
  "success": true,
  "message": "Reminder processing completed",
  "data": {
    "processed": 5,
    "remindersSent": 2,
    "errors": 0
  },
  "timestamp": "2025-12-17T10:30:00.000Z"
}
```

**Features**:
- ✅ Idempotent (safe to call multiple times)
- ✅ Prevents duplicate reminders
- ✅ Processes only BOOKED appointments
- ✅ Graceful error handling

---

### 2. Debug: List All Reminders
```
GET /api/system/reminders?limit=50
```

**Purpose**: View all reminders (for debugging/admin)

**Query Parameters**:
- `limit` (optional): Max 500, default 100

**Response**:
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "reminder_id_1",
      "appointmentId": "apt_123",
      "type": "24_HOURS_BEFORE",
      "sentAt": "2025-12-17T09:00:00.000Z",
      "appointment": {
        "id": "apt_123",
        "startTime": "2025-12-18T09:00:00.000Z",
        "customer": { "name": "John Doe", "email": "john@example.com" },
        "service": { "name": "Haircut" }
      }
    }
  ]
}
```

---

### 3. Debug: Get Reminders for Specific Appointment
```
GET /api/system/reminders/:appointmentId
```

**Purpose**: View all reminders for one appointment

**Response**:
```json
{
  "success": true,
  "appointmentId": "apt_123",
  "count": 2,
  "data": [
    {
      "id": "reminder_id_1",
      "appointmentId": "apt_123",
      "type": "24_HOURS_BEFORE",
      "sentAt": "2025-12-17T09:00:00.000Z"
    },
    {
      "id": "reminder_id_2",
      "appointmentId": "apt_123",
      "type": "1_HOUR_BEFORE",
      "sentAt": "2025-12-18T08:00:00.000Z"
    }
  ]
}
```

---

## Reminder Types

### 24_HOURS_BEFORE
- Sent when appointment is within 24 hours
- Sent only once per appointment

### 1_HOUR_BEFORE
- Sent when appointment is within 1 hour
- Sent only once per appointment

### ON_BOOKING (optional)
- Not yet integrated with cron
- Reserved for future: send immediately on booking

---

## How It Works

### Execution Flow

1. **Cron Job Calls** → `POST /api/system/reminders/run`

2. **System Finds** upcoming BOOKED appointments:
   ```
   - status = "BOOKED"
   - startTime > now
   - startTime <= now + 24 hours
   ```

3. **For Each Appointment**:
   - Check if 24-hour reminder should be sent
   - Check if 1-hour reminder should be sent
   - Verify reminder not already sent
   - Create Reminder record in database
   - Log reminder info

4. **Returns Summary**:
   ```json
   {
     "processed": 5,        // appointments checked
     "remindersSent": 3,    // reminders created
     "errors": 0            // failed reminders
   }
   ```

### Database Records

Each sent reminder creates a `Reminder` record:
```prisma
model Reminder {
  id            String      @id @default(uuid())
  appointmentId String
  type          String      // "24_HOURS_BEFORE" | "1_HOUR_BEFORE"
  sentAt        DateTime    @default(now())
  appointment   Appointment @relation(...)
}
```

---

## Duplicate Prevention

The system **prevents duplicate reminders** by:

1. Checking existing `Reminder` records for appointment
2. Only sending if reminder type doesn't exist
3. Creating record atomically in database

### Example
- Appointment at 2025-12-18 09:00
- 24-hour reminder sent on 2025-12-17 09:00 ✅
- If cron runs again before appointment → skips duplicate ✅

---

## Cron Job Setup Examples

### Using Vercel Crons
Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/system/reminders/run",
      "schedule": "*/10 * * * *"
    }
  ]
}
```

### Using External Service (EasyCron, Scheduling.com)
```
POST http://your-domain.com/api/system/reminders/run
Every 5 minutes
```

### Using Node.js (Local/Self-Hosted)
```javascript
const cron = require('node-cron');

// Run every 10 minutes
cron.schedule('*/10 * * * *', async () => {
  const response = await fetch('http://localhost:3000/api/system/reminders/run', {
    method: 'POST'
  });
  console.log(await response.json());
});
```

---

## Production Checklist

- [ ] Set up cron job to call `/api/system/reminders/run` every 5-15 minutes
- [ ] Monitor `processed` vs `remindersSent` metrics
- [ ] Set up error alerts for failed reminders
- [ ] (Future) Integrate email provider in `sendReminder()` function
- [ ] (Future) Integrate SMS provider in `sendReminder()` function
- [ ] Add request validation/secrets for cron endpoint
- [ ] Test with test appointments

---

## Testing

### Manual Test: Trigger Reminders
```bash
# Create appointment starting in 1 hour
curl -X POST http://localhost:3000/api/appointment \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "service_123",
    "staffId": "staff_123",
    "date": "2025-12-17",
    "startTime": "11:00"
  }'

# Wait 1-2 minutes, then trigger reminders
curl -X POST http://localhost:3000/api/system/reminders/run

# Check reminders were created
curl http://localhost:3000/api/system/reminders
```

### Check Console Output
Look for reminder logs in server console:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📬 REMINDER SENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type: 1_HOUR_BEFORE
Reminder ID: reminder_uuid
Appointment ID: apt_uuid
Customer: John Doe
Email: john@example.com
Service: Haircut
Scheduled Time: 12/17/2025, 11:00:00 AM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Future Enhancements

1. **Email Integration**
   - Replace console.log with email service (SendGrid, Mailgun)
   - Store email delivery status

2. **SMS Integration**
   - Add Twilio or similar
   - Track SMS delivery

3. **Customer Preferences**
   - Allow opting in/out of reminders
   - Choose preferred notification type

4. **Retry Logic**
   - Retry failed reminders
   - Exponential backoff

5. **Metrics**
   - Track reminder delivery rates
   - Monitor cron job health
   - Alert on failures
