import express from 'express';
import ConsentRecord from '../models/ConsentRecord.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Record consent
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { consentGiven, consentText } = req.body;

    const consent = new ConsentRecord({
      userId: req.userId,
      consentGiven,
      consentText: consentText || 'I understand that this is an educational tool only and not a substitute for professional medical advice.',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await consent.save();

    res.status(201).json({
      message: 'Consent recorded',
      consent: {
        id: consent._id,
        consentGiven: consent.consentGiven,
        createdAt: consent.createdAt
      }
    });
  } catch (error) {
    console.error('Record consent error:', error);
    res.status(500).json({ error: 'Error recording consent' });
  }
});

// Check if user has given consent
router.get('/check', authMiddleware, async (req, res) => {
  try {
    const consent = await ConsentRecord.findOne({
      userId: req.userId,
      consentGiven: true
    }).sort({ createdAt: -1 });

    res.json({
      hasConsent: !!consent,
      consent: consent ? {
        id: consent._id,
        consentGiven: consent.consentGiven,
        createdAt: consent.createdAt
      } : null
    });
  } catch (error) {
    console.error('Check consent error:', error);
    res.status(500).json({ error: 'Error checking consent' });
  }
});

export default router;
