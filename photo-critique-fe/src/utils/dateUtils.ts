// parse date from various formats
export function parseDate(input: string | number | Date): Date {
  if (input instanceof Date) return input;
  if (typeof input === 'number') return new Date(input);
  
  const date = new Date(input);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${input}`);
  }
  return date;
}

// ==============================================
// BASIC FORMATS
// ==============================================

/**
 * Format: dd/mm/yyyy hh:mm:ss
 * Example: 25/12/2023 14:30:45
 */
export function formatDateTimeFull(dateInput: string | number | Date): string {
  const date = parseDate(dateInput);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * Format: dd/mm/yyyy hh:mm
 * Example: 25/12/2023 14:30
 */
export function formatDateTime(dateInput: string | number | Date): string {
  const date = parseDate(dateInput);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Format: dd/mm/yyyy
 * Example: 25/12/2023
 */
export function formatDate(dateInput: string | number | Date): string {
  const date = parseDate(dateInput);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format: dd month(short) yyyy hh:mm:ss
 * Example: 25 Dec 2023 14:30:45
 */
export function formatDateShortMonthTimeFull(dateInput: string | number | Date): string {
  const date = parseDate(dateInput);
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * Format: dd month(short) yyyy hh:mm
 * Example: 25 Dec 2023 14:30
 */
export function formatDateShortMonthTime(dateInput: string | number | Date): string {
  const date = parseDate(dateInput);
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year} ${hours}:${minutes}`;
}

// ==============================================
// LONG FORMATS
// ==============================================

/**
 * Format: dd month(full) yyyy hh:mm:ss
 * Example: 25 December 2023 14:30:45
 */
export function formatDateLongMonthTimeFull(dateInput: string | number | Date): string {
  const date = parseDate(dateInput);
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * Format: dd month(full) yyyy hh:mm
 * Example: 25 December 2023 14:30
 */
export function formatDateLongMonthTime(dateInput: string | number | Date): string {
  const date = parseDate(dateInput);
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year} ${hours}:${minutes}`;
}

/**
 * Format: dd month(full) yyyy
 * Example: 25 December 2023
 */
export function formatDateLongMonth(dateInput: string | number | Date): string {
  const date = parseDate(dateInput);
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

// ==============================================
// COMPLETE LONG FORMATS WITH DAY NAME
// ==============================================

/**
 * Format: Day, dd month(full) yyyy hh:mm:ss
 * Example: Monday, 25 December 2023 14:30:45
 */
export function formatDateTimeComplete(dateInput: string | number | Date): string {
  const date = parseDate(dateInput);
  const dayName = date.toLocaleString('en-US', { weekday: 'long' });
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${dayName}, ${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * Format: Day, dd month(full) yyyy hh:mm
 * Example: Monday, 25 December 2023 14:30
 */
export function formatDateTimeLong(dateInput: string | number | Date): string {
  const date = parseDate(dateInput);
  const dayName = date.toLocaleString('en-US', { weekday: 'long' });
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${dayName}, ${day} ${month} ${year} ${hours}:${minutes}`;
}

/**
 * Format: Day, dd month(full) yyyy
 * Example: Monday, 25 December 2023
 */
export function formatDateLong(dateInput: string | number | Date): string {
  const date = parseDate(dateInput);
  const dayName = date.toLocaleString('en-US', { weekday: 'long' });
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();
  return `${dayName}, ${day} ${month} ${year}`;
}

// ==============================================
// TIME FORMATS
// ==============================================

/**
 * Format: hh:mm:ss
 * Example: 14:30:45
 */
export function formatTimeFull(dateInput: string | number | Date): string {
  const date = parseDate(dateInput);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Format: hh:mm
 * Example: 14:30
 */
export function formatTime(dateInput: string | number | Date): string {
  const date = parseDate(dateInput);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Format: hh:mm:ss AM/PM
 * Example: 02:30:45 PM
 */
export function formatTime12HourFull(dateInput: string | number | Date): string {
  const date = parseDate(dateInput);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes}:${seconds} ${ampm}`;
}

/**
 * Format: hh:mm AM/PM
 * Example: 02:30 PM
 */
export function formatTime12Hour(dateInput: string | number | Date): string {
  const date = parseDate(dateInput);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes} ${ampm}`;
}

// ==============================================
// US FORMATS (MM/DD/YYYY)
// ==============================================

/**
 * Format: mm/dd/yyyy hh:mm:ss
 * Example: 12/25/2023 14:30:45
 */
export function formatUSDateTimeFull(dateInput: string | number | Date): string {
  const date = parseDate(dateInput);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * Format: mm/dd/yyyy hh:mm
 * Example: 12/25/2023 14:30
 */
export function formatUSDateTime(dateInput: string | number | Date): string {
  const date = parseDate(dateInput);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}/${day}/${year} ${hours}:${minutes}`;
}

/**
 * Format: mm/dd/yyyy
 * Example: 12/25/2023
 */
export function formatUSDate(dateInput: string | number | Date): string {
  const date = parseDate(dateInput);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

// ==============================================
// ISO & DATABASE FORMATS
// ==============================================

/**
 * Format: yyyy-mm-dd hh:mm:ss (MySQL DATETIME format)
 * Example: 2023-12-25 14:30:45
 */
export function formatMySQLDateTime(dateInput: string | number | Date): string {
  const date = parseDate(dateInput);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Format: yyyy-mm-dd (MySQL DATE format)
 * Example: 2023-12-25
 */
export function formatMySQLDate(dateInput: string | number | Date): string {
  const date = parseDate(dateInput);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

/**
 * Format: ISO 8601 (yyyy-mm-ddThh:mm:ss.sssZ)
 * Example: 2023-12-25T14:30:45.000Z
 */
export function formatISO(dateInput: string | number | Date): string {
  const date = parseDate(dateInput);
  return date.toISOString();
}

// ==============================================
// READABLE RELATIVE TIME
// ==============================================

/**
 * Format: Relative time (Just now, 5 minutes ago, Yesterday, etc.)
 * Example: "2 hours ago", "Yesterday", "3 days ago"
 */
export function formatRelativeTime(dateInput: string | number | Date): string {
  const date = parseDate(dateInput);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay} days ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} weeks ago`;
  if (diffDay < 365) return `${Math.floor(diffDay / 30)} months ago`;
  return `${Math.floor(diffDay / 365)} years ago`;
}

// ==============================================
// FILE NAME FRIENDLY FORMAT
// ==============================================

/**
 * Format: yyyy-mm-dd_hh-mm-ss (file name friendly)
 * Example: 2023-12-25_14-30-45
 */
export function formatFileNameDateTime(dateInput: string | number | Date): string {
  const date = parseDate(dateInput);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

// ==============================================
// SHORT READABLE FORMATS
// ==============================================

/**
 * Format: dd Mon yy hh:mm
 * Example: 25 Dec 23 14:30
 */
export function formatShortDateTime(dateInput: string | number | Date): string {
  const date = parseDate(dateInput);
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = String(date.getFullYear()).slice(-2);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year} ${hours}:${minutes}`;
}

/**
 * Format: dd Mon yy
 * Example: 25 Dec 23
 */
export function formatShortDate(dateInput: string | number | Date): string {
  const date = parseDate(dateInput);
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = String(date.getFullYear()).slice(-2);
  return `${day} ${month} ${year}`;
}

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

/**
 * Get current date time in a specific format
 * Example: getCurrentDateTime('dd/mm/yyyy hh:mm:ss') -> "25/12/2023 14:30:45"
 */
export function getCurrentDateTime(format: string = 'dd/mm/yyyy hh:mm:ss'): string {
  const now = new Date();
  
  const replacements: Record<string, string> = {
    'yyyy': String(now.getFullYear()),
    'yy': String(now.getFullYear()).slice(-2),
    'MM': String(now.getMonth() + 1).padStart(2, '0'),
    'dd': String(now.getDate()).padStart(2, '0'),
    'hh': String(now.getHours()).padStart(2, '0'),
    'mm': String(now.getMinutes()).padStart(2, '0'),
    'ss': String(now.getSeconds()).padStart(2, '0'),
  };
  
  let result = format;
  Object.entries(replacements).forEach(([key, value]) => {
    result = result.replace(key, value);
  });
  
  return result;
}

/**
 * Format date with custom pattern
 * Example: formatCustom(new Date(), 'DD-MMM-YYYY HH:mm') -> "25-DEC-2023 14:30"
 */
export function formatCustom(
  dateInput: string | number | Date, 
  pattern: string
): string {
  const date = parseDate(dateInput);
  
  const formatters: Record<string, () => string> = {
    // Year
    'YYYY': () => String(date.getFullYear()),
    'YY': () => String(date.getFullYear()).slice(-2),
    
    // Month
    'MM': () => String(date.getMonth() + 1).padStart(2, '0'),
    'M': () => String(date.getMonth() + 1),
    'MMM': () => date.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
    'MMMM': () => date.toLocaleString('en-US', { month: 'long' }),
    
    // Day
    'DD': () => String(date.getDate()).padStart(2, '0'),
    'D': () => String(date.getDate()),
    'ddd': () => date.toLocaleString('en-US', { weekday: 'short' }),
    'dddd': () => date.toLocaleString('en-US', { weekday: 'long' }),
    
    // Time
    'HH': () => String(date.getHours()).padStart(2, '0'),
    'H': () => String(date.getHours()),
    'hh': () => {
      const hours = date.getHours();
      return String(hours % 12 || 12).padStart(2, '0');
    },
    'h': () => {
      const hours = date.getHours();
      return String(hours % 12 || 12);
    },
    'mm': () => String(date.getMinutes()).padStart(2, '0'),
    'm': () => String(date.getMinutes()),
    'ss': () => String(date.getSeconds()).padStart(2, '0'),
    's': () => String(date.getSeconds()),
    'A': () => date.getHours() >= 12 ? 'PM' : 'AM',
    'a': () => date.getHours() >= 12 ? 'pm' : 'am',
  };
  
  let result = pattern;
  Object.entries(formatters).forEach(([key, formatter]) => {
    result = result.replace(new RegExp(key, 'g'), formatter());
  });
  
  return result;
}