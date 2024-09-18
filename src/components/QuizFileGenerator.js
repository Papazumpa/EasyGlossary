import React, { useState, useEffect } from 'react';
import { saveQuiz, getAllQuizzes } from '../utils/indexedDB'; // Adjust the path based on your project structure

// Utility function to generate a random ID
const generateQuizId = () => {
    return `quiz_${Math.random().toString(36).substr(2, 9)}`;
};

const QuizFileGenerator = ({ quizTitle, languageOne, languageTwo, quizData, userId }) => {
    const [savedQuizzes, setSavedQuizzes] = useState([]);

    useEffect(() => {
        loadSavedQuizzes();
    }, []);

    const loadSavedQuizzes = async () => {
        try {
            const quizzes = await getAllQuizzes();
            setSavedQuizzes(quizzes);
        } catch (error) {
            console.error('Error loading saved quizzes:', error);
            // Handle error as needed
        }
    };

    const handleDownload = () => {
        // Create quiz metadata object
        const quizFileData = {
            quizId: generateQuizId(),
            quizTitle: quizTitle || 'Untitled Quiz',
            userId: userId || 'Guest User',
            languageOne: languageOne,
            languageTwo: languageTwo,
            quizData: quizData.filter(pair => 
                pair.phraseOne && pair.phraseTwo // Filter out invalid phrases
            )
        };

        // Create a downloadable file blob
        const fileData = new Blob([JSON.stringify(quizFileData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(fileData);

        // Create a link and trigger a download
        const link = document.createElement('a');
        link.href = url;
        link.download = `${quizTitle || 'quiz'}_${quizFileData.quizId}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleSaveLocal = async () => {
        try {
            // Create quiz object for saving
            const quizToSave = {
                quizId: generateQuizId(),
                quizTitle: quizTitle || 'Untitled Quiz',
                userId: userId || 'Guest User',
                languageOne: languageOne,
                languageTwo: languageTwo,
                quizData: quizData.filter(pair => 
                    pair.phraseOne && pair.phraseTwo // Filter out invalid phrases
                )
            };

            // Save quiz to IndexedDB
            await saveQuiz(quizToSave);
            console.log('Quiz saved locally.');

            // Reload saved quizzes
            loadSavedQuizzes();
        } catch (error) {
            console.error('Failed to save quiz locally:', error);
            // Handle error as needed
        }
    };

    return (
        <div>
            <button onClick={handleDownload}>
                Download Quiz File
            </button>
            <button onClick={handleSaveLocal}>
                Save Locally
            </button>

            {/* Display saved quizzes */}
            {savedQuizzes.length > 0 && (
                <div>
                    <h2>Saved Quizzes:</h2>
                    <ul>
                        {savedQuizzes.map(quiz => (
                            <li key={quiz.quizId}>
                                <p>Title: {quiz.quizTitle}</p>
                                <p>User: {quiz.userId}</p>
                                {/* Add more details as needed */}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default QuizFileGenerator;
