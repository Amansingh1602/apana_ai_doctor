import cron from 'node-cron';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import ScheduledNotification from '../models/ScheduledNotification.js';
import { sendEmail, sendScheduledReminderEmail } from './emailService.js';
import { sendPushNotification } from './pushService.js';
import { sendSMS } from './smsService.js';

// HTML Template for reminders in cron
const getReminderEmailTemplate = (userName, label, time) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        .container { font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; }
        .header { background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { padding: 30px; line-height: 1.6; color: #334155; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #94a3b8; }
        .time-box { background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; border: 1px solid #e2e8f0; }
        .label { font-size: 24px; font-weight: bold; color: #1e293b; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>🔔 Apna Doctor Reminder</h2>
        </div>
        <div class="content">
            <p>Hello ${userName || 'User'},</p>
            <p>This is your scheduled reminder:</p>
            <div class="time-box">
                <div class="label">${label}</div>
                <div style="font-size: 18px; color: #64748b;">⏰ Scheduled at: ${time}</div>
            </div>
            <p>Stay healthy and on track! 💊</p>
        </div>
        <div class="footer">
            &copy; 2025 Apna Doctor - Your AI Health Assistant
        </div>
    </div>
</body>
</html>
`;

// Initialize Cron Jobs
export const initCronJobs = () => {
    console.log('⏳ Initializing Cron Jobs...');

    // Weekly Health Summary (Monday at 9:00 AM)
    cron.schedule('0 9 * * 1', async () => {
        console.log('Running Weekly Health Summary Job...');
        try {
            const users = await User.find({});
            for (const user of users) {
                // In-App Notification
                await Notification.create({
                    user: user._id,
                    title: 'Weekly Health Summary',
                    message: 'Your weekly health check is ready. Review your goals and progress.',
                    type: 'info'
                });

                // Email Notification
                if (user.profile.emailNotifications) {
                    await sendEmail(
                        user.email,
                        'Weekly Health Summary',
                        'Here is your weekly health summary...'
                    );
                }
            }
        } catch (error) {
            console.error('Error in weekly summary job:', error);
        }
    });

    // Daily Medicine Reminder (Every day at 8:00 AM)
    cron.schedule('0 8 * * *', async () => {
        console.log('Running Daily Medicine Reminder Job...');
        try {
            const users = await User.find({});
            for (const user of users) {
                const message = "Time to take your morning medication/supplements and log your symptoms!";

                // In-App
                await Notification.create({
                    user: user._id,
                    title: 'Medicine Reminder',
                    message: message,
                    type: 'alert'
                });

                // Push
                if (user.profile.pushNotifications && user.profile.fcmToken) {
                    await sendPushNotification(
                        user.profile.fcmToken,
                        'Medicine Reminder',
                        message
                    );
                }

                // SMS
                if (user.profile.smsNotifications && user.profile.phoneNumber) {
                    await sendSMS(user.profile.phoneNumber, message);
                }
            }
        } catch (error) {
            console.error('Error in daily medicine job:', error);
        }
    });

    // Scheduled Notifications (Every Minute)
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const currentTime = `${hours}:${minutes}`;

            const schedules = await ScheduledNotification.find({
                time: currentTime,
                isActive: true
            }).populate('user');

            for (const schedule of schedules) {
                const { user, label, channels } = schedule;
                const message = `Reminder: ${label}`;

                // In-App notification
                await Notification.create({
                    user: user._id,
                    title: 'Scheduled Reminder',
                    message: message,
                    type: 'reminder'
                });

                // Email
                if (channels.includes('email')) {
                    const emailToSend = schedule.reminderEmail || user.email;
                    await sendEmail(
                        emailToSend,
                        `Reminder: ${label}`,
                        message,
                        getReminderEmailTemplate(user.fullName, label, schedule.time)
                    );
                }

                // SMS
                if (channels.includes('sms') && user.profile.smsNotifications && user.profile.phoneNumber) {
                    await sendSMS(user.profile.phoneNumber, message);
                }
            }
        } catch (error) {
            console.error('Error in scheduled notification job:', error);
        }
    });

    console.log('✅ Cron Jobs Scheduled: Weekly Summary (Mon 9AM), Medicine Reminder (Daily 8AM)');
};
