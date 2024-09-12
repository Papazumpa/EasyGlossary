import React, { useState } from 'react';
import ImageUpload from './components/ImageUpload'; // Ensure correct path

const App = () => {
    const [quizData, setQuizData] = useState([]);
    const [detectedText, setDetectedText] = useState('');

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
                processText(text);
            }} />

            <h2>Detected Text</h2>
            <pre>{detectedText}</pre>

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
