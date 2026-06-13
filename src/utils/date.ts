import { format, differenceInDays, addDays as dateFnsAddDays, getDaysInMonth, parseISO } from 'date-fns';

function parseDate(date: Date | string): Date {
  if (date instanceof Date) {
    return date;
  }
  return parseISO(date);
}

export function formatDate(date: Date | string): string {
  return format(parseDate(date), 'yyyy-MM-dd');
}

export function formatDateTime(date: Date | string): string {
  return format(parseDate(date), 'yyyy-MM-dd HH:mm');
}

export function formatTime(date: Date | string): string {
  return format(parseDate(date), 'HH:mm');
}

export function daysBetween(date1: Date | string, date2: Date | string): number {
  return differenceInDays(parseDate(date2), parseDate(date1));
}

export function addDays(date: Date | string, days: number): Date {
  return dateFnsAddDays(parseDate(date), days);
}

export function getMonthDays(year: number, month: number): number {
  return getDaysInMonth(new Date(year, month - 1));
}
