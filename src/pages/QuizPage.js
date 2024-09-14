import React from 'react';
import { useParams } from 'react-router-dom';

function QuizPage() {
  const { quizName } = useParams();

  return (
    <div>
      <h1>Quiz: {quizName}</h1>
      {/* Add quiz details here */}
    </div>
  );
}

export default QuizPage;
