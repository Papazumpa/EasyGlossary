import React, { useState } from 'react';
import ImageUpload from './components/ImageUpload'; // Ensure correct path

const App = () => {
    const [quizData, setQuizData] = useState([]);
    const [detectedText, setDetectedText] = useState('');
    const [correctedText, setCorrectedText] = useState(''); // New state for corrected text

    const processOCRText = async (text) => {
        setDetectedText(text);

        try {
            const response = await fetch('/api/openai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text })
            });
            const data = await response.json();
            setCorrectedText(data.result); // Store the corrected text
        } catch (error) {
            console.error('Error processing text:', error);
        }
    };

    return (
        <div>
            <h1>Image to Quiz</h1>
            <ImageUpload onTextDetected={(text) => processOCRText(text)} />

            <h2>Detected Text</h2>
            <pre>{detectedText}</pre>

            <h2>Corrected Text from GPT-3.5</h2>
            <pre>{correctedText}</pre>

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
