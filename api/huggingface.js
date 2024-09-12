import React, { useState } from 'react';
import ImageUpload from './components/ImageUpload'; // Ensure correct path

const App = () => {
    const [quizData, setQuizData] = useState([]);
    const [detectedText, setDetectedText] = useState('');
    const [processedText, setProcessedText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Function to process text from OCR
    const processText = (text) => {
        console.log("Processing text:", text);
        const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

        // Group lines into pairs
        const quizPairs = [];
        for (let i = 0; i < lines.length; i += 2) {
            if (lines[i + 1]) {
                quizPairs.push({ term: lines[i], definition: lines[i + 1] });
            }
        }

        setQuizData(quizPairs);
    };

    // Function to call Hugging Face API with timeout
    const callHuggingFaceAPI = async (text) => {
        setLoading(true);
        setError(''); // Reset any previous errors
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

            const response = await fetch('/api/huggingface', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
                signal: controller.signal,
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log("Hugging Face API Response:", data);
            setProcessedText(JSON.stringify(data, null, 2));
            processText(data); // Use processed data for quiz generation if necessary
            clearTimeout(timeoutId);
        } catch (error) {
            if (error.name === 'AbortError') {
                setError('Request timed out');
            } else {
                setError('Error calling Hugging Face API: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Image to Quiz</h1>
            <ImageUpload onTextDetected={(text) => {
                setDetectedText(text);
                callHuggingFaceAPI(text);
            }} />

            <h2>Detected Text</h2>
            <pre>{detectedText}</pre>

            <h2>Processed Text</h2>
            {loading ? <p>Loading...</p> : <pre>{processedText}</pre>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <h2>Generated Quiz</h2>
            {quizData.length > 0 ? (
                <ul>
                    {quizData.map((pair, index) => (
                        <li key={index}>{pair.term} = {pair.definition}</li>
                    ))}
                </ul>
            ) : (
                <p>No quiz generated yet.</p>
            )}
        </div>
    );
};

export default App;
