/**
 * Seeds the database with demo data so the app can be explored immediately
 * without manually creating accounts.
 *
 * Run with: npm run seed
 *
 * Demo login for every seeded user: password "password123"
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const FriendRequest = require('../models/FriendRequest');
const Notification = require('../models/Notification');

const demoUsers = [
  { name: 'Waqar Ahmed', username: 'waqar', email: 'waqar@example.com', bio: 'Full-stack developer | React, Node, FastAPI', location: 'Sukkur, Pakistan' },
  { name: 'Ayesha Khan', username: 'ayesha', email: 'ayesha@example.com', bio: 'UI/UX designer crafting clean interfaces ✨', location: 'Karachi, Pakistan' },
  { name: 'Bilal Hussain', username: 'bilal', email: 'bilal@example.com', bio: 'Photography & travel 📸', location: 'Lahore, Pakistan' },
  { name: 'Sara Malik', username: 'sara', email: 'sara@example.com', bio: 'Coffee, code, repeat ☕', location: 'Islamabad, Pakistan' },
  { name: 'Hamza Tariq', username: 'hamza', email: 'hamza@example.com', bio: 'Building things on the internet', location: 'Sukkur, Pakistan' },
  { name: 'Zainab Riaz', username: 'zainab', email: 'zainab@example.com', bio: 'Bookworm & aspiring writer 📚', location: 'Multan, Pakistan' },
];

const samplePosts = [
  'Just shipped a new feature — real-time notifications are finally live! 🚀',
  'Beautiful sunset today. Sometimes you just have to stop and look up.',
  "Three cups of coffee in and the bug still won't fix itself. Send help ☕😅",
  'Reading a great book on system design this week. Highly recommend taking notes as you go.',
  "Weekend hike turned into a 6-hour adventure. Worth every step.",
  'Excited to start a new project this month. Big things coming!',
  'Sometimes the best code is the code you delete. Refactoring day.',
  'Grateful for good friends and good food this weekend.',
];

const seed = async () => {
  await connectDB();
  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Post.deleteMany({}),
    Comment.deleteMany({}),
    FriendRequest.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  console.log('Creating users...');
  const users = [];
  for (const u of demoUsers) {
    const user = await User.create({ ...u, password: 'password123' });
    users.push(user);
  }

  console.log('Creating friendships...');
  // Make the first user (waqar) friends with everyone for easy demoing
  const [main, ...others] = users;
  for (const other of others.slice(0, 4)) {
    main.friends.push(other._id);
    other.friends.push(main._id);
    await other.save();
  }
  await main.save();

  // A couple of cross-friendships among others
  others[0].friends.push(others[1]._id);
  others[1].friends.push(others[0]._id);
  await others[0].save();
  await others[1].save();

  console.log('Creating a pending friend request...');
  await FriendRequest.create({ sender: others[4]._id, recipient: main._id, status: 'pending' });

  console.log('Creating posts...');
  const posts = [];
  for (let i = 0; i < samplePosts.length; i++) {
    const author = users[i % users.length];
    const post = await Post.create({
      author: author._id,
      text: samplePosts[i],
      visibility: 'public',
    });
    posts.push(post);
  }

  console.log('Creating comments + likes...');
  for (const post of posts.slice(0, 5)) {
    const commenter = users[Math.floor(Math.random() * users.length)];
    const comment = await Comment.create({
      post: post._id,
      author: commenter._id,
      text: 'Love this! 🔥',
    });
    post.comments.push(comment._id);
    post.likes.push(users[(Math.floor(Math.random() * users.length))]._id);
    await post.save();
  }

  console.log('\n✅ Seed complete!');
  console.log('Demo accounts (all use password: password123):');
  users.forEach((u) => console.log(`   - ${u.username} (${u.email})`));

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
