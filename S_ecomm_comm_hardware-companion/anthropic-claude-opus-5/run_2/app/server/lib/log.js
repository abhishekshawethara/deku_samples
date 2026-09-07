import crypto from 'node:crypto';

/**
 * The app writes structured logs to stdout, one line of JSON per request,
 * carrying the method, the route, the status and the elapsed milliseconds.
 * Every line carries a request_id generated at the edge of the request, and the
 * same value is returned in the body of every error response.
 */
export function newRequestId() {
  return crypto.randomUUID();
}

export function logLine(fields) {
  process.stdout.write(`${JSON.stringify({ ts: new Date().toISOString(), ...fields })}\n`);
}

export function logRequest({ method, route, status, ms, requestId, extra }) {
  logLine({
    level: status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info',
    msg: 'request',
    method,
    route,
    status,
    duration_ms: Math.round(ms),
    request_id: requestId,
    ...(extra || {}),
  });
}
