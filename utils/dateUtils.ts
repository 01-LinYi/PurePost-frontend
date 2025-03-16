/**
 * Format date string for display
 * Converts ISO or database date format to readable format
 * 
 * @param dateString Date string to format
 * @returns Formatted date string
 */
export function formatDate(dateString: string | undefined | null): string {
    if (!dateString) return '';
    
    // If it's already in a readable format, return as is
    if (dateString.includes(',') || 
       (dateString.includes(' ') && !dateString.includes('T'))) {
      return dateString;
    }
    
    // Try to parse the date
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
  }