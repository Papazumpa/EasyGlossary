import React, { useState } from 'react';
import ImageUpload from './components/ImageUpload'; // Ensure the path is correct
import Quiz from './components/Quiz'; // Ensure the path is correct

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
}) => {
    return (
        <div>
            <h1>Upload Image</h1>
            <ImageUpload 
                onTextDetected={(text) => {
                    setDetectedText(text);
                    callCohereAPI(text);
                }}
                onJsonData={onJsonData} // Pass JSON handler to ImageUpload
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
};

export default UploadPage;
