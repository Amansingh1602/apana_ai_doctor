// AI Service for symptom analysis using Grok API

// Get API key dynamically to ensure dotenv has loaded
const getGrokApiKey = () => process.env.GROK_API_KEY;

function buildPrompt(symptoms) {
  return `You are a medical triage assistant for an educational demonstration tool. Analyze the following symptoms and provide structured health guidance.

SYMPTOM INFORMATION:
- Primary Symptoms: ${symptoms.symptomsText}
- Severity Level: ${symptoms.severity}
- Patient Age: ${symptoms.age}
- Gender: ${symptoms.gender || 'Not specified'}
${symptoms.onset ? `- Symptom Onset: ${symptoms.onset}` : ""}
${symptoms.duration ? `- Duration: ${symptoms.duration}` : ""}
${symptoms.existingConditions ? `- Existing Conditions: ${symptoms.existingConditions}` : ""}
${symptoms.currentMedications ? `- Current Medications: ${symptoms.currentMedications}` : ""}
${symptoms.allergies ? `- Allergies: ${symptoms.allergies}` : ""}
${symptoms.isPregnant ? "- Patient is pregnant or might be pregnant" : ""}

CRITICAL SAFETY GUIDELINES:
1. If patient mentions chest pain, severe difficulty breathing, uncontrolled bleeding, sudden numbness, confusion, or loss of consciousness - return EMERGENCY triage only.
2. For ages < 2 or > 65, be conservative and escalate triage level.
3. For pregnant patients, automatically escalate at least one level and avoid medications contraindicated in pregnancy.
4. ONLY suggest OTC medications - never prescribe medications.
5. If unsure about anything, escalate the triage level.

REQUIRED JSON RESPONSE FORMAT (RESPOND ONLY WITH VALID JSON, NO MARKDOWN, NO CODE BLOCKS):
{
  "triageLevel": "emergency" | "urgent-visit" | "see-doctor" | "self-care",
  "triageReason": "Brief explanation of the triage decision",
  "possibleConditions": ["condition 1", "condition 2", "condition 3"],
  "recommendations": {
    "medicines": [
      {
        "name": "OTC medication name",
        "dose": "dose and frequency",
        "notes": "why this medication and precautions",
        "evidenceLevel": "Strong/Moderate/Supportive"
      }
    ],
    "homeRemedies": ["remedy 1", "remedy 2", "remedy 3"],
    "whatToDo": ["action 1", "action 2", "action 3"],
    "whatNotToDo": ["avoid 1", "avoid 2"],
    "dietaryAdvice": ["diet tip 1", "diet tip 2"],
    "doctorSpecialization": "Type of doctor to consult if needed",
    "emergencyContacts": [
      {
        "service": "Emergency Services",
        "number": "112",
        "description": "India emergency number"
      }
    ]
  },
  "followUpAdvice": "When to seek further medical attention",
  "confidenceScore": 0.0 to 1.0,
  "disclaimer": "This is an educational tool only and not medical advice. Always consult healthcare professionals for proper diagnosis and treatment."
}

Provide detailed, helpful, and accurate medical guidance based on the symptoms. Be thorough in your analysis.`;
}

function parseAIResponse(responseText) {
  try {
    // Remove markdown code blocks if present
    let cleanText = responseText;
    cleanText = cleanText.replace(/```json\s*/gi, '');
    cleanText = cleanText.replace(/```\s*/gi, '');
    cleanText = cleanText.trim();
    
    // Try to find JSON in the response
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No valid JSON found in response');
  } catch (error) {
    console.error('Error parsing AI response:', error);
    console.error('Raw response:', responseText);
    return null;
  }
}

async function analyzeWithGrok(symptoms) {
  try {
    console.log('🤖 Calling Grok API for symptom analysis...');
    const prompt = buildPrompt(symptoms);
    const apiKey = getGrokApiKey();
    
    console.log('🔑 API Key loaded:', apiKey ? 'Yes (length: ' + apiKey.length + ')' : 'NO - MISSING!');

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
            content: 'You are a helpful medical triage assistant. Always respond with valid JSON only, no markdown formatting or code blocks. Provide accurate, helpful health guidance based on symptoms described.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Grok API error response:', errorData);
      throw new Error(`Grok API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('✅ Grok API response received');
    
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error('Empty response from Grok');
    }

    console.log('📝 Raw AI response:', text.substring(0, 200) + '...');
    
    const parsed = parseAIResponse(text);
    if (parsed) {
      console.log('✅ Successfully parsed AI response');
      return parsed;
    }
    
    throw new Error('Failed to parse Grok response');
  } catch (error) {
    console.error('❌ Grok API error:', error.message);
    return null;
  }
}

function getFallbackResponse(symptoms) {
  const isEmergency =
    symptoms.severity === 'critical' ||
    /chest pain|difficulty breathing|unconscious|severe bleeding|stroke|heart attack/i.test(
      symptoms.symptomsText
    );

  if (isEmergency) {
    return {
      triageLevel: 'emergency',
      triageReason:
        'Based on the symptoms described, immediate medical attention is recommended.',
      possibleConditions: ['Requires immediate medical evaluation'],
      recommendations: {
        medicines: [],
        homeRemedies: [],
        whatToDo: [
          'Call emergency services immediately (112 in India)',
          'Stay calm and do not panic',
          'Have someone stay with you',
          'Keep airways clear',
        ],
        whatNotToDo: ['Do not drive yourself to the hospital', 'Do not delay seeking help', 'Do not take any medication without medical supervision'],
        dietaryAdvice: [],
        doctorSpecialization: 'Emergency Medicine',
        emergencyContacts: [
          { service: 'Emergency', number: '112', description: 'India Emergency Number' },
          { service: 'Ambulance', number: '102', description: 'National Ambulance Service' },
          { service: 'AIIMS Emergency', number: '011-26588500', description: 'AIIMS Hospital Delhi' },
        ],
      },
      followUpAdvice: 'Seek immediate emergency medical care. Do not wait.',
      confidenceScore: 0.7,
      disclaimer:
        'This is an educational tool only and not medical advice. Please seek immediate medical attention.',
    };
  }

  return {
    triageLevel: 'see-doctor',
    triageReason:
      'Based on the symptoms provided, we recommend consulting a healthcare professional for proper evaluation. The AI service is temporarily unavailable.',
    possibleConditions: ['Requires professional medical evaluation'],
    recommendations: {
      medicines: [],
      homeRemedies: ['Rest adequately', 'Stay hydrated with water and clear fluids', 'Monitor your symptoms closely'],
      whatToDo: [
        'Schedule an appointment with a doctor within 24-48 hours',
        'Keep track of your symptoms in a diary',
        'Note any changes or new symptoms',
        'Take your temperature if you have fever',
      ],
      whatNotToDo: ['Do not self-medicate without professional advice', 'Do not ignore worsening symptoms', 'Do not delay if symptoms worsen'],
      dietaryAdvice: ['Eat light, easily digestible foods', 'Avoid spicy and oily foods', 'Stay hydrated'],
      doctorSpecialization: 'General Physician',
      emergencyContacts: [
        { service: 'Emergency', number: '112', description: 'India Emergency Number' },
      ],
    },
    followUpAdvice: 'If symptoms worsen or new symptoms appear, seek medical attention immediately.',
    confidenceScore: 0.5,
    disclaimer:
      'This is an educational tool only and not medical advice. Always consult healthcare professionals. AI service was unavailable, showing default guidance.',
  };
}

export async function analyzeSymptoms(symptoms) {
  try {
    console.log('🏥 Starting symptom analysis...');
    console.log('📋 Symptoms:', JSON.stringify(symptoms, null, 2));
    
    // Try Grok API
    const result = await analyzeWithGrok(symptoms);
    if (result) {
      console.log('✅ Returning Grok AI analysis');
      return result;
    }

    // Fallback response if API fails
    console.log('⚠️ Using fallback response (API unavailable)');
    return getFallbackResponse(symptoms);
  } catch (error) {
    console.error('❌ AI analysis error:', error);
    return getFallbackResponse(symptoms);
  }
}
