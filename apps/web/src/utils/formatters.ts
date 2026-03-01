export function formatCurrency(amount: number): string {
  // Handle invalid inputs
  if (isNaN(amount) || !isFinite(amount)) {
    return 'RM 0.00';
  }

  // Format with 2 decimal places and thousands separator
  const formatted = Math.abs(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const sign = amount < 0 ? '-' : '';
  
  return `${sign}RM ${formatted}`;
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Handle invalid dates
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${day}/${month}/${year}`;
}

export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Handle invalid dates
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  
  return `${hours}:${minutes}`;
}

export function formatPhone(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Handle invalid inputs
  if (digits.length < 9 || digits.length > 11) {
    return phone; // Return original if invalid length
  }

  // Format based on length and prefix
  if (digits.length === 10 && digits.startsWith('01')) {
    // Mobile: 01X-XXX XXXX
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)} ${digits.slice(6)}`;
  } else if (digits.length === 9 && digits.startsWith('03')) {
    // Landline (KL): 03-XXXX XXXX
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)} ${digits.slice(6)}`;
  } else if (digits.length === 10 && digits.startsWith('03')) {
    // Landline (KL) with area code: 03-XXXX XXXX
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)} ${digits.slice(6)}`;
  }
  
  // Default format for other cases
  return phone;
}

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[RM\s,]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function parseDate(value: string): Date | null {
  const parts = value.split('/');
  if (parts.length !== 3) {
    return null;
  }

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  const year = parseInt(parts[2], 10);

  const date = new Date(year, month, day);
  
  // Validate the date
  if (
    isNaN(date.getTime()) ||
    date.getDate() !== day ||
    date.getMonth() !== month ||
    date.getFullYear() !== year
  ) {
    return null;
  }

  return date;
}
