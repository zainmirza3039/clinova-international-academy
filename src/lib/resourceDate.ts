const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d))?$/;

/** Draft labels are editorial text, not dates. Reject impossible calendar dates. */
export function isValidIsoDate(value: string): boolean {
  const match = value.match(ISO_DATE_PATTERN);
  if (!match) return false;
  const [, year, month, day] = match;
  const calendar = new Date(`${year}-${month}-${day}T00:00:00Z`);
  return !Number.isNaN(new Date(value).getTime()) &&
    calendar.getUTCFullYear() === Number(year) &&
    calendar.getUTCMonth() === Number(month) - 1 &&
    calendar.getUTCDate() === Number(day);
}

export function formatResourceDate(value: string): string {
  if (!isValidIsoDate(value)) return value;
  // Publication dates are calendar labels; do not shift them in a reader's timezone.
  return new Date(`${value.slice(0, 10)}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });
}
