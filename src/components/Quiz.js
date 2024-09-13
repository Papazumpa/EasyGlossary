import React, { useState, useEffect } from 'react';

const Quiz = ({ phrases }) => {
    const [answerLanguage, setAnswerLanguage] = useState(1); // 1 for before the '=', 2 for after
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [options, setOptions] = useState([]);
    const [score, setScore] = useState(0);
    const [wrongQuestions, setWrongQuestions] = useState([]);
    const [quizInProgress, setQuizInProgress] = useState(false);
    const [quizHistory, setQuizHistory] = useState([]);
    const [message, setMessage] = useState('');

    // Start the quiz by selecting the first question
    const startQuiz = () => {
        setQuizInProgress(true);
        pickRandomQuestion();
    };

    // Pick a random question and generate options
    const pickRandomQuestion = () => {
        if (phrases.length === 0) return;

        const question = phrases[Math.floor(Math.random() * phrases.length)];
        setCurrentQuestion(question);

        // Generate four random answer options (one correct, three random)
        let otherOptions = phrases
            .filter(pair => pair !== question)
            .sort(() => 0.5 - Math.random()) // Randomize
            .slice(0, 3); // Pick 3 wrong options

        // Correct answer depending on selected answer language
        const correctAnswer = answerLanguage === 1 ? question.german : question.swedish;

        // Add the correct answer to the options and shuffle
        const allOptions = [...otherOptions.map(pair => answerLanguage === 1 ? pair.german : pair.swedish), correctAnswer];
        allOptions.sort(() => 0.5 - Math.random());

        setOptions(allOptions); // Set options for the current question
    };

    // Handle answering the question
    const handleAnswer = (answer) => {
        const correctAnswer = answerLanguage === 1 ? currentQuestion.german : currentQuestion.swedish;

        if (answer === correctAnswer) {
            setMessage('Correct!');
            setScore(score + 1);
        } else {
            setMessage(`Wrong! The correct answer was: ${correctAnswer}`);
            setWrongQuestions([...wrongQuestions, currentQuestion]); // Add wrong question to the end
        }

        // Move to the next question after a short delay
        setTimeout(() => {
            setMessage('');
            pickRandomQuestion();
        }, 1000);
    };

    // Final quiz statistics
    const endQuiz = () => {
        const totalTime = quizHistory.reduce((acc, attempt) => acc + attempt.timeTaken, 0);
        return {
            totalQuestions: phrases.length,
            score: score,
            incorrectAnswers: wrongQuestions.length,
            totalTime,
        };
    };

    return (
        <div>
            {quizInProgress ? (
                <div>
                    <h2>Quiz In Progress</h2>

                    {currentQuestion && (
                        <>
                            <p>What is the translation of: <strong>{answerLanguage === 1 ? currentQuestion.swedish : currentQuestion.german}</strong>?</p>

                            {options.map((option, index) => (
                                <button key={index} onClick={() => handleAnswer(option)}>
                                    {option}
                                </button>
                            ))}

                            <p>{message}</p>
                        </>
                    )}
                </div>
            ) : (
                <div>
                    <h2>Select Answer Language</h2>
                    <select onChange={(e) => setAnswerLanguage(Number(e.target.value))}>
                        <option value={1}>Language 1 (Before =)</option>
                        <option value={2}>Language 2 (After =)</option>
                    </select>

                    <button onClick={startQuiz}>Start Quiz</button>
                </div>
            )}

            {quizInProgress && (
                <div>
                    <h2>Score: {score}</h2>
                    <p>Questions Answered: {score + wrongQuestions.length}</p>
                </div>
            )}
        </div>
    );
};

export default Quiz;
