const fetch = require('node-fetch');

export default async function handler(req, res) {
    const { text } = req.body;

    try {
        const response = await fetch('https://api-inference.huggingface.co/models/facebook/mbart-large-50', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: `Please process the following text by:
1. Correcting any spelling and formatting errors.
2. Removing any text that does not have a corresponding term.
3. Grouping the remaining terms into pairs, where each term is paired with its corresponding definition.

Here is the text to process:\n\n${text}`
            }),
        });

        // Check if the response is OK
        if (!response.ok) {
            const error = await response.text();
            console.error('API request failed:', error);
            return res.status(response.status).json({ error: 'API request failed', details: error });
        }

        const result = await response.json();
        console.log("API Response:", result);
        res.status(200).json({ result });
    } catch (error) {
        console.error('Error calling Hugging Face API:', error);
        res.status(500).json({ error: 'Error calling Hugging Face API', details: error.message });
    }
}
