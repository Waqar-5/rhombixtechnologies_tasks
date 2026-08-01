const nodemailer = (() => {
  try {
    // Optional dependency: only required if SMTP env vars are actually set.
    // eslint-disable-next-line global-require
    return require('nodemailer');
  } catch (error) {
    return null;
  }
})();

/**
 * Sends an email if SMTP_HOST/SMTP_USER/SMTP_PASS are configured in .env.
 * Otherwise, falls back to logging the email to the console - this keeps
 * local development frictionless and avoids link-based flows (password
 * reset) silently failing when no mail provider is set up.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!nodemailer || !SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log('\n--- EMAIL (dev fallback, no SMTP configured) ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(text || html);
    console.log('--- END EMAIL ---\n');
    return { delivered: false, fallback: true };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });

  await transporter.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to,
    subject,
    html,
    text
  });

  return { delivered: true, fallback: false };
};

module.exports = sendEmail;
