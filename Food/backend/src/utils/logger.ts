/* Minimal structured logger - no external dependency needed. */
const LEVELS: Record<string, number> = { error: 0, warn: 1, info: 2, debug: 3 };
const configured = process.env.LOG_LEVEL ?? 'info';

function shouldLog(level: string): boolean {
  const lvl = LEVELS[configured] ?? 2;
  return (LEVELS[level] ?? 2) <= lvl;
}

function write(level: string, msg: string, meta?: unknown) {
  if (!shouldLog(level)) return;
  const line = { ts: new Date().toISOString(), level, msg, ...(meta ? { meta } : {}) };
  const out = JSON.stringify(line);
  if (level === 'error') console.error(out);
  else if (level === 'warn') console.warn(out);
  else console.log(out);
}

export const logger = {
  error: (msg: string, meta?: unknown) => write('error', msg, meta),
  warn: (msg: string, meta?: unknown) => write('warn', msg, meta),
  info: (msg: string, meta?: unknown) => write('info', msg, meta),
  debug: (msg: string, meta?: unknown) => write('debug', msg, meta),
};
