## Slotify MVP

Appointment scheduling platform with provider and customer flows built on Next.js 16, Prisma, and PostgreSQL.

### Stack
- Next.js 16 (App Router, client/server components)
- TypeScript, React 19, Tailwind CSS, shadcn/ui
- Prisma ORM with PostgreSQL (Prisma Client generated to src/generated/prisma)
- NextAuth (Google + Credentials) with role-aware JWT sessions

### Features by module
- **Auth**: Provider and customer signup/login; Google OAuth defaults to customer role; JWT stores role and provider businessId.
- **Business (provider)**: Create/update/delete business profile with working hours; guarded by provider session.
- **Services (provider)**: CRUD services for a business with name/price/duration/description.
- **Staff (provider)**: Create staff accounts, set working hours, assign services, soft delete; ownership checks per provider.
- **Appointments (provider)**: View list, update status (Pending/Confirmed/Completed/Cancelled) with dropdown; dashboard shows today’s schedule and stats.
- **Bookings (customer)**: Select business, service, optional staff, date/time; prevents overlaps; staffId optional.
- **Customer appointments**: List appointments with service/business/staff details; cancel or reschedule via dialog.
- **Availability API**: Returns working hours and booked slots for a staff/date; supports legacy and JSON workingHours formats.

### API routes (summary)
- `/api/auth/[...nextauth]` – NextAuth configuration.
- `/api/business` – GET (provider business), POST (create).
- `/api/business/[businessId]` – GET/PUT/DELETE specific business.
- `/api/service` – GET/POST services for provider business.
- `/api/service/[serviceId]` – PUT/DELETE service.
- `/api/staff` – GET staff list (filter by businessId/serviceId), POST create staff.
- `/api/staff/[staffId]` – GET/PUT/DELETE staff (soft delete).
- `/api/staff/availability` – GET working hours and booked slots for a staff/date.
- `/api/appointment` – GET provider appointments, POST create appointment.
- `/api/appointment/[appointmentId]/cancel` – PUT cancel (customer-owned).
- `/api/appointment/[appointmentId]/reschedule` – PUT reschedule (customer-owned).
- `/api/appointment/[appointmentId]/status` – PATCH status update (provider-owned).
- `/api/customer` – POST create customer.
- `/api/customer/[businessId]` – GET customers for business.
- `/api/customer/appointment` – GET customer appointments (with service/business/staff relations).
- `/api/availability` – GET available slots for business/service/date (optional staff).

### Environment
Create a `.env.local` with:
```
DATABASE_URL="postgresql://user:password@host:port/dbname"
NEXTAUTH_SECRET="your-long-random-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Development
```
npm install
npm run dev
```

### Build
```
npm run build
```

`postinstall` runs `prisma generate`; ensure the database is reachable for build pipelines. Apply migrations locally with `npx prisma migrate dev` as needed.

### Notes
- Prisma Client output lives in `src/generated/prisma` per prisma.config.ts.
- Dynamic route params in Next.js 16 are promises; handlers `await` params (already applied in API routes).
- Staff workingHours accepts JSON by weekday or legacy string (`"09:00 - 17:00"`).
