import nodemailer from 'nodemailer';

let transporter;
let isConfigured = false;

console.log('📧 Email Service - Checking credentials...');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***SET***' : 'NOT SET');

if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    isConfigured = true;
    console.log('✅ Email Service Initialized with', process.env.EMAIL_USER);
} else {
    console.log('⚠️ Email credentials missing. Emails will be mocked.');
}

export const sendEmail = async (to, subject, text, html) => {
    if (!isConfigured) {
        console.log(`[EMAIL MOCK] To: ${to} | Subject: ${subject}`);
        console.log(`Body: ${text}`);
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: `"Apna Doctor" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        });
        console.log('✅ Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('❌ Error sending email:', error);
    }
};

// HTML Template for Scheduled Reminders
const getReminderTemplate = (userName, label, time) => `
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
            <h2>Apna Doctor Reminder</h2>
        </div>
        <div class="content">
            <p>Hello ${userName || 'User'},</p>
            <p>This is a scheduled reminder for you:</p>
            <div class="time-box">
                <div class="label">${label}</div>
                <div style="font-size: 18px; color: #64748b;">Scheduled for: ${time}</div>
            </div>
            <p>Stay healthy!</p>
        </div>
        <div class="footer">
            &copy; 2025 Apna Doctor - Your AI Health Assistant
        </div>
    </div>
</body>
</html>
`;

export const sendScheduledReminderEmail = async (user, label, time) => {
    const subject = `Reminder: ${label}`;
    const text = `Hello, this is your reminder for: ${label} scheduled for ${time}.`;
    const html = getReminderTemplate(user.fullName, label, time);

    return sendEmail(user.email, subject, text, html);
};
