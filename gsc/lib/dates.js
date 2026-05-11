/**
 * Date helpers for GSC queries.
 *
 * GSC data has ~3 day lag, so the most recent usable date is 3 days ago.
 */

export function formatDate(date) {
  return date.toISOString().split('T')[0];
}

export function gscEndDate() {
  return daysAgo(3);
}

export function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return formatDate(d);
}

export function dateRanges() {
  const end = gscEndDate();
  return {
    end,
    start7: daysAgo(7 + 3),
    start30: daysAgo(30 + 3),
    start90: daysAgo(90 + 3),
  };
}
