import React, { useState } from 'react';

const QuizCreationForm = () => {
  const [quizName, setQuizName] = useState('');
  const [quizData, setQuizData] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [userId, setUserId] = useState(''); // Replace this with actual user ID from authentication
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Example of user ID; replace with actual user ID from authentication
    const userId = 'sampleUserId'; 

    try {
      const response = await fetch('/api/createQuiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          quizName,
          quizData: quizData.split('\n').map(line => line.trim()).filter(Boolean),
          isPublic,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`Quiz created successfully! Quiz ID: ${result.quizId}`);
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
      setMessage('Failed to create quiz');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Quiz Name:
          <input
            type="text"
            value={quizName}
            onChange={(e) => setQuizName(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Quiz Data (one question per line):
          <textarea
            value={quizData}
            onChange={(e) => setQuizData(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Make Public:
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
        </label>
      </div>
      <button type="submit">Create Quiz</button>
      <p>{message}</p>
    </form>
  );
};

export default QuizCreationForm;
