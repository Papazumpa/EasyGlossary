import React from 'react';

function HomePage() {
  const quizzes = ['quiz-1', 'quiz-2', 'quiz-3']; // Replace with actual quizzes data

  return (
    <div>
      <h1>Home Page</h1>
      <button>Upload</button>
      <h2>Your Quizzes</h2>
      <ul>
        {quizzes.map(quiz => (
          <li key={quiz}>
            <a href={`/quiz/${quiz}`}>{quiz}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HomePage;
