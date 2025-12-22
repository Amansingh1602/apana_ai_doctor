import express from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get API key dynamically
const getGrokApiKey = () => process.env.GROK_API_KEY;

/**
 * Build prompt for finding doctors
 */
function buildDoctorSearchPrompt(city, specialty) {
  return `You are a medical directory assistant for India. Find real, well-known doctors and hospitals.

SEARCH REQUEST:
- City/Location: ${city || 'Any major city in India'}
- Specialty needed: ${specialty || 'General Physician'}

TASK: Provide exactly 4 real, reputable doctors or hospitals in India that match this search. Include doctors from the specified city if possible, but also include renowned specialists from other major Indian cities who are known for this specialty.

IMPORTANT GUIDELINES:
1. Suggest REAL hospitals and doctors that actually exist in India
2. Include a mix of private hospitals (Apollo, Fortis, Max, Medanta, etc.) and government hospitals (AIIMS, PGI, etc.)
3. Provide realistic contact numbers (hospital main numbers)
4. Include doctors from different cities across India for variety
5. Prioritize well-known, reputable institutions

REQUIRED JSON RESPONSE FORMAT (RESPOND ONLY WITH VALID JSON, NO MARKDOWN):
{
  "doctors": [
    {
      "id": "unique_id",
      "name": "Dr. Full Name or Hospital Name",
      "specialty": "Exact specialty",
      "hospital": "Hospital/Institution name",
      "city": "City name",
      "experience": "X years or 'Premier Institute'",
      "rating": 4.5,
      "contact": "Phone number with STD code",
      "address": "Brief address"
    }
  ]
}

Provide exactly 4 doctors/hospitals. Make them realistic and helpful for patients in India.`;
}

/**
 * Parse AI response for doctors
 */
function parseDoctorResponse(responseText) {
  try {
    let cleanText = responseText;
    cleanText = cleanText.replace(/```json\s*/gi, '');
    cleanText = cleanText.replace(/```\s*/gi, '');
    cleanText = cleanText.trim();
    
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.doctors || [];
    }
    throw new Error('No valid JSON found in response');
  } catch (error) {
    console.error('Error parsing doctor response:', error);
    return null;
  }
}

/**
 * Search doctors using Grok AI
 */
async function searchDoctorsWithAI(city, specialty) {
  try {
    console.log('🏥 Calling Grok API for doctor search...');
    const prompt = buildDoctorSearchPrompt(city, specialty);
    const apiKey = getGrokApiKey();
    
    if (!apiKey) {
      console.error('❌ GROK_API_KEY not found');
      return null;
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a medical directory assistant for India. Always respond with valid JSON only, no markdown. Provide real, accurate information about doctors and hospitals in India.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Grok API error:', errorData);
      throw new Error(`Grok API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error('Empty response from Grok');
    }

    console.log('✅ Grok API response received for doctors');
    const doctors = parseDoctorResponse(text);
    
    if (doctors && doctors.length > 0) {
      return doctors;
    }
    
    throw new Error('Failed to parse doctor response');
  } catch (error) {
    console.error('❌ Doctor search AI error:', error.message);
    return null;
  }
}

/**
 * Fallback doctors if AI fails
 */
function getFallbackDoctors(city, specialty) {
  return [
    {
      id: 'f1',
      name: 'All India Institute of Medical Sciences (AIIMS)',
      specialty: specialty || 'Multi-Specialty',
      hospital: 'AIIMS Delhi',
      city: 'New Delhi',
      experience: 'Premier Government Institute',
      rating: 5.0,
      contact: '011-26588500',
      address: 'Ansari Nagar, New Delhi'
    },
    {
      id: 'f2',
      name: 'Apollo Hospitals',
      specialty: specialty || 'Multi-Specialty',
      hospital: 'Apollo Hospitals',
      city: city || 'Chennai',
      experience: 'Leading Private Hospital Chain',
      rating: 4.8,
      contact: '1860-500-1066',
      address: 'Greams Road, Chennai'
    },
    {
      id: 'f3',
      name: 'Fortis Healthcare',
      specialty: specialty || 'Multi-Specialty',
      hospital: 'Fortis Hospital',
      city: city || 'Gurugram',
      experience: 'Trusted Healthcare Network',
      rating: 4.7,
      contact: '0124-4962200',
      address: 'Sector 44, Gurugram'
    },
    {
      id: 'f4',
      name: 'Medanta - The Medicity',
      specialty: specialty || 'Multi-Specialty',
      hospital: 'Medanta Hospital',
      city: 'Gurugram',
      experience: 'Super-Specialty Hospital',
      rating: 4.9,
      contact: '0124-4141414',
      address: 'Sector 38, Gurugram'
    }
  ];
}

/**
 * @route   GET /api/doctors/search
 * @desc    Search for doctors by city and specialty using AI
 * @access  Private
 */
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { city, specialty } = req.query;
    
    console.log(`🔍 Doctor search request - City: ${city}, Specialty: ${specialty}`);

    // Try AI-powered search
    let doctors = await searchDoctorsWithAI(city, specialty);
    
    // Use fallback if AI fails
    if (!doctors || doctors.length === 0) {
      console.log('⚠️ Using fallback doctors');
      doctors = getFallbackDoctors(city, specialty);
    }

    // Ensure we return max 4 doctors
    doctors = doctors.slice(0, 4);

    res.json({ 
      recommended: doctors,
      source: doctors === getFallbackDoctors(city, specialty) ? 'fallback' : 'ai'
    });

  } catch (error) {
    console.error('Doctor Search Error:', error);
    res.status(500).json({ error: 'Failed to search doctors' });
  }
});

export default router;
