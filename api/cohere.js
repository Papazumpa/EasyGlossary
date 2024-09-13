import cohere from 'cohere-ai';

cohere.configure({ apiKey: process.env.COHERE_API_KEY });  // Configure with your API key

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { text } = req.body;

        try {
            const response = await cohere.generate({
                model: 'command-r-plus-08-2024',  // Choose the model based on your requirements
                prompt: `Correct and align this glossary text: ${text}`,
                max_tokens: 1000,  // Adjust as needed
            });

            const correctedText = response.body.generations[0].text;
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
