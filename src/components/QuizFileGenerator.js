import React from 'react';

// Utility function to generate a random ID
const generateQuizId = () => {
    return `quiz_${Math.random().toString(36).substr(2, 9)}`;
};

const QuizFileGenerator = ({ quizTitle, languageOne, languageTwo, quizData, userId }) => {
    
    const handleDownloadQuizFile = () => {
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

        // Create a downloadable file
        const fileData = new Blob([JSON.stringify(quizFileData, null, 2)], { type: 'application/json' });
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(fileData);
        downloadLink.download = `${quizTitle || 'quiz'}_${quizFileData.quizId}.json`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    return (
        <button onClick={handleDownloadQuizFile}>
            Download Quiz File
        </button>
    );
};

export default QuizFileGenerator;
