import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Import Router components
import ImageUpload from './components/ImageUpload';  // Image upload component
import Quiz from './components/Quiz';  // Quiz component
import HomePage from './pages/HomePage';  // Home page
import AboutPage from './pages/AboutPage';  // About page
import QuizPage from './pages/QuizPage';  // Quiz page for individual quizzes

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
                body: JSON.stringify({
                    ocrOutput: ocrOutput,
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

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

            const [phraseOne, phraseTwo] = line.split('=').map(part => part.trim());

            if (!phraseTwo) {
                const userResponse = window.prompt(`The corresponding phrase for "${phraseOne}" is missing. Enter one or leave empty to remove this line:`);
                if (userResponse) {
                    return { german: phraseOne, swedish: userResponse.trim() };
                } else {
                    return null;
                }
            }

            return { german: phraseOne, swedish: phraseTwo };
        }).filter(Boolean);

        setLanguageOne(specialLines.languageOne);
        setLanguageTwo(specialLines.languageTwo);
        setL1Title(specialLines.l1Title);
        setL2Title(specialLines.l2Title);
        setQuizData(quizPairs);
    };

    return (
        <Router>
            <Routes>
                <Route path="/" element={<UploadPage setDetectedText={setDetectedText} callCohereAPI={callCohereAPI} detectedText={detectedText} loading={loading} processedText={processedText} quizData={quizData} />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/quiz/:quizName" element={<QuizPage quizData={quizData} />} />
            </Routes>
        </Router>
    );
};

const UploadPage = ({ setDetectedText, callCohereAPI, detectedText, loading, processedText, quizData }) => (
    <div>
        <h1>Image to Quiz</h1>
        <ImageUpload onTextDetected={(text) => {
            setDetectedText(text);
            callCohereAPI(text);
        }} />
        <h2>Detected Text</h2>
        <pre>{detectedText}</pre>
        {loading ? <p>Loading...</p> : (
            <>
                <h2>Processed Text</h2>
                <pre>{processedText}</pre>
                {quizData.length > 0 ? (
                    <>
                        <h2>Generated Quiz</h2>
                        <Quiz phrases={quizData} />
                    </>
                ) : <p>No quiz generated yet.</p>}
            </>
        )}
    </div>
);

export default App;
