import React, { useState } from 'react';
import ImageUpload from './components/ImageUpload';
import Quiz from './components/Quiz';

const App = () => {
    const [text1, setText1] = useState('');
    const [text2, setText2] = useState('');
    const [pairs, setPairs] = useState([]);
    const [showQuiz, setShowQuiz] = useState(false);

    const handleTextDetected = (text) => {
        if (!text1) {
            setText1(text);
        } else {
            setText2(text);
            const detectedPairs = createLanguagePairs(text1, text2);
            setPairs(detectedPairs);
            setShowQuiz(true);
        }
    };

    const createLanguagePairs = (text1, text2) => {
        const lines1 = text1.split('\n');
        const lines2 = text2.split('\n');
        const pairs = lines1.map((line, index) => ({ term: line, translation: lines2[index] })).filter(pair => pair.translation);
        return pairs;
    };

    return (
        <div>
            {!showQuiz ? (
                <div>
                    <h1>Upload Text Images</h1>
                    <ImageUpload onTextDetected={handleTextDetected} />
                </div>
            ) : (
                <Quiz pairs={pairs} />
            )}
        </div>
    );
};

export default App;
