const analyzeComplaintHelper = async (title, description, category) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === 'dummy_key_for_build' || apiKey.startsWith('AIzaSy')) {
    throw new Error('OPENROUTER_API_KEY is not configured or has an invalid format');
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
    throw new Error(`OpenRouter API responded with status ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.trim();
  
  if (!text) {
    throw new Error("No response content from OpenRouter");
  }

  // Extract JSON from response if it has markdown formatting
  let jsonStr = text;
  if (text.includes('```json')) {
    jsonStr = text.split('```json')[1].split('```')[0].trim();
  } else if (text.includes('```')) {
    jsonStr = text.split('```')[1].split('```')[0].trim();
  }
  
  return JSON.parse(jsonStr);
};

module.exports = { analyzeComplaintHelper };
