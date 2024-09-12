// api/openai.js

const axios = require("axios");

export default async function handler(req, res) {
    const ocrText = req.body.text;

    const options = {
        method: 'POST',
        url: 'https://api.openai.com/v1/chat/completions',
        headers: {
            'Authorization': `Bearer sk-svcacct-ePqrbTQNVBjuxvQN6bp2M05pJ1qubKFwtq3oOK3gFcvrD8jlSL-0hMY4-HRjJXTzZT3BlbkFJeTtHu3kUQZllXWawBmycQDC3a2hj57-Yo9TKA1MiR_1-Q6Gw83-Jg-QHEuMEqNVAA`, // Add your API key to an environment variable
            'Content-Type': 'application/json',
        },
        data: {
            model: 'gpt-3.5-turbo',  // Model selection
            messages: [
                { role: 'system', content: 'You are a helpful assistant that processes and corrects text.' },
                { role: 'user', content: `Correct and align this glossary text: ${ocrText}` }
            ],
            max_tokens: 1000 // Limit as necessary
        }
    };

    try {
        const response = await axios(options);
        res.status(200).json({ result: response.data.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ error: 'API request failed', details: error.message });
    }
}
