export const LOGGER_MODES = ['silent', 'nest', 'console', 'pino'] as const;

export type LoggerMode = (typeof LOGGER_MODES)[number];

export function getLoggerMode(): LoggerMode {
  const mode = (process.env.LOGGER || 'silent').toLowerCase();
  if (!LOGGER_MODES.includes(mode as LoggerMode)) {
    throw new Error(
      `LOGGER must be one of: ${LOGGER_MODES.join(', ')}. Got "${mode}"`,
    );
  }
  return mode as LoggerMode;
}
