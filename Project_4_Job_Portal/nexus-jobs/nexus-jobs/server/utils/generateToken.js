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
  const options = {
    expires: new Date(Date.now() + cookieDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
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

module.exports = { generateToken, sendTokenResponse };
