const transporter = require('../config/mailer');
const config = require('../config/env');

/**
 * Minimal shared HTML shell so every transactional email looks consistent
 * without pulling in a templating engine dependency.
 */
const wrapTemplate = (title, bodyHtml) => `
  <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
    <h1 style="font-size: 22px; color: #111827; margin-bottom: 4px;">BlogSphere</h1>
    <p style="color: #6b7280; font-size: 13px; margin-top: 0;">Write. Share. Inspire.</p>
    <div style="border-top: 1px solid #e5e7eb; margin: 20px 0;"></div>
    <h2 style="font-size: 18px; color: #111827;">${title}</h2>
    ${bodyHtml}
    <div style="border-top: 1px solid #e5e7eb; margin-top: 32px; padding-top: 16px;">
      <p style="color: #9ca3af; font-size: 12px;">© ${new Date().getFullYear()} BlogSphere. All rights reserved.</p>
    </div>
  </div>
`;

const send = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: config.smtp.from,
    to,
    subject,
    html,
  });
};

const sendWelcomeEmail = async (user) => {
  const html = wrapTemplate(
    `Welcome aboard, ${user.name}! 🎉`,
    `<p>Thanks for joining BlogSphere. We're excited to see what you write.</p>
     <p>Get started by completing your profile and publishing your first post.</p>`
  );
  await send({ to: user.email, subject: 'Welcome to BlogSphere', html });
};

const sendVerificationEmail = async (user, rawToken) => {
  const verifyUrl = `${config.clientUrl}/verify-email/${rawToken}`;
  const html = wrapTemplate(
    'Verify your email address',
    `<p>Hi ${user.name}, please confirm your email to activate your account.</p>
     <p><a href="${verifyUrl}" style="display:inline-block;background:#111827;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Verify Email</a></p>
     <p style="color:#6b7280;font-size:13px;">This link expires in 24 hours. If you didn't create an account, you can ignore this email.</p>`
  );
  await send({ to: user.email, subject: 'Verify your BlogSphere email', html });
};

const sendPasswordResetEmail = async (user, rawToken) => {
  const resetUrl = `${config.clientUrl}/reset-password/${rawToken}`;
  const html = wrapTemplate(
    'Reset your password',
    `<p>Hi ${user.name}, we received a request to reset your password.</p>
     <p><a href="${resetUrl}" style="display:inline-block;background:#111827;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Reset Password</a></p>
     <p style="color:#6b7280;font-size:13px;">This link expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>`
  );
  await send({ to: user.email, subject: 'Reset your BlogSphere password', html });
};

const sendNewCommentEmail = async (author, commenterName, blogTitle, blogUrl) => {
  const html = wrapTemplate(
    'New comment on your post',
    `<p>${commenterName} commented on "<strong>${blogTitle}</strong>".</p>
     <p><a href="${blogUrl}" style="color:#111827;">View comment</a></p>`
  );
  await send({ to: author.email, subject: 'New comment on your BlogSphere post', html });
};

const sendNewReplyEmail = async (recipient, replierName, blogTitle, blogUrl) => {
  const html = wrapTemplate(
    'New reply to your comment',
    `<p>${replierName} replied to your comment on "<strong>${blogTitle}</strong>".</p>
     <p><a href="${blogUrl}" style="color:#111827;">View reply</a></p>`
  );
  await send({ to: recipient.email, subject: 'New reply on BlogSphere', html });
};

const sendBlogPublishedEmail = async (author, blogTitle, blogUrl) => {
  const html = wrapTemplate(
    'Your blog is live! 🚀',
    `<p>"<strong>${blogTitle}</strong>" has been published and is now visible to readers.</p>
     <p><a href="${blogUrl}" style="color:#111827;">View your post</a></p>`
  );
  await send({ to: author.email, subject: 'Your BlogSphere post is published', html });
};

module.exports = {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendNewCommentEmail,
  sendNewReplyEmail,
  sendBlogPublishedEmail,
};
