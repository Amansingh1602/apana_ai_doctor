import express from 'express';
import { chatWithAI } from '../services/aiService.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await chatWithAI(message, history || []);
    
    res.json({ reply: response });
  } catch (error) {
    console.error("Chat Route Error:", error);
    res.status(500).json({ error: "Failed to process chat" });
  }
});

export default router;
