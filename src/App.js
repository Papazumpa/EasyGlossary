import React, { useState } from 'react';
import ImageUpload from './components/ImageUpload'; // Make sure this is the correct path

const App = () => {
    const [quizData, setQuizData] = useState([]);
    const [detectedText, setDetectedText] = useState('');
    const [processedText, setProcessedText] = useState('');
    const [loading, setLoading] = useState(false);

    // Function to call OpenAI API
    const callOpenAIAPI = async (text) => {
        setLoading(true);

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,  // API key from .env
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful assistant that helps with language correction and glossary term matching.',
                        },
                        {
                            role: 'user',
                            content: `Please correct spelling errors and remove any irrelevant text from this OCR output, then group terms as pairs: ${text}`,
                        },
                    ],
                }),
            });

            const data = await response.json();
            const correctedText = data.choices[0].message.content;
            setProcessedText(correctedText);
            processText(correctedText);  // Call to the function to group into pairs after processing

            setLoading(false);
        } catch (error) {
            console.error('Error calling OpenAI API:', error);
            setLoading(false);
        }
    };

    // Function to process text after it's returned from OpenAI
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
                callOpenAIAPI(text);  // Send detected text to OpenAI API
            }} />

            <h2>Detected Text</h2>
            <pre>{detectedText}</pre>

            {loading ? <p>Loading...</p> : (
                <>
                    <h2>Processed Text (Corrected & Paired)</h2>
                    <pre>{processedText}</pre>

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
                </>
            )}
        </div>
    );
};

export default App;
