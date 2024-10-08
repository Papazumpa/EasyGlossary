import React, { useState, useEffect } from 'react';
import { saveQuiz, getAllQuizzes, deleteQuizById } from '../utils/indexedDB';

const generateQuizId = () => {
    return `quiz_${Math.random().toString(36).substr(2, 9)}`;
};

const QuizFileGenerator = ({ quizTitle, languageOne, languageTwo, quizData, onJsonData }) => {
    const [savedQuizzes, setSavedQuizzes] = useState([]);

    useEffect(() => {
        loadSavedQuizzes();
        console.log('onJsonData type:', typeof onJsonData);
    }, [onJsonData]);

    const loadSavedQuizzes = async () => {
        try {
            const quizzes = await getAllQuizzes();
            setSavedQuizzes(quizzes);
        } catch (error) {
            console.error('Error loading saved quizzes:', error);
        }
    };

    const handleDownload = () => {
        const quizFileData = {
            quizId: generateQuizId(),
            quizTitle: quizTitle || 'Untitled Quiz',
            languageOne: languageOne,
            languageTwo: languageTwo,
            quizData: quizData.filter(pair => pair.phraseOne && pair.phraseTwo)
        };

        const fileData = new Blob([JSON.stringify(quizFileData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(fileData);

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
            const quizToSave = {
                quizId: generateQuizId(),
                quizTitle: quizTitle || 'Untitled Quiz',
                languageOne: languageOne,
                languageTwo: languageTwo,
                quizData: quizData.filter(pair => pair.phraseOne && pair.phraseTwo)
            };

            await saveQuiz(quizToSave);
            loadSavedQuizzes(); 
        } catch (error) {
            console.error('Failed to save quiz locally:', error);
        }
    };

    const handleDeleteQuiz = async (quizId) => {
        try {
            await deleteQuizById(quizId);
            loadSavedQuizzes(); 
        } catch (error) {
            console.error('Error deleting quiz:', error);
        }
    };

    const handleOpenQuiz = (quiz) => {
        const simulatedFileContent = new Blob([JSON.stringify(quiz)], { type: 'application/json' });

        const reader = new FileReader();
        reader.onload = (event) => {
            const fileContents = event.target.result;
            if (typeof onJsonData === 'function') {
                onJsonData(fileContents); 
            } else {
                console.error('onJsonData is not a function');
            }
        };
        reader.readAsText(simulatedFileContent);
    };

    return (
        <div>
            <button onClick={handleDownload}>Download Quiz File</button>
            <button onClick={handleSaveLocal}>Save Locally</button>

            {savedQuizzes.length > 0 && (
                <div>
                    <h2>Saved Quizzes:</h2>
                    <ul>
                        {savedQuizzes.map(quiz => (
                            <li key={quiz.quizId}>
                                <p>Title: {quiz.quizTitle}</p>
                                <button onClick={() => handleOpenQuiz(quiz)}>Open Quiz</button>
                                <button onClick={() => handleDeleteQuiz(quiz.quizId)}>Delete Quiz</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default QuizFileGenerator;
