import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import { authMiddleware } from '../middleware/auth.js';
import MedicalReport from '../models/MedicalReport.js';
import User from '../models/User.js';
import { analyzeImage } from '../services/aiService.js';

const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images and PDF files are allowed!'));
    }
});

// Upload a report
router.post('/upload', authMiddleware, upload.single('report'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload a file' });
        }

        const report = new MedicalReport({
            user: req.user._id,
            filename: req.file.filename,
            originalName: req.file.originalname,
            path: req.file.path,
            mimetype: req.file.mimetype,
            size: req.file.size
        });

        await report.save();

        res.status(201).json({
            message: 'File uploaded successfully',
            report
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Error uploading file' });
    }
});

// Analyze a report
router.post('/analyze/:id', authMiddleware, async (req, res) => {
    try {
        const report = await MedicalReport.findOne({ _id: req.params.id, user: req.user._id });
        if (!report) return res.status(404).json({ error: 'Report not found' });

        // Analyze with Gemini Vision
        const analysis = await analyzeImage(report.path, report.mimetype);
        if (!analysis) return res.status(500).json({ error: 'Failed to analyze report' });

        // Save result
        report.aiAnalysis = analysis;
        await report.save();

        res.json(report);
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: 'Error analyzing report' });
    }
});

// Get user's reports
router.get('/reports', authMiddleware, async (req, res) => {
    try {
        const reports = await MedicalReport.find({ user: req.user._id }).sort({ uploadDate: -1 });
        res.json(reports);
    } catch (error) {
        console.error('Fetch reports error:', error);
        res.status(500).json({ error: 'Error fetching reports' });
    }
});

// Delete a report
router.delete('/reports/:id', authMiddleware, async (req, res) => {
    try {
        const report = await MedicalReport.findOne({ _id: req.params.id, user: req.user._id });
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        // Delete the file from disk
        if (fs.existsSync(report.path)) {
            fs.unlinkSync(report.path);
        }

        // Delete from database
        await MedicalReport.findByIdAndDelete(req.params.id);

        res.json({ message: 'Report deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Error deleting report' });
    }
});

// Download a report
router.get('/reports/:id/download', authMiddleware, async (req, res) => {
    try {
        const report = await MedicalReport.findOne({ _id: req.params.id, user: req.user._id });
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        // Check if file exists
        if (!fs.existsSync(report.path)) {
            return res.status(404).json({ error: 'File not found on server' });
        }

        res.download(report.path, report.originalName);
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Error downloading file' });
    }
});

// Generate Health History PDF
router.get('/history-pdf', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        // You might want to fetch symptom history here too if you had a model for it

        const doc = new PDFDocument();

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=health-history-${user.fullName.replace(/\s+/g, '-')}.pdf`);

        doc.pipe(res);

        // Header
        doc.fontSize(25).text('Health History Report', { align: 'center' });
        doc.moveDown();

        // User Info
        doc.fontSize(16).text('Patient Profile');
        doc.fontSize(12).text(`Name: ${user.fullName}`);
        doc.text(`Email: ${user.email}`);
        doc.text(`Age: ${user.profile.age || 'N/A'}`);
        doc.text(`Gender: ${user.profile.gender || 'N/A'}`);
        doc.text(`Blood Type: ${user.profile.bloodType || 'N/A'}`);
        doc.text(`Height: ${user.profile.height ? user.profile.height + ' cm' : 'N/A'}`);
        doc.text(`Weight: ${user.profile.weight ? user.profile.weight + ' kg' : 'N/A'}`);
        doc.moveDown();

        // Health Goals
        if (user.profile.healthGoals && user.profile.healthGoals.length > 0) {
            doc.fontSize(16).text('Health Goals');
            user.profile.healthGoals.forEach(goal => {
                doc.fontSize(12).text(`• ${goal}`);
            });
            doc.moveDown();
        }

        // Footer
        doc.fontSize(10).text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center', valign: 'bottom' });

        doc.end();

    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ error: 'Error generating PDF' });
    }
});

export default router;
