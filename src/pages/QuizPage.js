import React from 'react';
import { useLocation } from 'react-router-dom';

const QuizPage = () => {
    const location = useLocation();
    const { quiz } = location.state || {}; // Access quiz data

    return (
        <div>
            <h1>{quiz.quizTitle}</h1>
            {/* Render the quiz data */}
            {quiz.quizData.map((pair, index) => (
                <p key={index}>
                    {pair.phraseOne} - {pair.phraseTwo}
                </p>
            ))}
        </div>
    );
};

export default QuizPage;
