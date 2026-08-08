/**
 * One-time cleanup for stale local-storage image URLs.
 *
 * Context: this project briefly used local disk storage for uploaded
 * images before settling on Cloudinary. Any blog/category/avatar image
 * uploaded during that window has a URL like
 * "http://localhost:5000/uploads/blogs/covers/xxx.jpg" saved in MongoDB —
 * but that route no longer exists on the current (Cloudinary-based)
 * backend, so those specific images 404 forever until fixed.
 *
 * Re-uploading each affected post's cover image through the UI fixes it
 * one at a time. This script instead does it in bulk: it finds every
 * document with a "/uploads/" image URL and clears just that field, so
 * the frontend's existing fallback (a letter placeholder, via SafeImage)
 * takes over cleanly instead of trying and failing to load a dead URL.
 * It does NOT delete the blog/user/category itself — only the stale
 * image reference.
 *
 * Usage: npm run cleanup:uploads
 * Safe to run multiple times — it only ever touches fields matching the
 * stale pattern, so it's a no-op on documents that are already clean
 * (e.g. because they were re-uploaded to Cloudinary in the meantime).
 */
require('dotenv').config();
const connectDB = require('../config/db');
const Blog = require('../models/Blog');
const User = require('../models/User');
const Category = require('../models/Category');

const isStaleLocalUrl = (url) => typeof url === 'string' && url.includes('/uploads/');

const cleanup = async () => {
  await connectDB();

  // eslint-disable-next-line no-console
  console.log('🧹 Scanning for stale local-storage image references...\n');

  // --- Blogs: coverImage + gallery images ---
  const blogs = await Blog.find({
    $or: [{ 'coverImage.url': /\/uploads\// }, { 'images.url': /\/uploads\// }],
  });

  let blogsFixed = 0;
  for (const blog of blogs) {
    let changed = false;

    if (isStaleLocalUrl(blog.coverImage?.url)) {
      blog.coverImage = { url: '', publicId: '' };
      changed = true;
    }

    const cleanImages = (blog.images || []).filter((img) => !isStaleLocalUrl(img.url));
    if (cleanImages.length !== (blog.images || []).length) {
      blog.images = cleanImages;
      changed = true;
    }

    if (changed) {
      await blog.save();
      blogsFixed += 1;
      // eslint-disable-next-line no-console
      console.log(`  ✔ Cleared stale image(s) on blog: "${blog.title}"`);
    }
  }

  // --- Users: avatar ---
  const staleAvatarUsers = await User.find({ 'avatar.url': /\/uploads\// });
  for (const user of staleAvatarUsers) {
    user.avatar = { url: '', publicId: '' };
    await user.save({ validateBeforeSave: false });
    // eslint-disable-next-line no-console
    console.log(`  ✔ Cleared stale avatar on user: "${user.name}"`);
  }

  // --- Categories: image ---
  const staleCategoryImages = await Category.find({ 'image.url': /\/uploads\// });
  for (const category of staleCategoryImages) {
    category.image = { url: '', publicId: '' };
    await category.save();
    // eslint-disable-next-line no-console
    console.log(`  ✔ Cleared stale image on category: "${category.name}"`);
  }

  // eslint-disable-next-line no-console
  console.log(
    `\n🧹 Done. Fixed ${blogsFixed} blog(s), ${staleAvatarUsers.length} user avatar(s), ${staleCategoryImages.length} categor${staleCategoryImages.length === 1 ? 'y' : 'ies'}.`
  );
  // eslint-disable-next-line no-console
  console.log('Re-upload any of these images through the UI whenever you want them back — they\'ll go to Cloudinary this time.');

  process.exit(0);
};

cleanup().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('❌ Cleanup failed:', err);
  process.exit(1);
});
