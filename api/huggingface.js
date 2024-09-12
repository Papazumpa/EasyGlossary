// api/huggingface.js

const axios = require("axios");

export default async function handler(req, res) {
    const { text } = req.body;

    try {
        // Step 1: Text Correction
        let correctedText = await processWithModel(text, 't5-base');
        
        // Step 2: Term Pairing
        let termsDefs = await processWithModel(correctedText, 'marianmt-model'); // Replace with the appropriate model

        res.status(200).json({ termsDefs });
    } catch (error) {
        res.status(500).json({ error: 'API request failed' });
    }
}

const processWithModel = async (text, model) => {
    const options = {
        method: 'POST',
        url: `https://api-inference.huggingface.co/models/${model}`,
        headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
        },
        data: { inputs: text },
    };

    const response = await axios(options);
    return response.data;
};
