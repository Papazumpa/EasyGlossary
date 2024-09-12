import React, { useState } from 'react';

const Quiz = ({ pairs }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [completed, setCompleted] = useState(false);

    const handleAnswer = (answer) => {
        if (pairs[currentQuestion].translation === answer) {
            setScore(score + 1);
        }

        const nextQuestion = currentQuestion + 1;
        if (nextQuestion < pairs.length) {
            setCurrentQuestion(nextQuestion);
        } else {
            setCompleted(true);
        }
    };

    if (completed) {
        return <div>Your score: {score}/{pairs.length}</div>;
    }

    const currentPair = pairs[currentQuestion];

    return (
        <div>
            <h2>Translate: {currentPair.term}</h2>
            <button onClick={() => handleAnswer(currentPair.translation)}>Answer</button>
        </div>
    );
};

export default Quiz;
