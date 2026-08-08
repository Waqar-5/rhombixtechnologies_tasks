const cloudinary = require('cloudinary').v2;
const config = require('./env');

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
});

/**
 * Uploads a file buffer to Cloudinary using an upload stream, so we never
 * have to write temp files to disk (works cleanly with multer memoryStorage,
 * and is required on serverless hosts like Vercel where the filesystem
 * is read-only/ephemeral).
 * @param {Buffer} fileBuffer
 * @param {string} folder - Cloudinary folder, e.g. 'blogsphere/avatars'
 * @param {object} [options]
 * @returns {Promise<{url: string, publicId: string, width: number, height: number}>}
 */
const uploadBufferToCloudinary = (fileBuffer, folder, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        // Automatic compression/format optimization — keeps payloads small
        // without us hand-rolling image processing.
        quality: 'auto:good',
        fetch_format: 'auto',
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
        });
      }
    );
    stream.end(fileBuffer);
  });
};

/**
 * Deletes an image from Cloudinary by its public ID.
 * Used whenever a user replaces an avatar/cover image or a blog is deleted,
 * so we don't accumulate orphaned assets and inflate storage costs.
 * @param {string} publicId
 */
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    // Non-fatal — log and move on. We never want an image cleanup failure
    // to block the primary user-facing operation (e.g. deleting a blog).
    // eslint-disable-next-line no-console
    console.error(`Cloudinary deletion failed for ${publicId}: ${error.message}`);
  }
};

module.exports = { cloudinary, uploadBufferToCloudinary, deleteFromCloudinary };
