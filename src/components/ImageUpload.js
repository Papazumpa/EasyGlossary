import React, { useState } from 'react';

const ImageUpload = ({ onTextDetected }) => {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(URL.createObjectURL(file));
            processImage(file);
        }
    };

import React, { useState } from 'react';
import ImageUpload from './ImageUpload';

const App = () => {
    const [quizData, setQuizData] = useState([]);
    const [detectedText, setDetectedText] = useState('');

    const processText = (text) => {
        // Assuming text is in the form of alternating lines
        const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

        // Group lines into pairs (assuming each line corresponds to a term in one language)
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
