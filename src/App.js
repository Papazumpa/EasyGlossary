import React, { useState } from 'react';
import ImageUpload from './components/ImageUpload';

const App = () => {
    const [quizData, setQuizData] = useState([]);
    const [detectedText, setDetectedText] = useState('');
    const [processedText, setProcessedText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const processText = async (text) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/huggingface', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            const responseText = await response.text();
            console.log("Raw API Response:", responseText);

            if (!response.ok) {
                throw new Error('Error response from API: ' + responseText);
            }

            let responseData;
            try {
                responseData = JSON.parse(responseText);
            } catch (parseError) {
                throw new Error('Failed to parse JSON response: ' + parseError.message);
            }

            // Assuming GPT-2 returns text directly
            setProcessedText(responseData.result ? responseData.result.generated_text : responseData.text);

            const lines = (responseData.result ? responseData.result.generated_text : responseData.text)
                .split('\n')
                .map(line => line.trim())
                .filter(Boolean);

            // Group lines into pairs
            const quizPairs = [];
            for (let i = 0; i < lines.length; i += 2) {
                if (lines[i + 1]) {
                    quizPairs.push({ term: lines[i], definition: lines[i + 1] });
                }
            }

            setQuizData(quizPairs);
        } catch (error) {
            setError('Error processing text: ' + error.message);
            console.error('Error details:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Image to Quiz</h1>
            <ImageUpload onTextDetected={(text) => {
                setDetectedText(text);
                processText(text);
            }} />

            <h2>Detected Text</h2>
            <pre>{detectedText}</pre>

            {loading && <p>Processing...</p>}
            {error && <p>Error: {error}</p>}

            <h2>Processed Text</h2>
            <pre>{processedText}</pre>

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
