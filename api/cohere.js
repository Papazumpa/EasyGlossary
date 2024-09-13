const { CohereClient } = require('cohere-ai');

// Initialize the CohereClient with your API key
const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY,  // Use environment variable for API key
});

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { text } = req.body;

        try {
            // Generate response from Cohere
            const response = await cohere.chat({
                message: `Correct and align this glossary text: ${text}`,
            });

            // Extract corrected text from response
            const correctedText = response.body.choices[0].message.text;

            res.status(200).json({ result: correctedText });
        } catch (error) {
            console.error('Error calling Cohere API:', error);
            res.status(500).json({ error: 'API request failed', details: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
