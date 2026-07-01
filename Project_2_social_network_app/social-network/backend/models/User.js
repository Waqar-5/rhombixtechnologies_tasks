const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
      match: [/^[a-z0-9_.]+$/, 'Username can only contain lowercase letters, numbers, underscores and dots'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    coverPhoto: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: 250,
      default: '',
    },
    location: {
      type: String,
      maxlength: 100,
      default: '',
    },
    website: {
      type: String,
      maxlength: 150,
      default: '',
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Privacy settings
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'public',
      },
      friendsListVisibility: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'public',
      },
      whoCanMessage: {
        type: String,
        enum: ['everyone', 'friends', 'nobody'],
        default: 'everyone',
      },
      whoCanPostOnTimeline: {
        type: String,
        enum: ['everyone', 'friends', 'nobody'],
        default: 'friends',
      },
      showOnlineStatus: {
        type: Boolean,
        default: true,
      },
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    savedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
  },
  { timestamps: true }
);

userSchema.index({ name: 'text', username: 'text' });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Strip sensitive/internal fields whenever a user doc is serialized
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
