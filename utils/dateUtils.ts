/**
 * Format date string for display
 * Converts ISO or database date format to readable format
 *
 * @param dateString Date string to format
 * @param locale Locale for date formatting (defaults to device locale)
 * @param options Formatting options
 * @returns Formatted date string
 */
export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return "";

  // If it's already in a readable format, return as is
  if (
    dateString.includes(",") ||
    (dateString.includes(" ") && !dateString.includes("T"))
  ) {
    return dateString;
  }

  // Try to parse the date
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error parsing date:", error);
    return dateString;
  }
}

/**
 * Parse various date string formats and return in YYYY-MM-DD format
 * Handles the format from formatDate() which returns "Month Day, Year"
 * Also supports other common formats:
 * - YYYY-MM-DD, DD-MM-YYYY, MM-DD-YYYY
 * - YYYY/MM/DD, DD/MM/YYYY, MM/DD/YYYY
 * - Month DD, YYYY (e.g., January 1, 2001)
 * - DD Month YYYY (e.g., 1 January 2001)
 * @param {string} dateString - The date string to parse
 * @returns {string} Date in YYYY-MM-DD format or empty string if parsing fails
 */
export const parseDateString = (dateString: string) => {
  if (!dateString || dateString.trim() === "") {
    return "";
  }

  try {
    // First, prioritize the "Month Day, Year" format (from formatDate)
    // This regex matches patterns like "January 1, 2023" or "December 31, 2020"
    const monthDayYearRegex = /^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})$/;
    const match = dateString.match(monthDayYearRegex);

    if (match) {
      const months = [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
      ];

      const monthName = match[1].toLowerCase();
      const day = match[2].padStart(2, "0");
      const year = match[3];

      const monthIndex = months.indexOf(monthName);
      if (monthIndex !== -1) {
        const month = (monthIndex + 1).toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
    }

    // Try to handle date formats with numeric separators (YYYY-MM-DD, DD-MM-YYYY, etc.)
    const dateParts = dateString.split(/[-\/\.]/);
    if (dateParts.length === 3) {
      // All parts are numbers
      if (dateParts.every((part) => !isNaN(Number(part)))) {
        // Check if first part looks like a year (4-digit number)
        const isYearFirst =
          dateParts[0].length === 4 && Number(dateParts[0]) > 1000;

        if (isYearFirst) {
          // Already in YYYY-MM-DD format
          return `${dateParts[0]}-${dateParts[1].padStart(
            2,
            "0"
          )}-${dateParts[2].padStart(2, "0")}`;
        } else {
          // Check if MM-DD-YYYY (American) or DD-MM-YYYY (European)
          // Simple heuristic: if first number > 12, it's likely DD-MM-YYYY
          const isEuropeanFormat = Number(dateParts[0]) > 12;

          if (isEuropeanFormat) {
            // DD-MM-YYYY format
            return `${dateParts[2]}-${dateParts[1].padStart(
              2,
              "0"
            )}-${dateParts[0].padStart(2, "0")}`;
          } else {
            // Assume MM-DD-YYYY format
            return `${dateParts[2]}-${dateParts[0].padStart(
              2,
              "0"
            )}-${dateParts[1].padStart(2, "0")}`;
          }
        }
      }
    }

    // Try to handle other text-based month date formats
    // Support "Month DD YYYY" or "DD Month YYYY" formats without commas
    const months = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];

    const lowerCaseDateString = dateString.toLowerCase();

    // Find if date contains a month name
    const monthIndex = months.findIndex((month) =>
      lowerCaseDateString.includes(month)
    );
    if (monthIndex !== -1) {
      // Extract year, month, day
      const monthName = months[monthIndex];

      // Extract year - assuming 4-digit number
      const yearMatch = lowerCaseDateString.match(/\b(19|20)\d{2}\b/);
      if (!yearMatch) return "";
      const year = yearMatch[0];

      // Extract day - number between 1-31
      const dayMatch = lowerCaseDateString.match(/\b([1-9]|[12]\d|3[01])\b/);
      if (!dayMatch) return "";
      const day = dayMatch[0].padStart(2, "0");

      // Generate standardized date
      const month = (monthIndex + 1).toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    // Use Date object as fallback
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    // If all parsing methods fail, return original string
    return dateString;
  } catch (e) {
    console.error("Error parsing date:", e, dateString);
    return dateString;
  }
};
