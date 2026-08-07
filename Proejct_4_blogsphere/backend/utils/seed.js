/**
 * Development seed script. Populates a fresh database with a starter set
 * of categories, tags, and one admin account so you're not starting from
 * a completely empty app. Safe to re-run — it skips anything that already
 * exists rather than creating duplicates.
 *
 * Usage: npm run seed
 * Configure the admin credentials via env vars, or accept the defaults
 * below (defaults are for LOCAL DEVELOPMENT ONLY — change the password
 * immediately if you ever run this against a real deployment).
 */
require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Tag = require('../models/Tag');

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@blogsphere.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
const ADMIN_NAME = process.env.SEED_ADMIN_NAME || 'BlogSphere Admin';

const CATEGORIES = [
  { name: 'Technology', description: 'Software, hardware, and everything in between.' },
  { name: 'Design', description: 'UI, UX, product design, and visual craft.' },
  { name: 'Business', description: 'Startups, strategy, and the working world.' },
  { name: 'Lifestyle', description: 'Health, productivity, and everyday living.' },
  { name: 'Culture', description: 'Books, film, music, and ideas worth discussing.' },
  { name: 'Science', description: 'Research, discovery, and how the world works.' },
];

const TAGS = [
  'react', 'javascript', 'nodejs', 'career', 'writing', 'productivity',
  'startups', 'ai', 'design-systems', 'remote-work',
];

const seed = async () => {
  await connectDB();

  // eslint-disable-next-line no-console
  console.log('🌱 Seeding database...');

  let admin = await User.findOne({ email: ADMIN_EMAIL });
  if (!admin) {
    admin = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
      isVerified: true,
    });
    // eslint-disable-next-line no-console
    console.log(`✅ Admin account created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    // eslint-disable-next-line no-console
    console.log('⚠️  Change this password immediately if this is not a local dev database.');
  } else {
    // eslint-disable-next-line no-console
    console.log(`ℹ️  Admin account already exists: ${ADMIN_EMAIL}`);
  }

  let createdCategories = 0;
  for (const cat of CATEGORIES) {
    const exists = await Category.findOne({ name: cat.name });
    if (!exists) {
      await Category.create(cat);
      createdCategories += 1;
    }
  }
  // eslint-disable-next-line no-console
  console.log(`✅ Categories: ${createdCategories} created, ${CATEGORIES.length - createdCategories} already existed`);

  let createdTags = 0;
  for (const name of TAGS) {
    const exists = await Tag.findOne({ name });
    if (!exists) {
      await Tag.create({ name });
      createdTags += 1;
    }
  }
  // eslint-disable-next-line no-console
  console.log(`✅ Tags: ${createdTags} created, ${TAGS.length - createdTags} already existed`);

  // eslint-disable-next-line no-console
  console.log('🌱 Seeding complete.');
  process.exit(0);
};

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
