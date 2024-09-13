import cohere from 'cohere-ai';

cohere.init({ apiKey: process.env.COHERE_API_KEY }); // Initialize with your API key

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { message, chat_history, model = 'command-r-plus-08-2024' } = req.body;

        try {
            const response = await cohere.chat({
                messages: message,
                chat_history: chat_history || [], // Optional chat history
                model: model, // Optional model name
                stream: false, // Default to false
            });

            const reply = response.body.text;
            res.status(200).json({ result: reply });
        } catch (error) {
            console.error('Error calling Cohere API:', error);
            res.status(500).json({ error: 'API request failed', details: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
