import express from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Mock Database of verified doctors/hospitals in India
// In a real app, this would be a MongoDB collection with Geospatial indexing
const DOCTOR_DATABASE = [
  {
    id: 'd1',
    name: 'Dr. Rajesh Kumar',
    specialty: 'Cardiologist',
    hospital: 'Fortis Escorts Heart Institute',
    city: 'Delhi',
    experience: '15 years',
    rating: 4.8,
    contact: '+91-11-4713-3333',
    address: 'Okhla Road, New Delhi'
  },
  {
    id: 'd2',
    name: 'Dr. Priya Sharma',
    specialty: 'Dermatologist',
    hospital: 'Skin & Hair Clinic',
    city: 'Mumbai',
    experience: '10 years',
    rating: 4.6,
    contact: '+91-22-2600-1234',
    address: 'Bandra West, Mumbai'
  },
  {
    id: 'd3',
    name: 'Dr. Suresh Patil',
    specialty: 'General Physician',
    hospital: 'Apollo Hospitals',
    city: 'Bangalore',
    experience: '20 years',
    rating: 4.9,
    contact: '+91-80-2030-4050',
    address: 'Bannerghatta Road, Bangalore'
  },
  {
    id: 'd4',
    name: 'Dr. Anjali Desai',
    specialty: 'Pediatrician',
    hospital: 'Rainbow Children\'s Hospital',
    city: 'Hyderabad',
    experience: '12 years',
    rating: 4.7,
    contact: '+91-40-4466-5555',
    address: 'Banjara Hills, Hyderabad'
  },
  {
    id: 'd5',
    name: 'Dr. Amit Verma',
    specialty: 'Orthopedic',
    hospital: 'Max Super Speciality Hospital',
    city: 'Delhi',
    experience: '18 years',
    rating: 4.5,
    contact: '+91-11-2651-5050',
    address: 'Saket, New Delhi'
  },
  {
    id: 'd6',
    name: 'Dr. Meera Iyer',
    specialty: 'Gynecologist',
    hospital: 'Cloudnine Hospital',
    city: 'Chennai',
    experience: '14 years',
    rating: 4.8,
    contact: '+91-44-4200-2222',
    address: 'T Nagar, Chennai'
  },
  // Generic Fallbacks per city if no specific match
  {
    id: 'h1',
    name: 'All India Institute of Medical Sciences (AIIMS)',
    specialty: 'Multi-Specialty',
    hospital: 'AIIMS',
    city: 'Delhi',
    experience: 'Premier Institute',
    rating: 5.0,
    contact: '011-26588500',
    address: 'Ansari Nagar, New Delhi'
  },
  {
    id: 'h2',
    name: 'Lilavati Hospital',
    specialty: 'Multi-Specialty',
    hospital: 'Lilavati Hospital',
    city: 'Mumbai',
    experience: 'Trusted',
    rating: 4.7,
    contact: '022-26751000',
    address: 'Bandra, Mumbai'
  }
];

/**
 * @route   GET /api/doctors/search
 * @desc    Search for doctors by city and specialty
 * @access  Private
 */
router.get('/search', authMiddleware, (req, res) => {
  try {
    const { city, specialty } = req.query;
    
    // Normalize inputs
    const searchCity = city ? city.toLowerCase().trim() : '';
    const searchSpecialty = specialty ? specialty.toLowerCase().trim() : '';

    let results = DOCTOR_DATABASE;

    // Filter by City (loose matching)
    if (searchCity) {
      results = results.filter(doc => doc.city.toLowerCase().includes(searchCity));
    }

    // Filter by Specialty
    // We also include Multi-Specialty hospitals as fallbacks
    if (searchSpecialty) {
      results = results.filter(doc => 
        doc.specialty.toLowerCase().includes(searchSpecialty) || 
        doc.specialty === 'Multi-Specialty'
      );
    }

    // If no results found for specific city, return top hospitals
    if (results.length === 0) {
        return res.json({
            recommended: [],
            message: `No specific doctors found in ${city} for ${specialty}. Recommended visiting nearest large hospital.`
        });
    }

    res.json({ recommended: results });

  } catch (error) {
    console.error('Doctor Search Error:', error);
    res.status(500).json({ error: 'Failed to search doctors' });
  }
});

export default router;
