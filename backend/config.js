import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const result = dotenv.config({ path: join(__dirname, '.env') });

if (result.error) {
    console.error('❌ Error loading .env file:', result.error);
} else {
    console.log('✅ Environment variables loaded successfully');
}

export default process.env;
