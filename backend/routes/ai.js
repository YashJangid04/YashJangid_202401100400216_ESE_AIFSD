const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// AI Complaint Analyzer using OpenRouter
router.post('/analyze', auth, async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey || apiKey === 'dummy_key_for_build' || apiKey.startsWith('AIzaSy')) {
      return res.status(400).json({ message: 'OPENROUTER_API_KEY is not configured in .env' });
    }

    const prompt = `
      Analyze the following complaint and return a JSON object with the following fields:
      - priority: "High", "Medium", or "Low" based on the urgency.
      - department: The suggested responsible department.
      - summary: A brief 1-2 sentence summary of the complaint.
      - autoResponse: A polite auto-generated response message for the user.
      
      Complaint Title: ${title}
      Complaint Description: ${description}
      Complaint Category: ${category}
      
      Respond ONLY with valid JSON. Do not include markdown code block styling or any other text.
    `;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5000",
        "X-Title": "Smart Complaint Management System"
      },
      body: JSON.stringify({
        "model": "openrouter/free",
        "messages": [
          {
            "role": "user",
            "content": prompt
          }
        ]
      })
    });

    if (!response.ok) {
      return res.status(response.status).json({ message: `OpenRouter API responded with status ${response.status}` });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    
    if (!text) {
      return res.status(500).json({ message: "No response content from OpenRouter" });
    }

    // Extract JSON from response if it has markdown formatting
    let jsonStr = text;
    if (text.includes('```json')) {
      jsonStr = text.split('```json')[1].split('```')[0].trim();
    } else if (text.includes('```')) {
      jsonStr = text.split('```')[1].split('```')[0].trim();
    }
    
    const analysis = JSON.parse(jsonStr);
    res.json(analysis);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Error analyzing complaint with AI' });
  }
});

module.exports = router;
