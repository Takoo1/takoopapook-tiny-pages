import { toZonedTime, fromZonedTime } from 'date-fns-tz';

/**
 * Utility functions for handling timezone-aware date formatting
 */

/**
 * Format a date string with timezone information for display
 * @param dateString - ISO date string from database
 * @param timezone - Timezone identifier (e.g., 'Asia/Kolkata')
 * @param showTimezone - Whether to show timezone indicator
 */
export const formatDateWithTimezone = (
  dateString: string, 
  timezone?: string,
  showTimezone: boolean = true
): string => {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  
  // If we have timezone info, format in that timezone
  if (timezone) {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      
      const formattedDate = formatter.format(date);
      
      if (showTimezone) {
        // Extract timezone abbreviation
        const timezoneName = date.toLocaleString('en-US', {
          timeZone: timezone,
          timeZoneName: 'short'
        }).split(' ').pop() || timezone.split('/').pop();
        
        return `${formattedDate} (${timezoneName})`;
      }
      
      return formattedDate;
    } catch (error) {
      console.warn('Failed to format date with timezone:', error);
      // Fallback to local time
    }
  }
  
  // Fallback to local time formatting
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Convert a local datetime-local input value to ISO string for database storage
 * This correctly converts the organizer's local time to UTC using their timezone
 */
export const formatDateTimeForDatabase = (dateTimeLocalValue: string, organizerTimezone: string): string => {
  if (!dateTimeLocalValue || !organizerTimezone) return '';
  
  try {
    // datetime-local input gives us "YYYY-MM-DDTHH:mm" format
    // Parse this as local time in the organizer's timezone, then convert to UTC
    const localDate = new Date(dateTimeLocalValue);
    
    // Convert the organizer's local time to UTC using date-fns-tz
    const utcDate = fromZonedTime(localDate, organizerTimezone);
    
    return utcDate.toISOString();
  } catch (error) {
    console.error('Error converting timezone:', error);
    // Fallback to treating as UTC
    return new Date(dateTimeLocalValue).toISOString();
  }
};

/**
 * Get timezone offset in minutes for a given timezone at a specific date
 */
const getTimezoneOffset = (timezone: string, date: Date): number => {
  try {
    // Use Intl.DateTimeFormat to get the correct offset for the timezone
    const utcDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
    const targetDate = new Date(utcDate.toLocaleString('en-US', { timeZone: timezone }));
    return (utcDate.getTime() - targetDate.getTime()) / 60000;
  } catch (error) {
    console.error('Error getting timezone offset:', error);
    return 0;
  }
};

/**
 * Convert a database ISO string back to datetime-local format for form input
 * This assumes the stored date was originally in the organizer's timezone
 */
export const formatDateTimeForInput = (
  isoString: string, 
  timezone?: string
): string => {
  if (!isoString) return '';
  
  const date = new Date(isoString);
  
  if (timezone) {
    try {
      // Convert UTC time to organizer's timezone using date-fns-tz
      const zonedDate = toZonedTime(date, timezone);
      
      // Format as datetime-local input format: YYYY-MM-DDTHH:mm
      const year = zonedDate.getFullYear();
      const month = String(zonedDate.getMonth() + 1).padStart(2, '0');
      const day = String(zonedDate.getDate()).padStart(2, '0');
      const hour = String(zonedDate.getHours()).padStart(2, '0');
      const minute = String(zonedDate.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hour}:${minute}`;
    } catch (error) {
      console.warn('Failed to format date for input with timezone:', error);
    }
  }
  
  // Fallback to local time
  return date.toISOString().slice(0, 16);
};

/**
 * Get a user-friendly timezone name
 */
export const getTimezoneDisplayName = (timezone: string): string => {
  try {
    // Try to get a more readable timezone name
    const now = new Date();
    const timezoneName = now.toLocaleString('en-US', {
      timeZone: timezone,
      timeZoneName: 'long'
    }).split(' ').slice(-2).join(' ');
    
    return timezoneName || timezone.split('/').pop() || timezone;
  } catch (error) {
    return timezone.split('/').pop() || timezone;
  }
};