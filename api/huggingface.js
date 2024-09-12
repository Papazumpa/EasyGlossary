// api/huggingface.js

const axios = require("axios");

export default async function handler(req, res) {
    const { text } = req.body;

    try {
        // Step 1: Preprocess Text
        let cleanedText = preprocessText(text);

        // Step 2: Correct Text
        let correctedText = await correctText(cleanedText);

        // Step 3: Extract and Pair Terms
        let extractedTerms = await extractTerms(correctedText);

        // Step 4: Postprocess Terms
        let termsDefs = postprocessTerms(extractedTerms);

        res.status(200).json({ termsDefs });
    } catch (error) {
        res.status(500).json({ error: 'API request failed' });
    }
}

const preprocessText = (text) => {
    // Adjust regex as needed
    return text.replace(/Page \d+|Header Text|Another Unwanted Pattern/g, '').trim();
};

const correctText = async (text) => {
    const prompt = `Correct the spelling and formatting errors in the following text:\n\n${text}`;

    const options = {
        method: 'POST',
        url: `https://api-inference.huggingface.co/models/t5-base`,
        headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
        },
        data: { inputs: prompt },
    };

    const response = await axios(options);
    return response.data;
};

const extractTerms = async (text) => {
    const prompt = `Extract and pair terms and definitions from the following text:\n\n${text}`;

    const options = {
        method: 'POST',
        url: `https://api-inference.huggingface.co/models/marianmt-model`,
        headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
        },
        data: { inputs: prompt },
    };

    const response = await axios(options);
    return response.data;
};

const postprocessTerms = (terms) => {
    return terms.filter(pair => pair.term && pair.definition);
};
