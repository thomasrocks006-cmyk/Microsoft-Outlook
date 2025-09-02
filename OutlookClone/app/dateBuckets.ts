import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

// Extend plugins
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const DEFAULT_TZ = 'Australia/Melbourne';
// Optionally set default (safe in Node / RN)
if ((dayjs as any).tz?.setDefault) {
  try { (dayjs as any).tz.setDefault(DEFAULT_TZ); } catch {}
}

export type Bucket = 'today' | 'yesterday' | 'weekday' | 'thisYear' | 'older';

export function getDateBucket(iso: string, nowISO?: string, tz = DEFAULT_TZ): Bucket {
  const now = dayjs.tz(nowISO ?? new Date(), tz);
  const d = dayjs.tz(iso, tz);
  const startToday = now.startOf('day');
  const startYesterday = startToday.subtract(1, 'day');
  const startLastWeek = startToday.subtract(7, 'day');

  if (d.isSame(startToday, 'day')) return 'today';
  if (d.isSame(startYesterday, 'day')) return 'yesterday';
  if (d.isAfter(startLastWeek) && d.isBefore(startYesterday)) return 'weekday';
  if (d.year() === now.year()) return 'thisYear';
  return 'older';
}

export function formatRightCell(iso: string, nowISO?: string, tz = DEFAULT_TZ, locale = 'en-AU'): string {
  const bucket = getDateBucket(iso, nowISO, tz);
  const d = dayjs.tz(iso, tz);
  switch (bucket) {
    case 'today':
    case 'yesterday':
      return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(d.toDate());
    case 'weekday':
      return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(d.toDate());
    case 'thisYear':
      return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(d.toDate());
    case 'older':
    default:
      return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(d.toDate());
  }
}

export function compareByNewest(aISO: string, bISO: string, tz = DEFAULT_TZ): number {
  const a = dayjs.tz(aISO, tz).valueOf();
  const b = dayjs.tz(bISO, tz).valueOf();
  return b - a; // descending
}
