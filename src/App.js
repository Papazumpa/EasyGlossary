import React, { useState } from 'react';
import ImageUpload from './components/ImageUpload'; // Ensure this is the correct path

const App = () => {
    const [quizData, setQuizData] = useState([]);
    const [detectedText, setDetectedText] = useState('');
    const [processedText, setProcessedText] = useState('');
    const [loading, setLoading] = useState(false);

    // Function to call Cohere API
    const callCohereAPI = async (text) => {
        setLoading(true);

        try {
            const response = await fetch('/api/cohere', {  // Use the new API route
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            const correctedText = data.result;
            setProcessedText(correctedText);
            processText(correctedText);  // Call to the function to group into pairs after processing

            setLoading(false);
        } catch (error) {
            console.error('Error calling Cohere API:', error);
            setLoading(false);
        }
    };

    // Function to process text after it's returned from Cohere
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

    return (
        <div>
            <h1>Image to Quiz</h1>
            <ImageUpload onTextDetected={(text) => {
                setDetectedText(text);
                callCohereAPI(text);  // Send detected text to Cohere API
            }} />

            <h2>Detected Text</h2>
            <pre>{detectedText}</pre>

            {loading ? <p>Loading...</p> : (
                <>
                    <h2>Processed Text (Corrected & Paired)</h2>
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
                </>
            )}
        </div>
    );
};

export default App;
