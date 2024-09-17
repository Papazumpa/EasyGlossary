import React, { useState } from 'react';
import ImageUpload from './components/ImageUpload'; // Ensure the path is correct

const UploadPage = () => {
    const [detectedText, setDetectedText] = useState('');
    const [processedText, setProcessedText] = useState('');
    const [loading, setLoading] = useState(false);
    const [quizData, setQuizData] = useState([]);
    const [languageOne, setLanguageOne] = useState('');
    const [languageTwo, setLanguageTwo] = useState('');
    const [l1Title, setL1Title] = useState('');
    const [l2Title, setL2Title] = useState('');

    // Function to handle API calls and processing
    const callCohereAPI = async (text) => {
        setLoading(true);
        try {
            // Replace with actual API call
            // const response = await fetch('YOUR_API_URL', { method: 'POST', body: JSON.stringify({ text }) });
            // const data = await response.json();
            // setProcessedText(data.text);
            // Update quiz data, titles, and languages as needed
        } catch (error) {
            console.error('Error calling API:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle detected text from OCR
    const handleTextDetected = (text) => {
        setDetectedText(text);
        callCohereAPI(text);
    };

    // Handle JSON data
    const handleJsonData = (jsonData) => {
        // Process the JSON data as needed
        const quizPairs = jsonData.map(item => ({
            phraseOne: item.phraseOne,
            phraseTwo: item.phraseTwo
        }));
        setQuizData(quizPairs);
        // Update language, titles, etc. based on JSON data
    };

    return (
        <div>
            <h1>Upload Image or JSON</h1>
            <ImageUpload 
                onTextDetected={handleTextDetected}
                onJsonData={handleJsonData}
            />
            <h2>Detected Text</h2>
            <pre>{detectedText}</pre>
            {loading ? <p>Loading...</p> : (
                <>
                    <h2>Processed Text</h2>
                    <pre>{processedText}</pre>
                    {quizData.length > 0 && (
                        <>
                            <h2>Generated Quiz</h2>
                            {/* Render quiz component with quizData */}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default UploadPage;
