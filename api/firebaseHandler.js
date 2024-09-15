import admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://ez-glossary.firebaseio.com' // Replace with your actual database URL
  });
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const quizData = req.body;
      // Add quiz data to Firestore
      const docRef = await admin.firestore().collection('quizzes').add(quizData);
      res.status(200).json({ id: docRef.id });
    } catch (error) {
      res.status(500).json({ error: 'Error saving quiz' });
    }
  } else if (req.method === 'GET') {
    try {
      // Fetch data from Firestore (example collection)
      const snapshot = await admin.firestore().collection('example').get();
      const data = snapshot.docs.map(doc => doc.data());
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching data' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
