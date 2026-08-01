const jwt = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });

// Sets the JWT as an httpOnly cookie and also returns it in the JSON body,
// so the frontend can use either cookie-based or bearer-token auth.
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieDays = Number(process.env.JWT_COOKIE_EXPIRE) || 7;
  const isProduction = process.env.NODE_ENV === 'production';

  const options = {
    expires: new Date(Date.now() + cookieDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: isProduction,
    // 'lax' works locally (same-origin via the Vite proxy) but browsers never
    // send 'lax' cookies on cross-site XHR/fetch requests. In a split
    // deployment (frontend and backend on different domains), the cookie
    // must be 'none' — which browsers only allow when secure is also true,
    // which is guaranteed in production since both sides run on HTTPS.
    sameSite: isProduction ? 'none' : 'lax'
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: user.toSafeObject ? user.toSafeObject() : user
    });
};

// Clears the auth cookie on logout/deactivation. Must use the same
// secure/sameSite attributes as sendTokenResponse — browsers won't reliably
// clear a cookie set with different attributes than the ones used to clear it.
const clearTokenCookie = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
  });
};

module.exports = { generateToken, sendTokenResponse, clearTokenCookie };
