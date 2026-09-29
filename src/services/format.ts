// Number formatting utility for Persian/English digits and currency display

const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

export function toPersianDigits(str: string | number): string {
  const s = String(str);
  return s.replace(/[0-9]/g, (w) => persianDigits[+w]);
}

export function toEnglishDigits(str: string | number): string {
  const s = String(str);
  let res = s;
  for (let i = 0; i < 10; i++) {
    res = res.replace(new RegExp(persianDigits[i], 'g'), englishDigits[i]);
  }
  return res;
}

export function formatNumber(
  val: string | number | undefined | null,
  format: 'persian' | 'english' = 'persian'
): string {
  if (val === undefined || val === null) return '';
  const s = String(val);
  if (format === 'english') {
    return toEnglishDigits(s);
  }
  return toPersianDigits(s);
}

export function formatPrice(
  numOrStr: number | string,
  format: 'persian' | 'english' = 'persian'
): string {
  if (typeof numOrStr === 'number') {
    const formatted = numOrStr.toLocaleString('en-US');
    return format === 'persian' ? toPersianDigits(formatted) : formatted;
  }
  const clean = toEnglishDigits(numOrStr);
  return format === 'persian' ? toPersianDigits(clean) : clean;
}

/**
 * Format any Date or ISO/string date into Persian Shamsi representation (e.g. ۳۱ شهریور ۱۴۰۵ | ۱۸:۱۲:۰۰)
 * Explicitly uses Asia/Tehran timezone so Iran time is always accurate.
 */
export function formatToShamsi(
  input?: string | Date | null,
  format: 'persian' | 'english' = 'persian'
): string {
  if (!input) return formatToShamsi(new Date(), format);
  let d: Date;
  if (input instanceof Date) {
    d = input;
  } else {
    const s = String(input).trim();
    if (/[آ-ی]/.test(s)) {
      return format === 'english' ? toEnglishDigits(s) : toPersianDigits(s);
    }
    // If it's a date string like "2026-09-22 14:39:00" or ISO without timezone, treat as UTC
    if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?$/.test(s)) {
      d = new Date(s.replace(' ', 'T') + 'Z');
    } else {
      d = new Date(s.includes('T') ? s : s.replace(' ', 'T'));
    }
    if (isNaN(d.getTime())) d = new Date();
  }

  try {
    const formatter = new Intl.DateTimeFormat('fa-IR', {
      timeZone: 'Asia/Tehran',
      calendar: 'persian',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const parts = formatter.format(d).replace('ساعت ', '| ');
    return format === 'english' ? toEnglishDigits(parts) : toPersianDigits(parts);
  } catch (e) {
    const time = d.toLocaleTimeString('fa-IR', { hour12: false });
    return format === 'english' ? toEnglishDigits(time) : toPersianDigits(time);
  }
}

/**
 * Format time only (HH:mm) in Asia/Tehran timezone
 */
export function formatTimeOnly(
  date: Date = new Date(),
  format: 'persian' | 'english' = 'persian'
): string {
  try {
    const formatter = new Intl.DateTimeFormat('fa-IR', {
      timeZone: 'Asia/Tehran',
      calendar: 'persian',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = formatter.format(date).replace('ساعت ', '').trim();
    return format === 'english' ? toEnglishDigits(parts) : toPersianDigits(parts);
  } catch (e) {
    return date.toLocaleTimeString();
  }
}

/**
 * Format seconds countdown into MM:SS
 */
export function formatCountdown(
  totalSeconds: number,
  format: 'persian' | 'english' = 'persian'
): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  const str = `${mm}:${ss.toString().padStart(2, '0')}`;
  return format === 'english' ? toEnglishDigits(str) : toPersianDigits(str);
}
