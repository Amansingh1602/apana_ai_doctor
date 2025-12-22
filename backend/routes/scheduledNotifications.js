import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import ScheduledNotification from '../models/ScheduledNotification.js';

const router = express.Router();

// Get all scheduled notifications for the user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const notifications = await ScheduledNotification.find({ user: req.user._id })
            .sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching schedules' });
    }
});

// Create a new scheduled notification
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { label, time, channels, reminderEmail } = req.body;

        // Basic validation
        if (!label || !time) {
            return res.status(400).json({ error: 'Label and time are required' });
        }

        // If email channel is selected and no reminderEmail provided, use user's email
        const emailToUse = reminderEmail || req.user.email;

        const notification = new ScheduledNotification({
            user: req.user._id,
            label,
            time,
            channels: channels || ['email'],
            reminderEmail: channels?.includes('email') ? emailToUse : undefined
        });

        await notification.save();
        res.status(201).json(notification);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating schedule' });
    }
});

// Delete a scheduled notification
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const notification = await ScheduledNotification.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!notification) {
            return res.status(404).json({ error: 'Schedule not found' });
        }

        res.json({ message: 'Schedule deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting schedule' });
    }
});

// Toggle active status
router.put('/:id/toggle', authMiddleware, async (req, res) => {
    try {
        const notification = await ScheduledNotification.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!notification) {
            return res.status(404).json({ error: 'Schedule not found' });
        }

        notification.isActive = !notification.isActive;
        await notification.save();

        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: 'Error updating schedule' });
    }
});

export default router;
