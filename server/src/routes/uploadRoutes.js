import { Router } from 'express';
import multer from 'multer';
import fs from 'node:fs/promises';
import path from 'node:path';
import { shouldUseCloudinary, uploadBufferToCloudinary } from '../lib/cloudinary.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only JPG, PNG, or WebP images are allowed.'));
    }
    cb(null, true);
  }
});

router.post('/photo', upload.single('photo'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Photo file is required.' });
    }

    let result;

    if (!shouldUseCloudinary()) {
      const extension = req.file.mimetype.split('/')[1].replace('jpeg', 'jpg');
      const fileName = `photo-${Date.now()}.${extension}`;
      const uploadDirectory = path.resolve(process.cwd(), 'uploads');
      await fs.mkdir(uploadDirectory, { recursive: true });
      await fs.writeFile(path.join(uploadDirectory, fileName), req.file.buffer);
      result = {
        secure_url: `${req.protocol}://${req.get('host')}/uploads/${fileName}`,
        public_id: fileName
      };
    } else {
      result = await uploadBufferToCloudinary(req.file.buffer, {
        public_id: `photo-${Date.now()}`,
        transformation: [{ width: 1400, height: 1400, crop: 'limit', quality: 'auto', fetch_format: 'auto' }]
      });
    }

    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (error) {
    next(error);
  }
});

export default router;