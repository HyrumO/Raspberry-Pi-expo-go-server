import { format, differenceInDays, isToday, isYesterday } from 'date-fns';

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
}

export function formatRelativeDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return 'Today';
  }
  
  if (isYesterday(dateObj)) {
    return 'Yesterday';
  }
  
  const daysDiff = differenceInDays(new Date(), dateObj);
  
  if (daysDiff < 7) {
    return `${daysDiff} days ago`;
  }
  
  return formatDate(dateObj);
}

export function getDaysUntil(date: string | Date): number {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dateObj.setHours(0, 0, 0, 0);
  
  return Math.max(0, differenceInDays(dateObj, today));
}

