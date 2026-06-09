import mongoose from 'mongoose';

const InvitationSchema = new mongoose.Schema(
  {
    shortId: { type: String, required: true, unique: true, index: true },
    formData: {
      groomName: { type: String, required: true },
      brideName: { type: String, required: true },
      weddingDate: { type: String, required: true },
      weddingVenue: { type: String, required: true },
      rsvpPhone: { type: String, required: true },
      language: { type: String, required: true },
      theme: { type: String, required: true },
      template: { type: String, required: true }
    },
    uploadedPhotoUrl: { type: String, required: true },
    generatedText: { type: String, required: true },
    finalImageUrl: { type: String, required: true }
  },
  { timestamps: true }
);

export const Invitation = mongoose.model('Invitation', InvitationSchema);