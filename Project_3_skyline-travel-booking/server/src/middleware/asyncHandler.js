// Express 4 does not automatically catch rejected promises returned by
// async route handlers (that behavior only shipped in Express 5). Without
// this wrapper, any thrown error inside an async controller becomes an
// unhandled promise rejection — and since Node.js 15, the default behavior
// for an unhandled rejection is to terminate the entire process. That means
// a single bad request (malformed input, a database hiccup, anything)
// could take the whole API down for every user, not just fail one request.
//
// Wrapping every async controller with this ensures errors are forwarded
// to Express's error-handling middleware (see index.js) instead, which
// returns a clean 500 response and keeps the server running.
export function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
