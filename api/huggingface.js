// api/huggingface.js

const axios = require('axios');

export default async function handler(req, res) {
    const { text } = req.body;

    try {
        const response = await axios.post('https://api-inference.huggingface.co/models/facebook/mbart-large-50', {
            inputs: text,
            parameters: {
                "max_length": 512,
                "return_dict": true,
                "do_sample": false,
            },
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        res.status(200).json({ result: response.data });
    } catch (error) {
        res.status(500).json({ error: 'API request failed' });
    }
}
