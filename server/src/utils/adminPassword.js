const DEFAULT_TIMEZONE = 'America/Tijuana';

export function getTodayKey(date = new Date()) {
  const timezone = process.env.ADMIN_TIMEZONE || DEFAULT_TIMEZONE;
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);

  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${map.year}${map.month}${map.day}`;
}

export function getExpectedAdminPassword(date = new Date()) {
  const prefix = process.env.ADMIN_PREFIX || 'admin';
  return `${prefix}${getTodayKey(date)}`;
}

export function isValidAdminLogin(username, password) {
  const adminUser = process.env.ADMIN_USER || 'admin';
  return username === adminUser && password === getExpectedAdminPassword();
}
