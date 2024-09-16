import React from 'react';

// Utility function to generate a random ID
const generateQuizId = () => {
    return `quiz_${Math.random().toString(36).substr(2, 9)}`;
};

const QuizFileGenerator = ({ quizTitle, languageOne, languageTwo, quizData, userId }) => {
    
    const handleUploadQuizFile = async () => {
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

        // Convert quiz metadata to a Blob
        const fileData = new Blob([JSON.stringify(quizFileData, null, 2)], { type: 'application/json' });

        // Create FormData and append the file
        const formData = new FormData();
        formData.append('file', fileData, `${quizFileData.quizTitle || 'quiz'}_${quizFileData.quizId}.json`);

        try {
            // Upload the file to Backblaze B2 via the serverless function
            const response = await fetch('/api/uploadToB2', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                console.log('File uploaded successfully', result);
                alert('Quiz file uploaded successfully!');
            } else {
                console.error('File upload failed', result);
                alert('Failed to upload quiz file');
            }
        } catch (error) {
            console.error('Error uploading file', error);
            alert('Error uploading quiz file');
        }
    };

    return (
        <button onClick={handleUploadQuizFile}>
            Upload Quiz File
        </button>
    );
};

export default QuizFileGenerator;
