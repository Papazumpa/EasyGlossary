// api/huggingface.js

const axios = require('axios');

export default async function handler(req, res) {
    const { text } = req.body;

    try {
        const response = await axios.post('https://api-inference.huggingface.co/models/facebook/mbart-large-50', {
            inputs: `Please process the following text by:
1. Correcting any spelling and formatting errors.
2. Removing any text that does not have a corresponding term.
3. Grouping the remaining terms into pairs, where each term is paired with its corresponding definition.

Here is the text to process:
\n\n${text}`,
            parameters: {
                "max_length": 1024, // Increase max_length to handle longer texts if needed
                "return_dict": true,
                "do_sample": false,
            },
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        res.status(200).json({ result: response.data[0].generated_text });
    } catch (error) {
        res.status(500).json({ error: 'API request failed' });
    }
}
