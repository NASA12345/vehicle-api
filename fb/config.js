// Import the functions you need from the SDKs you need
import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';


const {
  NEXT_PUBLIC_API_KEY,
  NEXT_PUBLIC_AUTH_DOMAIN,
  NEXT_PUBLIC_PROJECT_ID,
  NEXT_PUBLIC_STORAGE_BUCKET,
  NEXT_PUBLIC_MESSAGE_SENDER_ID,
  NEXT_PUBLIC_APP_ID,
  NEXT_PUBLIC_MEASUREMENT_ID
} = process.env;

if (!NEXT_PUBLIC_PROJECT_ID || !NEXT_PUBLIC_API_KEY) {
  throw new Error('Missing Firebase config in .env');
}

const firebaseConfig = {
  apiKey: NEXT_PUBLIC_API_KEY,
  authDomain: NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: NEXT_PUBLIC_PROJECT_ID,
  storageBucket: NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: NEXT_PUBLIC_MESSAGE_SENDER_ID,
  appId: NEXT_PUBLIC_APP_ID,
  measurementId: NEXT_PUBLIC_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);