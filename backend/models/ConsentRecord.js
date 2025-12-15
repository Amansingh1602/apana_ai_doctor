import mongoose from 'mongoose';

const consentRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  consentGiven: {
    type: Boolean,
    required: true,
    default: false
  },
  consentText: {
    type: String,
    required: true,
    default: 'I understand that this is an educational tool only and not a substitute for professional medical advice.'
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
consentRecordSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('ConsentRecord', consentRecordSchema);
