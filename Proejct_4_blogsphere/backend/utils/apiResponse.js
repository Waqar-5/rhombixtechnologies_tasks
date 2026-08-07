/**
 * Standardized success response shape used across every controller, so the
 * frontend can rely on a single consistent envelope: { success, message, data, meta }
 */
const sendResponse = (res, statusCode, message, data = null, meta = null) => {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  if (meta !== null) body.meta = meta;
  return res.status(statusCode).json(body);
};

module.exports = sendResponse;
