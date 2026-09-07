/**
 * An invalid, unauthorized or out-of-state call is rejected as a client error,
 * never a 5xx and never a silent success, and carries a stable machine-readable
 * code, a human message and the request_id.
 */
class AppError extends Error {
  constructor(status, code, message, extra = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}

const badRequest = (code, message, extra) => new AppError(400, code, message, extra);
const notFound = (message = 'That page does not exist.') =>
  new AppError(404, 'not_found', message);
const conflict = (code, message, extra) => new AppError(409, code, message, extra);

export { AppError as A, badRequest as b, conflict as c, notFound as n };
