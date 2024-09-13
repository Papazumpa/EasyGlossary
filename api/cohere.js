// api/cohere.js

const axios = require("axios");

export default async function handler(req, res) {
    const ocrText = req.body.text;

    const options = {
        method: 'POST',
        url: 'https://api.cohere.ai/generate',
        headers: {
            'Authorization': `Bearer ${process.env.COHERE_API_KEY}`, // Use your environment variable for Cohere API key
            'Content-Type': 'application/json',
        },
        data: {
            model: 'command-xlarge-2023',  // Cohere model selection
            prompt: `Correct and align this glossary text: ${ocrText}`,
            max_tokens: 1000,  // Limit as necessary
            temperature: 0.7  // Adjust the creativity level
        }
    };

    try {
        const response = await axios(options);
        res.status(200).json({ result: response.data.generations[0].text });
    } catch (error) {
        res.status(500).json({ error: 'API request failed', details: error.message });
    }
}
