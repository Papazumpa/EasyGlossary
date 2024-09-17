import React, { useEffect, useState } from 'react';
import { saveQuiz, getAllQuizzes } from './utils/indexedDB'; // Adjust the path accordingly

const UploadPage = () => {
  const [quizzes, setQuizzes] = useState([]);

  // Function to handle saving a quiz (maybe after image upload)
  const handleSaveQuiz = async (quiz) => {
    try {
      const id = await saveQuiz(quiz);
      console.log(`Quiz saved with ID: ${id}`);
      loadQuizzes(); // Refresh quiz list after saving
    } catch (error) {
      console.error(error);
    }
  };

  // Load all saved quizzes from IndexedDB
  const loadQuizzes = async () => {
    try {
      const storedQuizzes = await getAllQuizzes();
      setQuizzes(storedQuizzes);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // Load quizzes on component mount
    loadQuizzes();
  }, []);

  return (
    <div>
      <h1>Upload and Save Quiz</h1>
      {/* Replace with your image upload and quiz creation logic */}
      <button onClick={() => handleSaveQuiz({ name: 'Example Quiz', data: 'Some data' })}>
        Save Quiz
      </button>
      <h2>Saved Quizzes</h2>
      <ul>
        {quizzes.map((quiz) => (
          <li key={quiz.id}>{quiz.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default UploadPage;
