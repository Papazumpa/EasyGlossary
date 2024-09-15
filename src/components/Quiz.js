import React, { useState, useEffect } from 'react';

const Quiz = ({ phrases, languageOne, languageTwo, l1Title, l2Title }) => {
    const [answerLanguage, setAnswerLanguage] = useState(1); // 1 for language one, 2 for language two
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [options, setOptions] = useState([]);
    const [score, setScore] = useState(0);
    const [wrongQuestions, setWrongQuestions] = useState([]);
    const [correctQuestions, setCorrectQuestions] = useState([]);
    const [quizInProgress, setQuizInProgress] = useState(false);
    const [quizHistory, setQuizHistory] = useState([]);
    const [message, setMessage] = useState('');
    const [quizName, setQuizName] = useState('');

    useEffect(() => {
        if (answerLanguage) {
            // Set quiz title based on selected language
            const title = answerLanguage === 1 ? l1Title : l2Title;
            setQuizName(title);
            
            // Create quiz document in Firebase
            // createQuizDocument(title); // Commented out Firebase-related API call
        }
    }, [answerLanguage]);

    // Filter out special terms and any phrases missing translations
    const validPhrases = phrases.filter(pair =>
        pair.german && pair.swedish && // Ensure both german and swedish properties exist
        !["language one", "language two", "l1 title", "l2 title"].includes(pair.german.toLowerCase())
    );

    // Start the quiz by selecting the first question
    const startQuiz = () => {
        setQuizInProgress(true);
        pickRandomQuestion();
    };

    // Pick a random question and generate options
    const pickRandomQuestion = () => {
        const remainingQuestions = validPhrases.filter(pair => !correctQuestions.includes(pair));

        if (remainingQuestions.length === 0) {
            // No questions left, end quiz
            endQuiz();
            return;
        }

        const question = remainingQuestions[Math.floor(Math.random() * remainingQuestions.length)];
        setCurrentQuestion(question);

        // Generate four random answer options (one correct, three random)
        let otherOptions = remainingQuestions
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
            setCorrectQuestions([...correctQuestions, currentQuestion]); // Add question to correctQuestions
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

    // End the quiz and show stats
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
                            <p>What is the translation of: <strong>{answerLanguage === 1 ? currentQuestion.swedish : currentQuestion.german}</strong>?</p>

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
