import { CohereClient } from 'cohere-ai';

const client = new CohereClient({ token: process.env.COHERE_API_KEY });

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { ocrOutput } = req.body;

        if (!ocrOutput) {
            return res.status(400).json({ error: 'No OCR output provided' });
        }

        try {
            const response = await client.chat({
                message: `Please correct spelling errors and remove any irrelevant text from this OCR output. I need the phrases paired next to each other, with the first languages phrase on the left and the corresponding second languages phrase on the right separated by a equals-sign = and every pair on a new line (example output: hello,Bonjour (new line) nice meeting you,Plaisir de vous rencontrer (new line) etc.). If a phrase is missing in one language, please leave the missing side blank. in the end you should add four more phrases (which will act as values) : language one (which should be equal to the language used on the right side) and languge two (which should be equal to the language used on the left side) also add the values: l1 title and l2 title which should describe the terms topic in one sentance like(example: greetings and Formules de politesse)  Here is the input text: ${ocrOutput}`,
                model: 'command-r-plus-08-2024',
                preamble: 'You are a helpful assistant that helps with language correction and glossary phrase matching.'
            });

            // Log the entire response to understand its structure
            console.log('API Response:', response);

            // Check the structure of the response and adjust extraction accordingly
            const correctedText = response.text || 'No text returned';
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
