/**
 * Timezone-safe date formatter for calendar dates (e.g. lease dates).
 * Formats in UTC so that dates never shift forward or backward across any timezone.
 */
export const formatDisplayDate = (d, options = {}) => {
  if (!d) return '-';
  if (typeof d === 'string' && /^\d{2}[-/]\d{2}[-/]\d{4}$/.test(d.trim())) {
    const [day, m, y] = d.trim().split(/[-/]/);
    d = `${y}-${m}-${day}`;
  }
  const date = new Date(d);
  if (isNaN(date.getTime())) return String(d);

  const defaultOpts = {
    timeZone: 'UTC',
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    ...options
  };
  return date.toLocaleDateString('en-CA', defaultOpts);
};

export const formatNumericDate = (d) => {
  if (!d) return '-';
  if (typeof d === 'string' && /^\d{2}[-/]\d{2}[-/]\d{4}$/.test(d.trim())) {
    const [day, m, y] = d.trim().split(/[-/]/);
    d = `${y}-${m}-${day}`;
  }
  const date = new Date(d);
  if (isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString('en-US', { timeZone: 'UTC', month: '2-digit', day: '2-digit', year: 'numeric' });
};
