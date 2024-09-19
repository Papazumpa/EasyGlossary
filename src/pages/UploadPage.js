import React from 'react';
import ImageUpload from './ImageUpload';
import Quiz from './Quiz';
import { QuizFileGenerator } from './QuizFileGenerator'; // Import QuizFileGenerator

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
    onJsonData,
    savedQuizzes // Added savedQuizzes prop
}) => (
    <div>
        <h1>Saved Quizzes</h1>
        {savedQuizzes.length > 0 ? (
            <ul>
                {savedQuizzes.map((quiz, index) => (
                    <li key={index}>
                        {quiz.quizTitle} (ID: {quiz.quizId})
                    </li>
                ))}
            </ul>
        ) : (
            <p>No saved quizzes.</p>
        )}
        <h1>Image to Quiz</h1>
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

export default UploadPage;
