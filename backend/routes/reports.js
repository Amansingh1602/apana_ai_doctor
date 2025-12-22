import express from 'express';
import PDFDocument from 'pdfkit';
import SymptomSession from '../models/SymptomSession.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/reports/generate/:sessionId
 * @desc    Generate and stream a PDF report for a specific session
 * @access  Private
 */
router.get('/generate/:sessionId', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await SymptomSession.findOne({ _id: sessionId, userId: req.user._id });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const user = await User.findById(req.user._id);

    // Create a document
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Health_Report_${sessionId}.pdf`);

    // Pipe the PDF into the response
    doc.pipe(res);

    // --- PDF CONTENT ---

    // 1. Header with Logo Area (Simulated)
    doc.fillColor('#3b82f6').rect(0, 0, 612, 100).fill(); // Blue Header Background
    
    doc.fontSize(24).fillColor('#ffffff').text('Apna Doctor', 50, 35);
    doc.fontSize(10).text('AI-Powered Smart Symptom Checker', 50, 65);
    doc.fontSize(10).text('www.apnadoctor.com', 450, 45, { align: 'right' });

    doc.moveDown(4);

    // 2. Report Information
    doc.fillColor('#000000');
    
    doc.fontSize(18).text('Medical Analysis Report', { align: 'center' });
    doc.moveDown();

    // 3. Patient Details Box
    const startY = doc.y;
    doc.rect(50, startY, 512, 80).stroke('#e2e8f0');
    
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Patient Name:', 70, startY + 15);
    doc.text('Age / Gender:', 70, startY + 35);
    doc.text('Date:', 350, startY + 15);
    doc.text('Report ID:', 350, startY + 35);

    doc.font('Helvetica');
    doc.text(user.fullName, 160, startY + 15);
    doc.text(`${session.age} / ${user.profile?.gender || 'N/A'}`, 160, startY + 35);
    doc.text(new Date(session.createdAt).toLocaleDateString(), 420, startY + 15);
    doc.text(session._id.toString().substring(0, 8).toUpperCase(), 420, startY + 35);

    doc.moveDown(5);

    // 4. Symptoms Analysis
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e293b').text('Clinical Assessment');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').fillColor('#334155');
    
    doc.text('Reported Symptoms:', { continued: true }).font('Helvetica-Bold').text(` ${session.symptomsText}`);
    doc.moveDown(0.5);
    doc.font('Helvetica').text('Severity Level:', { continued: true }).fillColor(
        session.severity === 'critical' ? '#ef4444' : 
        session.severity === 'severe' ? '#f97316' : 
        session.severity === 'moderate' ? '#eab308' : '#22c55e'
    ).font('Helvetica-Bold').text(` ${session.severity.toUpperCase()}`);
    
    doc.fillColor('#334155').moveDown(0.5);
    doc.font('Helvetica').text('Triage Recommendation:', { continued: true }).font('Helvetica-Bold').text(` ${session.analysisResult?.triageLevel?.toUpperCase() || 'N/A'}`);

    doc.moveDown(2);

    // 5. Possible Conditions
    if (session.analysisResult?.possibleConditions) {
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e293b').text('Possible Indications');
        doc.moveDown(0.5);
        
        session.analysisResult.possibleConditions.forEach((condition, i) => {
            const name = typeof condition === 'string' ? condition : condition.name;
            doc.fontSize(10).font('Helvetica').fillColor('#475569')
               .text(`• ${name}`, { indent: 10 });
        });
        doc.moveDown(2);
    }

    // 6. Recommended Medicines Table
    if (session.analysisResult?.recommendations?.medicines?.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e293b').text('Suggested Approach');
        doc.fontSize(10).font('Helvetica-Oblique').fillColor('#64748b').text('(Always consult a doctor before use)');
        doc.moveDown(1);

        const tableTop = doc.y;
        const col1 = 50;
        const col2 = 250;
        const col3 = 450;

        // Table Header
        doc.rect(50, tableTop, 512, 20).fill('#f1f5f9');
        doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10);
        doc.text('Medicine', col1 + 10, tableTop + 5);
        doc.text('Dosage', col2, tableTop + 5);
        doc.text('Frequency', col3, tableTop + 5);

        let currentY = tableTop + 25;

        // Table Rows
        session.analysisResult.recommendations.medicines.forEach((med, i) => {
            if (currentY > 700) { // New page if full
                doc.addPage();
                currentY = 50;
            }
            
            doc.fillColor('#334155').font('Helvetica').fontSize(10);
            const name = med.name || med; // Handle string or object structure
            const dose = med.dose || '-';
            const freq = med.frequency || '-';

            doc.text(name, col1 + 10, currentY);
            doc.text(dose, col2, currentY);
            doc.text(freq, col3, currentY);
            
            doc.moveTo(50, currentY + 15).lineTo(562, currentY + 15).strokeOpacity(0.2).stroke('#cbd5e1');
            currentY += 25;
        });
        
        doc.moveDown(3);
    }

    // 7. Footer / Disclaimer (Bottom of page)
    const pageHeight = doc.page.height;
    doc.font('Helvetica').fontSize(8).fillColor('#94a3b8');
    doc.text(
        'DISCLAIMER: This report is generated by an AI system (Apna Doctor). It is for informational purposes only and DOES NOT constitute professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.',
        50,
        pageHeight - 100,
        { align: 'center', width: 512 }
    );

    // Finalize PDF file
    doc.end();

  } catch (error) {
    console.error('PDF Generation Error:', error);
    if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to generate report' });
    }
  }
});

export default router;
