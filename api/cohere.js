import { CohereClient } from 'cohere-ai';

const client = new CohereClient({ token: process.env.COHERE_API_KEY });

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { ocrOutput } = req.body;  // Get the OCR output from the request body

        try {
            const response = await client.chat({
                message: `Please correct spelling errors and remove any irrelevant text from this OCR output. Group phrases as pairs with the corresponding phrases for the two input languages. This is the input: ${ocrOutput}`,
                model: 'command-r-plus-08-2024',
                preamble: 'You are a helpful assistant that helps with language correction and glossary phrase matching.'
            });

            const correctedText = response.body.text;
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
