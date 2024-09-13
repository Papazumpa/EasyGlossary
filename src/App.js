import React, { useState } from 'react';
import ImageUpload from './components/ImageUpload';  // Ensure this is the correct path
import Quiz from './components/Quiz';  // Import the Quiz component

const App = () => {
    const [quizData, setQuizData] = useState([]);
    const [detectedText, setDetectedText] = useState('');
    const [processedText, setProcessedText] = useState('');
    const [loading, setLoading] = useState(false);
    const [languageOne, setLanguageOne] = useState('');
    const [languageTwo, setLanguageTwo] = useState('');
    const [l1Title, setL1Title] = useState('');
    const [l2Title, setL2Title] = useState('');

    // Function to call Cohere API
    const callCohereAPI = async (ocrOutput) => {
        setLoading(true);

        try {
            const response = await fetch('/api/cohere', {  // Use the new API route
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ocrOutput: ocrOutput // Pass ocrOutput instead of text
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

        // Extract languageOne, languageTwo, l1Title, l2Title and remove them from the questions
const processText = (text) => {
    console.log("Processing text:", text);
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

    const specialLines = {
        languageOne: '',
        languageTwo: '',
        l1Title: '',
        l2Title: ''
    };

    const quizPairs = lines.map(line => {
        // Extract special lines
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

        // Split each line by the '=' sign to create pairs
        const [phraseOne, phraseTwo] = line.split('=').map(part => part.trim());

        // Check if either phrase is missing
        if (!phraseTwo) {
            // Prompt the user for input
            const userResponse = window.prompt(`The corresponding phrase for "${phraseOne}" is missing. Enter one or leave empty to remove this line:`);
            
            // If the user provided input, use it as the second phrase
            if (userResponse) {
                return { german: phraseOne, swedish: userResponse.trim() };
            } else {
                // If the user did not provide input, return null to remove the line
                return null;
            }
        }

        return { german: phraseOne, swedish: phraseTwo };
    }).filter(Boolean);  // Remove null values (lines without user input or empty pairs)

    // Set special values (language names and titles)
    setLanguageOne(specialLines.languageOne);
    setLanguageTwo(specialLines.languageTwo);
    setL1Title(specialLines.l1Title);
    setL2Title(specialLines.l2Title);

    // Set the quiz pairs
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

                    {quizData.length > 0 ? (
                        <>
                            <h2>Generated Quiz</h2>
                            {/* Pass quizData and language titles to the Quiz component */}
                            <Quiz
                                phrases={quizData}
                                languageOne={languageOne}
                                languageTwo={languageTwo}
                                l1Title={l1Title}
                                l2Title={l2Title}
                            />
                        </>
                    ) : (
                        <p>No quiz generated yet.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default App;
