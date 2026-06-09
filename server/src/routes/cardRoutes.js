import { Router } from 'express';
import { nanoid } from 'nanoid';
import { Invitation } from '../models/Invitation.js';
import { isDatabaseConnected } from '../lib/database.js';
import { findInvitationLocally, saveInvitationLocally } from '../lib/localStore.js';
import { uploadBase64PngToCloudinary } from '../lib/cloudinary.js';
import { generateInvitationImage, generateInvitationText } from '../services/openaiService.js';

const router = Router();

const requiredFields = ['groomName', 'brideName', 'weddingDate', 'weddingVenue', 'rsvpPhone', 'language', 'theme', 'template', 'photoUrl'];

function validatePayload(body) {
  const missing = requiredFields.filter((field) => !String(body[field] || '').trim());
  if (missing.length) {
    const error = new Error(`Missing required fields: ${missing.join(', ')}`);
    error.status = 400;
    throw error;
  }
}

router.post('/generate', async (req, res, next) => {
  try {
    validatePayload(req.body);

    const formData = {
      groomName: req.body.groomName.trim(),
      brideName: req.body.brideName.trim(),
      weddingDate: req.body.weddingDate.trim(),
      weddingVenue: req.body.weddingVenue.trim(),
      rsvpPhone: req.body.rsvpPhone.trim(),
      language: req.body.language.trim(),
      theme: req.body.theme.trim(),
      template: req.body.template.trim()
    };

    const shortId = nanoid(9);
    const generatedText = await generateInvitationText(formData);
    const imageBase64 = await generateInvitationImage({
      generatedText,
      theme: formData.theme,
      language: formData.language,
      photoUrl: req.body.photoUrl
    });

    const finalImage = await uploadBase64PngToCloudinary(imageBase64, `invitation-${shortId}`);

    const invitationPayload = {
      shortId,
      formData,
      uploadedPhotoUrl: req.body.photoUrl,
      generatedText,
      finalImageUrl: finalImage.secure_url
    };

    const invitation = isDatabaseConnected()
      ? await Invitation.create(invitationPayload)
      : await saveInvitationLocally(invitationPayload);

    const publicAppUrl = process.env.PUBLIC_APP_URL || process.env.CLIENT_URL || 'http://localhost:5173';

    res.status(201).json({
      id: invitation.shortId,
      shareUrl: `${publicAppUrl.replace(/\/$/, '')}/card/${invitation.shortId}`,
      generatedText: invitation.generatedText,
      finalImageUrl: invitation.finalImageUrl
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const invitation = isDatabaseConnected()
      ? await Invitation.findOne({ shortId: req.params.id }).lean()
      : await findInvitationLocally(req.params.id);
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found.' });
    }

    res.json({
      id: invitation.shortId,
      formData: invitation.formData,
      uploadedPhotoUrl: invitation.uploadedPhotoUrl,
      generatedText: invitation.generatedText,
      finalImageUrl: invitation.finalImageUrl,
      createdAt: invitation.createdAt
    });
  } catch (error) {
    next(error);
  }
});

export default router;