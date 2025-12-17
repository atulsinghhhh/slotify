export type NotificationType = "REMINDER" | "BOOKING" | "CANCEL";

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: NotificationType;
  appointmentId?: string;
  appointmentTime?: Date | string;
  isRead: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface NotificationResponse {
  success: boolean;
  data?: Notification[];
  count?: number;
  error?: string;
}
