/**
 * Calculates the delay in milliseconds for scheduling invoice reminder emails.
 * Reminders are scheduled for 3 days before the due date.
 * 
 * @param dueDate - The invoice payment due date
 * @returns The delay in milliseconds until the reminder should be sent (minimum 0)
 */
export function calculateReminderDelay(dueDate: Date): number {
  const now = new Date();
  const reminderDate = new Date(dueDate);
  
  // Set reminder date to 3 days before the due date
  reminderDate.setDate(reminderDate.getDate() - 3);

  // Calculate the delay in milliseconds
  const delay = reminderDate.getTime() - now.getTime();
  
  // Ensure we don't schedule jobs in the past
  return Math.max(delay, 0);
}

