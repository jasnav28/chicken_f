/**
 * Currency & Number Formatters for Indian Locale (INR, Asia/Kolkata)
 */

export const formatINR = (amount: number, showDecimals: boolean = true): string => {
  if (isNaN(amount)) return '₹0';
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  };
  return new Intl.NumberFormat('en-IN', options).format(amount);
};

export const formatWeight = (qty: number, unit: 'kg' | 'crate' = 'kg'): string => {
  if (isNaN(qty)) return `0 ${unit}`;
  // For kg, format with up to 2 decimal places if needed, or 1 decimal place
  const formatted = qty % 1 === 0 ? qty.toString() : qty.toFixed(1);
  return `${formatted} ${unit}`;
};

export const formatDateIST = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
};

export const formatDateTimeIST = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return dateStr;
  }
};

export const formatTimeOnlyIST = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return dateStr;
  }
};

/**
 * Checks if current time in Asia/Kolkata has passed cutoff time (default 21:00 / 9:00 PM)
 * for tomorrow's delivery
 */
export const isPastCutoff = (cutoffTime: string = '21:00'): boolean => {
  try {
    const now = new Date();
    // Get IST hours and minutes
    const istTimeStr = now.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
    const [istHour, istMin] = istTimeStr.split(':').map(Number);
    const [cutoffHour, cutoffMin] = cutoffTime.split(':').map(Number);

    if (istHour > cutoffHour) return true;
    if (istHour === cutoffHour && istMin >= cutoffMin) return true;
    return false;
  } catch {
    return false;
  }
};

/**
 * Get standard tomorrow date in YYYY-MM-DD
 */
export const getTomorrowDate = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Convert number to words in Indian numbering system
 */
export const numberToWordsINR = (num: number): string => {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = Math.floor(Math.abs(num));
  if (n === 0) return 'Rupees Zero Only';

  function convertTwoDigits(n: number): string {
    if (n < 20) return a[n];
    const tens = b[Math.floor(n / 10)];
    const ones = a[n % 10];
    return tens + (ones ? ' ' + ones : '');
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let res = '';
    if (hundred > 0) {
      res += a[hundred] + ' Hundred';
    }
    if (rest > 0) {
      res += (res ? ' and ' : '') + convertTwoDigits(rest);
    }
    return res;
  }

  let words = '';
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const remainder = n % 1000;

  if (crore > 0) words += convertTwoDigits(crore) + ' Crore ';
  if (lakh > 0) words += convertTwoDigits(lakh) + ' Lakh ';
  if (thousand > 0) words += convertTwoDigits(thousand) + ' Thousand ';
  if (remainder > 0) words += convertThreeDigits(remainder) + ' ';

  return 'Rupees ' + words.trim() + ' Only';
};
