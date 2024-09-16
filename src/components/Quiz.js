import React, { useState, useEffect } from 'react';

const Quiz = ({ phrases, languageOne, languageTwo, l1Title, l2Title }) => {
    const [answerLanguage, setAnswerLanguage] = useState(1); // 1 for language one, 2 for language two
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [options, setOptions] = useState([]);
    const [score, setScore] = useState(0);
    const [wrongQuestions, setWrongQuestions] = useState([]);
    const [correctQuestions, setCorrectQuestions] = useState([]);
    const [quizInProgress, setQuizInProgress] = useState(false);
    const [quizName, setQuizName] = useState('');
    const [message, setMessage] = useState('');

    // On answer language change, update quiz name
    useEffect(() => {
        if (answerLanguage) {
            const title = answerLanguage === 1 ? l1Title : l2Title;
            setQuizName(title);
        }
    }, [answerLanguage, l1Title, l2Title]);

    // Filter valid pairs, ensuring both languages exist and filtering out titles/labels
    const validPhrases = phrases.filter(pair => 
        pair.languageOne && pair.languageTwo && !["language one", "language two", "l1 title", "l2 title"].includes(pair.languageOne.toLowerCase())
    );

    // Start the quiz by picking the first question
    const startQuiz = () => {
        setQuizInProgress(true);
        pickRandomQuestion();
    };

    // Pick a random question and generate options
    const pickRandomQuestion = () => {
        const remainingQuestions = validPhrases.filter(pair => !correctQuestions.includes(pair));

        if (remainingQuestions.length === 0) {
            endQuiz();
            return;
        }

        const question = remainingQuestions[Math.floor(Math.random() * remainingQuestions.length)];
        setCurrentQuestion(question);

        // Generate four random answer options (one correct, three wrong)
        let otherOptions = remainingQuestions
            .filter(pair => pair !== question)
            .sort(() => 0.5 - Math.random()) // Shuffle wrong options
            .slice(0, 3); // Get 3 wrong options

        const correctAnswer = answerLanguage === 1 ? question.languageOne : question.languageTwo;
        const allOptions = [...otherOptions.map(pair => answerLanguage === 1 ? pair.languageOne : pair.languageTwo), correctAnswer];

        // Shuffle all options
        setOptions(allOptions.sort(() => 0.5 - Math.random()));
    };

    // Handle user answer
    const handleAnswer = (answer) => {
        const correctAnswer = answerLanguage === 1 ? currentQuestion.languageOne : currentQuestion.languageTwo;

        if (answer === correctAnswer) {
            setMessage('Correct!');
            setScore(score + 1);
            setCorrectQuestions([...correctQuestions, currentQuestion]); // Add to correct list
        } else {
            setMessage(`Wrong! The correct answer was: ${correctAnswer}`);
            setWrongQuestions([...wrongQuestions, currentQuestion]); // Add to wrong list
        }

        // Move to the next question after a short delay
        setTimeout(() => {
            setMessage('');
            pickRandomQuestion();
        }, 1000);
    };

    // End the quiz and display stats
    const endQuiz = () => {
        setQuizInProgress(false);
    };

    return (
        <div>
            <h1>{quizName}</h1>

            {quizInProgress ? (
                <div>
                    {currentQuestion ? (
                        <>
                            <p>What is the translation of: <strong>{answerLanguage === 1 ? currentQuestion.languageTwo : currentQuestion.languageOne}</strong>?</p>

                            {options.map((option, index) => (
                                <button key={index} onClick={() => handleAnswer(option)}>
                                    {option}
                                </button>
                            ))}

                            <p>{message}</p>
                        </>
                    ) : (
                        <p>No more questions!</p>
                    )}
                </div>
            ) : (
                <div>
                    <h2>Select Answer Language</h2>
                    <select onChange={(e) => setAnswerLanguage(Number(e.target.value))}>
                        <option value={1}>{languageOne}</option>
                        <option value={2}>{languageTwo}</option>
                    </select>

                    <button onClick={startQuiz}>Start Quiz</button>
                </div>
            )}

            {!quizInProgress && correctQuestions.length === validPhrases.length && (
                <div>
                    <h2>Quiz Complete!</h2>
                    <p>Score: {score}</p>
                    <p>Total Questions: {validPhrases.length}</p>
                    <p>Incorrect Answers: {wrongQuestions.length}</p>
                    <p>Tries: {score + wrongQuestions.length}</p>
                </div>
            )}
        </div>
    );
};

export default Quiz;
