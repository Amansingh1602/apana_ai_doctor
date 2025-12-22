import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import Notification from '../models/Notification.js';
import { sendEmail } from '../services/emailService.js';

const router = express.Router();

// Send a test email to the current user
router.post('/test-email', authMiddleware, async (req, res) => {
    try {
        await sendEmail(
            req.user.email,
            'Apna Doctor - Email Connection Test',
            `Hello ${req.user.fullName}! Your email notification system is working perfectly.`
        );
        res.json({ message: 'Test email sent successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send test email' });
    }
});

// Get recent notifications
router.get('/', authMiddleware, async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching notifications' });
    }
});

// Mark as read
router.put('/:id/read', authMiddleware, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { read: true },
            { new: true }
        );
        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: 'Error updating notification' });
    }
});

// Mark all as read
router.put('/read-all', authMiddleware, async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, read: false },
            { read: true }
        );
        res.json({ message: 'All marked as read' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating notifications' });
    }
});

// Delete a notification
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting notification' });
    }
});

// Delete all notifications
router.delete('/', authMiddleware, async (req, res) => {
    try {
        await Notification.deleteMany({ user: req.user._id });
        res.json({ message: 'All notifications deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting notifications' });
    }
});

export default router;
