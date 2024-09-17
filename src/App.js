import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; 
import ImageUpload from './components/ImageUpload'; 
import Quiz from './components/Quiz'; 
import HomePage from './pages/HomePage'; 
import AboutPage from './pages/AboutPage'; 
import QuizPage from './pages/QuizPage';

const App = () => {
    const [quizData, setQuizData] = useState([]);
    const [detectedText, setDetectedText] = useState('');
    const [processedText, setProcessedText] = useState('');
    const [loading, setLoading] = useState(false);
    const [languageOne, setLanguageOne] = useState('');
    const [languageTwo, setLanguageTwo] = useState('');
    const [l1Title, setL1Title] = useState('');
    const [l2Title, setL2Title] = useState('');

    const callCohereAPI = async (ocrOutput) => {
        setLoading(true);

        try {
            const response = await fetch('/api/cohere', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ocrOutput })
            });

            const data = await response.json();
            const correctedText = data.result;
            setProcessedText(correctedText);
            processText(correctedText);

            setLoading(false);
        } catch (error) {
            console.error('Error calling Cohere API:', error);
            setLoading(false);
        }
    };

    const processText = (text) => {
        const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
        const specialLines = {
            languageOne: '',
            languageTwo: '',
            l1Title: '',
            l2Title: ''
        };

        const quizPairs = lines.map(line => {
            if (line.includes('language one =')) {
                specialLines.languageOne = line.split('=')[1].trim();
                return null;
            }
            if (line.includes('language two =')) {
                specialLines.languageTwo = line.split('=')[1].trim();
                return null;
            }
            if (line.includes('l1 title =')) {
                specialLines.l1Title = line.split('=')[1].trim();
                return null;
            }
            if (line.includes('l2 title =')) {
                specialLines.l2Title = line.split('=')[1].trim();
                return null;
            }
            return line.split('=').map(term => term.trim());
        }).filter(Boolean);

        setLanguageOne(specialLines.languageOne);
        setLanguageTwo(specialLines.languageTwo);
        setL1Title(specialLines.l1Title);
        setL2Title(specialLines.l2Title);
        setQuizData(quizPairs);
    };

    const handleJsonData = (jsonData) => {
        console.log('Received JSON data:', jsonData);
        // Process JSON data to extract quiz information
        // You might need to adapt this part based on your specific JSON structure
    };

    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/quiz/:id" element={<QuizPage quizData={quizData} />} />
            </Routes>
            <ImageUpload
                onTextDetected={(text) => callCohereAPI(text)}
                onJsonData={handleJsonData} // Handle JSON data
            />
        </Router>
    );
};

export default App;
