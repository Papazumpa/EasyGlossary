import React, { useState } from 'react';
import ImageUpload from './components/ImageUpload'; // Ensure correct path

const App = () => {
    const [detectedText, setDetectedText] = useState('');
    const [processedText, setProcessedText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Function to call mBART API
    const callMBartAPI = async (text) => {
    setLoading(true);
    setError(''); // Reset any previous errors
    try {
        const response = await fetch('/api/huggingface', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });

        // Log the raw response text for debugging
        const responseText = await response.text();
        console.log("Raw response text:", responseText);

        // Attempt to parse the response text as JSON
        const data = JSON.parse(responseText);
        console.log("mBART API Response:", data);
        setProcessedText(data.result);
    } catch (error) {
        setError('Error calling mBART API: ' + error.message);
        console.error('Error details:', error);
    } finally {
        setLoading(false);
    }
};


    return (
        <div>
            <h1>Image to Text Processing</h1>
            <ImageUpload onTextDetected={(text) => {
                setDetectedText(text);
                callMBartAPI(text);
            }} />

            <h2>Detected Text</h2>
            <pre>{detectedText}</pre>

            <h2>Processed Text</h2>
            {loading ? <p>Loading...</p> : <pre>{processedText}</pre>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default App;
