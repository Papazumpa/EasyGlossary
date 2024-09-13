import React, { useState, useEffect } from 'react';

const Quiz = ({ phrases }) => {
    const [answerLanguage, setAnswerLanguage] = useState(1); // 1 for German, 2 for Swedish
    const [questionIndex, setQuestionIndex] = useState(0);
    const [choices, setChoices] = useState([]);
    const [correctAnswers, setCorrectAnswers] = useState([]);
    const [incorrectAnswers, setIncorrectAnswers] = useState([]);
    const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
    const [quizStartTime, setQuizStartTime] = useState(null);
    const [tries, setTries] = useState(0);
    const [stats, setStats] = useState(null);

    // Helper to randomize array order
    const shuffleArray = (array) => {
        return array.sort(() => Math.random() - 0.5);
    };

    // Start the quiz by randomizing phrases
    const startQuiz = () => {
        setCorrectAnswers([]);
        setIncorrectAnswers(shuffleArray(phrases));
        setQuestionIndex(0);
        setIsAnswerCorrect(null);
        setTries(0);
        setQuizStartTime(Date.now());
    };

    // Prepare the next question
    const prepareQuestion = () => {
        if (incorrectAnswers.length === 0) {
            endQuiz();
            return;
        }
        
        // Pick a random incorrect answer for the question
        const currentPhrase = incorrectAnswers[questionIndex];
        const correctAnswer = answerLanguage === 1 ? currentPhrase.german : currentPhrase.swedish;
        const questionText = answerLanguage === 1 ? currentPhrase.swedish : currentPhrase.german;
        
        // Generate 4 choices: 1 correct + 3 random incorrect answers
        const otherChoices = incorrectAnswers.filter(p => p !== currentPhrase);
        const randomChoices = shuffleArray(otherChoices).slice(0, 3).map(p => (answerLanguage === 1 ? p.german : p.swedish));
        const allChoices = shuffleArray([correctAnswer, ...randomChoices]);

        setChoices(allChoices);
    };

    // Handle the user answer
    const handleAnswer = (selectedChoice) => {
        const currentPhrase = incorrectAnswers[questionIndex];
        const correctAnswer = answerLanguage === 1 ? currentPhrase.german : currentPhrase.swedish;

        setTries(tries + 1);

        if (selectedChoice === correctAnswer) {
            // Correct answer
            setCorrectAnswers([...correctAnswers, currentPhrase]);
            setIsAnswerCorrect(true);
            // Remove the correctly answered phrase from the list
            setIncorrectAnswers(incorrectAnswers.filter((_, index) => index !== questionIndex));
        } else {
            // Incorrect answer
            setIsAnswerCorrect(false);
        }
    };

    // Go to the next question
    const nextQuestion = () => {
        setQuestionIndex((prevIndex) => (prevIndex + 1) % incorrectAnswers.length);
        setIsAnswerCorrect(null);
        prepareQuestion();
    };

    // End the quiz and calculate statistics
    const endQuiz = () => {
        const timeTaken = (Date.now() - quizStartTime) / 1000; // Time in seconds
        setStats({
            totalQuestions: phrases.length,
            totalTries: tries,
            totalWrongAnswers: tries - correctAnswers.length,
            timeTaken,
        });
    };

    // Effect to prepare the first question when the quiz starts
    useEffect(() => {
        if (quizStartTime) {
            prepareQuestion();
        }
    }, [quizStartTime]);

    return (
        <div>
            {!quizStartTime ? (
                <>
                    <h2>Select Answer Language</h2>
                    <button onClick={() => setAnswerLanguage(1)}>German to Swedish</button>
                    <button onClick={() => setAnswerLanguage(2)}>Swedish to German</button>
                    <button onClick={startQuiz}>Start Quiz</button>
                </>
            ) : (
                <>
                    {stats ? (
                        <div>
                            <h2>Quiz Completed</h2>
                            <p>Total Questions: {stats.totalQuestions}</p>
                            <p>Total Tries: {stats.totalTries}</p>
                            <p>Total Wrong Answers: {stats.totalWrongAnswers}</p>
                            <p>Time Taken: {stats.timeTaken.toFixed(2)} seconds</p>
                        </div>
                    ) : (
                        <>
                            <h2>Question {questionIndex + 1}</h2>
                            <p>{answerLanguage === 1 ? 'Translate from Swedish' : 'Translate from German'}:</p>
                            <h3>{answerLanguage === 1 ? incorrectAnswers[questionIndex].swedish : incorrectAnswers[questionIndex].german}</h3>

                            {choices.map((choice, index) => (
                                <button key={index} onClick={() => handleAnswer(choice)}>
                                    {choice}
                                </button>
                            ))}

                            {isAnswerCorrect !== null && (
                                <div>
                                    {isAnswerCorrect ? (
                                        <p>Correct!</p>
                                    ) : (
                                        <p>Wrong! The correct answer was: {answerLanguage === 1 ? incorrectAnswers[questionIndex].german : incorrectAnswers[questionIndex].swedish}</p>
                                    )}
                                    <button onClick={nextQuestion}>Next Question</button>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default Quiz;
