// Usage: authorize('recruiter'), authorize('recruiter', 'jobseeker')
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized, no user context');
  }
  if (!roles.includes(req.user.role)) {
    res.status(403);
    throw new Error(`Role '${req.user.role}' is not permitted to perform this action`);
  }
  next();
};

module.exports = { authorize };
