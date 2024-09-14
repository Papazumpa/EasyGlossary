// api/createQuiz.js

import { Firestore } from '@google-cloud/firestore';
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, quizName, quizData, isPublic } = req.body;

    if (!userId || !quizName || !quizData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      // Generate a unique ID for the quiz
      const quizId = db.collection('quizzes').doc().id;

      // Create a new quiz document
      await db.collection('quizzes').doc(quizId).set({
        userId,
        quizName,
        quizData,
        isPublic,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(200).json({ message: 'Quiz created successfully', quizId });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create quiz' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
