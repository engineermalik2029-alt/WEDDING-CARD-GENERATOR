import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

function ensureCloudinaryConfig() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary credentials are required. Check server/.env.');
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

export function uploadBufferToCloudinary(buffer, options = {}) {
  ensureCloudinaryConfig();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'premium-wedding-cards',
        resource_type: 'image',
        ...options
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

export async function uploadBase64PngToCloudinary(base64Image, publicId) {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.warn('Cloudinary credentials missing. Returning inline generated image for development/demo mode.');
    const mimeType = process.env.OPENAI_API_KEY ? 'image/png' : 'image/svg+xml';
    return {
      secure_url: `data:${mimeType};base64,${base64Image}`,
      public_id: publicId
    };
  }

  ensureCloudinaryConfig();
  return cloudinary.uploader.upload(`data:image/png;base64,${base64Image}`, {
    folder: 'premium-wedding-cards/generated',
    public_id: publicId,
    resource_type: 'image',
    overwrite: true
  });
}