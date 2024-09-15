import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; 
import ImageUpload from './components/ImageUpload'; 
import Quiz from './components/Quiz'; 
import HomePage from './pages/HomePage'; 
import AboutPage from './pages/AboutPage'; 
import QuizPage from './pages/QuizPage'; 
// import { db } from './firebase'; // Commented out Firebase import

const App = () => {
  const [quizData, setQuizData] = useState([]);
  const [detectedText, setDetectedText] = useState('');
  const [processedText, setProcessedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [languageOne, setLanguageOne] = useState('');
  const [languageTwo, setLanguageTwo] = useState('');
  const [l1Title, setL1Title] = useState('');
  const [l2Title, setL2Title] = useState('');

  const callCohereAPI = async (ocrOutput) => {
    setLoading(true);
    try {
      const response = await fetch('/api/cohere', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ocrOutput: ocrOutput,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const correctedText = data.result;
      setProcessedText(correctedText);
      processText(correctedText);

      setLoading(false);
    } catch (error) {
      console.error('Error calling Cohere API:', error);
      setLoading(false);
    }
  };

  const processText = (text) => {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

    const specialLines = {
      languageOne: '',
      languageTwo: '',
      l1Title: '',
      l2Title: ''
    };

    const quizPairs = lines.map(line => {
      if (line.includes('language one =')) {
        specialLines.languageOne = line.split('=')[1].trim();
        return null;
      }
      if (line.includes('language two =')) {
        specialLines.languageTwo = line.split('=')[1].trim();
        return null;
      }
      if (line.includes('l1 title =')) {
        specialLines.l1Title = line.split('=')[1].trim();
        return null;
      }
      if (line.includes('l2 title =')) {
        specialLines.l2Title = line.split('=')[1].trim();
        return null;
      }

      const [phraseOne, phraseTwo] = line.split('=').map(part => part.trim());

      if (!phraseTwo) {
        const userResponse = window.prompt(`The corresponding phrase for "${phraseOne}" is missing. Enter one or leave empty to remove this line:`);
        if (userResponse) {
          return { phraseOne, phraseTwo: userResponse.trim() };
        } else {
          return null;
        }
      }

      return { phraseOne, phraseTwo };
    }).filter(Boolean);

    setLanguageOne(specialLines.languageOne);
    setLanguageTwo(specialLines.languageTwo);
    setL1Title(specialLines.l1Title);
    setL2Title(specialLines.l2Title);
    setQuizData(quizPairs);
  };

  const handleLanguageSelection = async (selectedLanguage) => {
    // Set the language and quiz title based on selection
    const quizTitle = selectedLanguage === 'Language One' ? `${languageOne} Quiz` : `${languageTwo} Quiz`;

    const quizDocument = {
      languageOne: languageOne,
      languageTwo: languageTwo,
      selectedLanguage: selectedLanguage,
      quizTitle: quizTitle,
      quizData: quizData
    };

    try {
      // Commented out the Firebase-related API call
      /*
      const response = await fetch('/api/firebaseHandler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizDocument),
      });

      if (!response.ok) {
        throw new Error('Error saving quiz');
      }

      const result = await response.json();
      console.log('Quiz saved successfully with ID:', result.id);
      */
    } catch (error) {
      console.error('Error creating quiz document:', error);
    }
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <UploadPage 
              setDetectedText={setDetectedText} 
              callCohereAPI={callCohereAPI} 
              detectedText={detectedText} 
              loading={loading} 
              processedText={processedText} 
              quizData={quizData} 
              handleLanguageSelection={handleLanguageSelection} 
              languageOne={languageOne} 
              languageTwo={languageTwo} 
              l1Title={l1Title} 
              l2Title={l2Title} 
            />
          } 
        />
