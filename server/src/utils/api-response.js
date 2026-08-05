export function success(res, { statusCode = 200, message = '', data = {} } = {}) {
  return res.status(statusCode).json({ success: true, message, data });
}

export function failure(res, { statusCode = 400, message, errors = [] }) {
  return res.status(statusCode).json({ success: false, message, errors });
}
