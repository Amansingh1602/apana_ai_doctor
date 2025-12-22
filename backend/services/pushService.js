import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

let firebaseInitialized = false;

try {
    if (process.env.FIREBASE_CREDENTIALS_PATH) {
        // Resolve absolute path
        const credPath = path.resolve(process.env.FIREBASE_CREDENTIALS_PATH);
        if (fs.existsSync(credPath)) {
            // In ESM, requiring a JSON file needs assertions or reading as file
            const serviceAccount = JSON.parse(fs.readFileSync(credPath, 'utf8'));

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            firebaseInitialized = true;
            console.log('✅ Firebase Admin Initialized');
        } else {
            console.log('⚠️ Firebase credentials file not found at:', credPath);
        }
    } else {
        console.log('⚠️ FIREBASE_CREDENTIALS_PATH not set. Push notifications will be mocked.');
    }
} catch (error) {
    console.error('❌ Error initializing Firebase:', error.message);
}

export const sendPushNotification = async (token, title, body, data = {}) => {
    if (!firebaseInitialized || !token) {
        console.log(`[PUSH MOCK] To: ${token} | Title: ${title} | Body: ${body}`);
        return;
    }

    try {
        const message = {
            notification: { title, body },
            data,
            token
        };
        const response = await admin.messaging().send(message);
        console.log('✅ Push sent:', response);
        return response;
    } catch (error) {
        console.error('❌ Error sending push:', error);
    }
};
