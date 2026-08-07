const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // never returned by default on queries
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    // --- Profile ---
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    bio: { type: String, maxlength: [300, 'Bio cannot exceed 300 characters'], default: '' },
    website: { type: String, default: '' },
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    location: { type: String, default: '' },
    occupation: { type: String, default: '' },
    skills: { type: [String], default: [] },

    // --- Account status ---
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },

    // --- Email verification ---
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },

    // --- Password reset ---
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    passwordChangedAt: { type: Date, select: false },

    // --- Refresh token rotation ---
    // Store a hash of the current valid refresh token so we can invalidate
    // sessions server-side (logout, password change) rather than trusting
    // any unexpired JWT forever.
    refreshTokenHash: { type: String, select: false },

    // --- Relations ---
    // Note: bookmarks are intentionally NOT stored here as an array.
    // They live in the dedicated Bookmark collection (see models/Bookmark.js)
    // so they scale independently and support a unique (user, blog) index.
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// Note: email already gets a unique index from `unique: true` on the field
// definition above, so we don't declare it again here.
userSchema.index({ name: 'text' });

// --- Hash password before save ---
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  // Skip on new-user creation — passwordChangedAt is only meaningful for
  // invalidating tokens issued before an actual change.
  if (!this.isNew) this.passwordChangedAt = Date.now() - 1000;
  next();
});

// --- Instance methods ---
userSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.changedPasswordAfter = function changedPasswordAfter(jwtTimestamp) {
  if (!this.passwordChangedAt) return false;
  const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
  return jwtTimestamp < changedTimestamp;
};

userSchema.methods.createEmailVerificationToken = function createEmailVerificationToken() {
  const rawToken = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h
  return rawToken; // raw token is emailed; hashed version stored in DB
};

userSchema.methods.createPasswordResetToken = function createPasswordResetToken() {
  const rawToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  this.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 min
  return rawToken;
};

// Never leak sensitive fields even if select() is misused somewhere.
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.refreshTokenHash;
    delete ret.emailVerificationToken;
    delete ret.emailVerificationExpires;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
