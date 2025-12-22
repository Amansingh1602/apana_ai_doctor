import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

let client;
let isConfigured = false;

if (accountSid && authToken && fromNumber) {
    client = twilio(accountSid, authToken);
    isConfigured = true;
    console.log('✅ Twilio SMS Service Initialized');
} else {
    console.log('⚠️ Twilio credentials missing. SMS will be mocked.');
}

export const sendSMS = async (to, body) => {
    if (!isConfigured || !to) {
        console.log(`[SMS MOCK] To: ${to} | Body: ${body}`);
        return;
    }

    try {
        const message = await client.messages.create({
            body,
            from: fromNumber,
            to
        });
        console.log('✅ SMS sent:', message.sid);
        return message;
    } catch (error) {
        console.error('❌ Error sending SMS:', error.message);
    }
};
