import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ImageUpload from './components/ImageUpload';
import Quiz from './components/Quiz';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import QuizPage from './pages/QuizPage';
import QuizFileGenerator from './components/QuizFileGenerator'; // Import the QuizFileGenerator component
import { getAllQuizzes } from './utils/indexedDB'; // Import the IndexedDB functions

const App = () => {
    const [quizData, setQuizData] = useState([]);
    const [detectedText, setDetectedText] = useState('');
    const [processedText, setProcessedText] = useState('');
    const [loading, setLoading] = useState(false);
    const [languageOne, setLanguageOne] = useState('');
    const [languageTwo, setLanguageTwo] = useState('');
    const [l1Title, setL1Title] = useState('');
    const [l2Title, setL2Title] = useState('');
    const [savedQuizzes, setSavedQuizzes] = useState([]); // State to hold saved quizzes

    useEffect(() => {
        // Load saved quizzes when component mounts
        loadSavedQuizzes();
    }, []);

    const loadSavedQuizzes = async () => {
        try {
            // Fetch all saved quizzes from IndexedDB
            const quizzes = await getAllQuizzes();
            setSavedQuizzes(quizzes);
        } catch (error) {
            console.error('Error loading saved quizzes:', error);
            // Handle error as needed
        }
    };

    const callCohereAPI = async (ocrOutput) => {
        setLoading(true);

        try {
            // Simulate API call
            // Replace with your actual API call logic
            setTimeout(() => {
                const correctedText = ocrOutput.toUpperCase(); // Example processing
                setProcessedText(correctedText);
                processText(correctedText);
                setLoading(false);
            }, 1000);
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
                    return { phraseOne, phraseTwo: userResponse.trim() };
                } else {
                    return null;
                }
            }

            return { phraseOne, phraseTwo };
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
        const quizPairs = jsonData.quizData.map(item => {
            const { phraseOne, phraseTwo } = item;
            return { phraseOne, phraseTwo };
        });
        setQuizData(quizPairs);
        setLanguageOne(jsonData.languageOne);
        setLanguageTwo(jsonData.languageTwo);
        setL1Title(jsonData.quizTitle); // Set title from JSON data
        setL2Title(jsonData.quizTitle); // Assuming the title is the same for both languages or adjust as needed
    };

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                      <>
                            <UploadPage
                                setDetectedText={setDetectedText}
                                callCohereAPI={callCohereAPI}
                                detectedText={detectedText}
                                loading={loading}
                                processedText={processedText}
                                quizData={quizData}
                                languageOne={languageOne}
                                languageTwo={languageTwo}
                                l1Title={l1Title}
                                l2Title={l2Title}
                                onJsonData={handleJsonData} // Pass JSON handler
                            />
                        </>
                    }
                />
                <Route path="/home" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/quiz/:quizName" element={<QuizPage quizData={quizData} />} />

                {/* Route for QuizFileGenerator */}
                <Route
                    path="/saved-quizzes"
                    element={<QuizFileGenerator savedQuizzes={savedQuizzes} />} // Pass saved quizzes to QuizFileGenerator
                />
            </Routes>
        </Router>
    );
};

const UploadPage = ({
    setDetectedText,
    callCohereAPI,
    detectedText,
    loading,
    processedText,
    quizData,
    languageOne,
    languageTwo,
    l1Title,
    l2Title,
    onJsonData
}) => (
    <div>
        <h1>Image to Quiz</h1>
        <QuizFileGenerator savedQuizzes={savedQuizzes} /> {/* Display QuizFileGenerator */}
        <ImageUpload
            onTextDetected={(text) => {
                setDetectedText(text);
                callCohereAPI(text);
            }}
            onJsonData={onJsonData} // Pass JSON handler
        />
        <h2>Detected Text</h2>
        <pre>{detectedText}</pre>
        {loading ? <p>Loading...</p> : (
            <>
                <h2>Processed Text</h2>
                <pre>{processedText}</pre>
                {quizData.length > 0 ? (
                    <>
                        <h2>Generated Quiz</h2>
                        <Quiz
                            phrases={quizData}
                            languageOne={languageOne}
                            languageTwo={languageTwo}
                            l1Title={l1Title}
                            l2Title={l2Title}
                        />
                    </>
                ) : <p>No quiz generated yet.</p>}
            </>
        )}
    </div>
);

export default App;
