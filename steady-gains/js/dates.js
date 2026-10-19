// Steady Gains - date helpers. Dates are plain "YYYY-MM-DD" strings, handled
// in UTC so a session never lands on the wrong day because of a timezone or
// daylight-saving shift.

const DAY_MS = 24 * 60 * 60 * 1000;
export const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function toUtc(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
}

function fromUtc(ms) {
    return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(iso, days) {
    return fromUtc(toUtc(iso) + days * DAY_MS);
}

export function daysBetween(fromIso, toIso) {
    return Math.round((toUtc(toIso) - toUtc(fromIso)) / DAY_MS);
}

export function weekdayOf(iso) {
    return WEEKDAYS[new Date(toUtc(iso)).getUTCDay()];
}
