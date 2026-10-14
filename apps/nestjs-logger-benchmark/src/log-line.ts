/** Same fields for nest / console / pino so the sink is the only variable. */
export type RequestLogLine = {
  method: string;
  url: string;
  statusCode: number;
  durationMs: number;
};

export function formatRequestLogLine(line: RequestLogLine): string {
  return JSON.stringify(line);
}
