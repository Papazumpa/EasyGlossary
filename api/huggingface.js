const fetch = require('node-fetch');

export default async function handler(req, res) {
    const { text } = req.body;

    try {
        const response = await fetch('https://api-inference.huggingface.co/models/gpt2', {
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

        const rawText = await response.text();
        console.log("Raw API Response:", rawText);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} - ${rawText}`);
        }

        try {
            const result = JSON.parse(rawText);
            res.status(200).json({ result });
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            res.status(500).json({ error: 'Error parsing JSON', details: rawText });
        }
    } catch (error) {
        console.error('Error calling Hugging Face API:', error);
        res.status(500).json({ error: 'Error calling Hugging Face
