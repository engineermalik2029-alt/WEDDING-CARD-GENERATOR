import { v2 as cloudinary } from 'cloudinary';
import fs from 'node:fs/promises';
import path from 'node:path';
import streamifier from 'streamifier';

export function shouldUseCloudinary() {
  return process.env.FREE_MODE === 'false'
    && Boolean(process.env.CLOUDINARY_CLOUD_NAME)
    && Boolean(process.env.CLOUDINARY_API_KEY)
    && Boolean(process.env.CLOUDINARY_API_SECRET);
}

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

export async function uploadBase64PngToCloudinary(base64Image, publicId, baseUrl = '') {
  if (!shouldUseCloudinary()) {
    console.warn('FREE_MODE enabled or Cloudinary credentials missing. Saving generated image locally.');
    const isLocalSvg = process.env.FREE_MODE !== 'false' || !process.env.OPENAI_API_KEY;
    const extension = isLocalSvg ? 'svg' : 'png';
    const mimeType = isLocalSvg ? 'image/svg+xml' : 'image/png';
    const fileName = `${publicId}.${extension}`;
    const generatedDirectory = path.resolve(process.cwd(), 'uploads', 'generated');
    await fs.mkdir(generatedDirectory, { recursive: true });
    await fs.writeFile(path.join(generatedDirectory, fileName), Buffer.from(base64Image, 'base64'));

    return {
      secure_url: baseUrl ? `${baseUrl.replace(/\/$/, '')}/uploads/generated/${fileName}` : `data:${mimeType};base64,${base64Image}`,
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