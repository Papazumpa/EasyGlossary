// api/huggingface.js

const axios = require("axios");

export default async function handler(req, res) {
  const ocrText = req.body.text;

  const options = {
    method: 'POST',
    url: 'https://api-inference.huggingface.co/models/bert-base-multilingual-cased',
    headers: {
      Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    data: { inputs: ocrText },
  };

  try {
    const response = await axios(options);
    res.status(200).json({ result: response.data });
  } catch (error) {
    res.status(500).json({ error: 'API request failed' });
  }
}
