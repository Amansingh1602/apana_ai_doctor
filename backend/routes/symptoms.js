import express from 'express';
import { body, validationResult } from 'express-validator';
import SymptomSession from '../models/SymptomSession.js';
import { authMiddleware } from '../middleware/auth.js';
import { analyzeSymptoms } from '../services/aiService.js';

const router = express.Router();

// Validation rules
const symptomValidation = [
  body('symptomsText')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Please describe symptoms in at least 10 characters'),
  body('severity')
    .isIn(['mild', 'moderate', 'severe', 'critical'])
    .withMessage('Please select a valid severity level'),
  body('age')
    .isInt({ min: 1, max: 120 })
    .withMessage('Please enter a valid age')
];

// Create new symptom session and get AI analysis
router.post('/analyze', authMiddleware, symptomValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      symptomsText,
      severity,
      onset,
      duration,
      existingConditions,
      currentMedications,
      allergies,
      age,
      isPregnant
    } = req.body;

    // Create session
    const session = new SymptomSession({
      userId: req.userId,
      symptomsText,
      severity,
      onset,
      duration,
      existingConditions,
      currentMedications,
      allergies,
      age,
      isPregnant: isPregnant || false
    });

    await session.save();

    // Get AI analysis
    const analysisResult = await analyzeSymptoms({
      symptomsText,
      severity,
      onset,
      duration,
      existingConditions,
      currentMedications,
      allergies,
      age,
      isPregnant
    });

    // Update session with analysis result
    session.analysisResult = analysisResult;
    await session.save();

    res.status(201).json({
      message: 'Analysis completed',
      session: {
        id: session._id,
        symptomsText: session.symptomsText,
        severity: session.severity,
        analysisResult: session.analysisResult,
        createdAt: session.createdAt
      }
    });
  } catch (error) {
    console.error('Symptom analysis error:', error);
    res.status(500).json({ error: 'Error analyzing symptoms. Please try again.' });
  }
});

// Get user's symptom history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sessions = await SymptomSession.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-uploadedReportData');

    const total = await SymptomSession.countDocuments({ userId: req.userId });

    res.json({
      sessions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Error fetching symptom history' });
  }
});

// Get single session details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const session = await SymptomSession.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ session });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Error fetching session details' });
  }
});

// Delete a session
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const session = await SymptomSession.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Error deleting session' });
  }
});

export default router;
