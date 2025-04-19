/**
 * Format date string for display
 * Converts ISO or database date format to readable format
 *
 * @param dateString Date string to format
 * @param locale Locale for date formatting (defaults to device locale)
 * @param options Formatting options
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string | undefined | null,
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric"
  }
): string {
  if (!dateString) return "";

  // Try to parse the date
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString(locale, options);
  } catch (error) {
    console.error("Error parsing date:", error);
    return dateString;
  }
}
