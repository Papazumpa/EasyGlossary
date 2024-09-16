import React, { useState, useEffect } from 'react';
import QuizFileGenerator from './QuizFileGenerator'; // Import the new component

const Quiz = ({ phrases, languageOne, languageTwo, l1Title, l2Title, userId }) => {
    const [answerLanguage, setAnswerLanguage] = useState(1);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [options, setOptions] = useState([]);
    const [score, setScore] = useState(0);
    const [wrongQuestions, setWrongQuestions] = useState([]);
    const [correctQuestions, setCorrectQuestions] = useState([]);
    const [quizInProgress, setQuizInProgress] = useState(false);
    const [quizName, setQuizName] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (answerLanguage) {
            const title = answerLanguage === 1 ? l1Title : l2Title;
            setQuizName(title);
        }
    }, [answerLanguage, l1Title, l2Title]);

    const validPhrases = phrases.filter(pair => pair.phraseOne && pair.phraseTwo);

    const startQuiz = () => {
        setQuizInProgress(true);
        pickRandomQuestion();
    };

    const pickRandomQuestion = () => {
        const remainingQuestions = validPhrases.filter(pair => !correctQuestions.includes(pair));

        if (remainingQuestions.length === 0) {
            endQuiz();
            return;
        }

        const question = remainingQuestions[Math.floor(Math.random() * remainingQuestions.length)];
        setCurrentQuestion(question);

        let otherOptions = remainingQuestions
            .filter(pair => pair !== question)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

        const correctAnswer = answerLanguage === 1 ? question.phraseOne : question.phraseTwo;
        const allOptions = [...otherOptions.map(pair => answerLanguage === 1 ? pair.phraseOne : pair.phraseTwo), correctAnswer];
        setOptions(allOptions.sort(() => 0.5 - Math.random()));
    };

    const handleAnswer = (answer) => {
        const correctAnswer = answerLanguage === 1 ? currentQuestion.phraseOne : currentQuestion.phraseTwo;

        if (answer === correctAnswer) {
            setMessage('Correct!');
            setScore(score + 1);
            setCorrectQuestions([...correctQuestions, currentQuestion]);
        } else {
            setMessage(`Wrong! The correct answer was: ${correctAnswer}`);
            setWrongQuestions([...wrongQuestions, currentQuestion]);
        }

        setTimeout(() => {
            setMessage('');
            pickRandomQuestion();
        }, 1000);
    };

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
                            <p>Translate: <strong>{answerLanguage === 1 ? currentQuestion.phraseTwo : currentQuestion.phraseOne}</strong></p>
                            {options.map((option, index) => (
                                <button key={index} onClick={() => handleAnswer(option)}>
                                    {option}
                                </button>
                            ))}
                            <p>{message}</p>
                        </>
                    ) : <p>No more questions!</p>}
                </div>
            ) : (
                <div>
                    <h2>Select Answer Language</h2>
                    <select onChange={(e) => setAnswerLanguage(Number(e.target.value))}>
                        <option value={1}>{languageOne}</option>
                        <option value={2}>{languageTwo}</option>
                    </select>

                    <button onClick={startQuiz}>Start Quiz</button>

                    <QuizFileGenerator 
                        quizTitle={quizName} 
                        languageOne={languageOne} 
                        languageTwo={languageTwo} 
                        quizData={validPhrases} 
                        userId={userId}
                    />
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
