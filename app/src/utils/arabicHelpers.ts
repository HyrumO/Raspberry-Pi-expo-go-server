// Utility functions for Arabic text handling

export function isArabic(text: string): boolean {
  const arabicRegex = /[\u0600-\u06FF]/;
  return arabicRegex.test(text);
}

export function getTextDirection(text: string): 'ltr' | 'rtl' {
  return isArabic(text) ? 'rtl' : 'ltr';
}

export function formatArabicText(text: string): string {
  // Add any Arabic text formatting logic here
  // For example, ensuring proper diacritics, etc.
  return text;
}

