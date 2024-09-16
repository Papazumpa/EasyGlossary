import React from 'react';

// Utility function to generate a random ID
const generateQuizId = () => {
    return `quiz_${Math.random().toString(36).substr(2, 9)}`;
};

const QuizFileGenerator = ({ quizTitle, languageOne, languageTwo, quizData, userId }) => {
    
    const handleUploadToB2 = async () => {
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

        // Use FormData to upload file
        const formData = new FormData();
        formData.append('file', fileData, `${quizTitle || 'quiz'}_${quizFileData.quizId}.json`);

        try {
            const response = await fetch('/api/uploadToB2', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                console.log('File uploaded successfully', result.data);
            } else {
                console.error('File upload failed', result.message);
            }
        } catch (error) {
            console.error('Upload error', error);
        }
    };

    return (
        <button onClick={handleUploadToB2}>
            Upload Quiz File
        </button>
    );
};

export default QuizFileGenerator;
