import express from 'express';
import SymptomSession from '../models/SymptomSession.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get user health analytics dashboard data
 * @access  Private
 */
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Fetch all sessions for stats
    const sessions = await SymptomSession.find({ userId })
      .sort({ createdAt: -1 })
      .limit(100); // Limit to last 100 for performance on aggregation if needed, or remove for full stats

    // Total Analyses
    const totalAnalyses = await SymptomSession.countDocuments({ userId });

    // 2. Triage Distribution
    const triageDistribution = {
      emergency: 0,
      'urgent-visit': 0,
      'see-doctor': 0,
      'self-care': 0
    };

    // 3. Severity Trends (Last 7 sessions for chart)
    const severityMap = { 'mild': 1, 'moderate': 2, 'severe': 3, 'critical': 4 };
    const recentSessions = sessions.slice(0, 10).reverse(); // Last 10 chronological
    
    const severityTrend = recentSessions.map(session => ({
      date: session.createdAt,
      severityLevel: severityMap[session.severity] || 0,
      severityLabel: session.severity
    }));

    // 4. Calculate Health Score
    // Simple algorithm: Start at 100.
    // Deduct points based on recent (last 30 days) severity.
    let healthScore = 100;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentMonthSessions = sessions.filter(s => s.createdAt >= thirtyDaysAgo);
    
    if (recentMonthSessions.length > 0) {
        let weightedSeveritySum = 0;
        recentMonthSessions.forEach(s => {
            weightedSeveritySum += (severityMap[s.severity] || 0);
        });
        const averageSeverity = weightedSeveritySum / recentMonthSessions.length;
        
        // Formula: 100 - (Average Severity * 15)
        // mild (1) -> 85
        // critical (4) -> 40
        healthScore = Math.max(0, Math.round(100 - (averageSeverity * 15)));
    }

    // Populate Triage Distribution
    sessions.forEach(session => {
        const triage = session.analysisResult?.triageLevel;
        if (triage && triageDistribution[triage] !== undefined) {
            triageDistribution[triage]++;
        }
    });

    // 5. Common Conditions (derived from existingConditions or analyzing frequency of symptoms/triage - keeping simple for now)
    // We'll return the triage distribution as the "condition overview" for now.

    res.json({
      summary: {
        totalAnalyses,
        healthScore,
        lastCheckup: sessions[0]?.createdAt || null
      },
      charts: {
        severityTrend,
        triageDistribution
      },
      recentActivity: sessions.slice(0, 5)
    });

  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ error: 'Server error fetching analytics' });
  }
});

export default router;
