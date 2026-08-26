import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  // CORS headers if needed
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured.");
    }
    
    const ai = new GoogleGenAI({ apiKey });
    
    // Fallbacks in case req.body is undefined or not parsed
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const prompt = body.prompt || "";
    const history = body.history || [];
    
    const contents = history
      .filter((msg: any) => msg.content && msg.content !== 'Hello! I am the AGRI-STAT AI assistant. How can I help you understand the food security data today?')
      .map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));
      
    if (prompt) {
      contents.push({ role: 'user', parts: [{ text: prompt }] });
    } else if (contents.length === 0) {
      return res.status(400).json({ error: "No prompt provided" });
    }
    
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: contents,
      config: {
        systemInstruction: "You are an AI assistant for AGRI-STAT, a dashboard analyzing agricultural food security and carrying capacity in the Philippines. You help users understand the data, which includes population, rice yield, land gaps, and carrying capacity ratios. Be helpful, concise, and knowledgeable about food security concepts.",
      },
    });

    res.status(200).json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "An error occurred while generating the response" });
  }
}
