import React, { useState } from 'react';
import ImageUpload from './components/ImageUpload';  // Ensure this is the correct path
import Quiz from './components/Quiz';  // Import the Quiz component

const App = () => {
    const [quizData, setQuizData] = useState([]);
    const [detectedText, setDetectedText] = useState('');
    const [processedText, setProcessedText] = useState('');
    const [loading, setLoading] = useState(false);

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

        // Split each line by the '=' sign to create pairs
        const quizPairs = lines.map(line => {
            const [german, swedish] = line.split('=').map(part => part.trim());
            return { german, swedish };
        });

        setQuizData(quizPairs);  // Store the quiz pairs
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
                            <Quiz phrases={quizData} />  {/* Pass quizData to the Quiz component */}
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
