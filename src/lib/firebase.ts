import { FirebaseError, getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, initializeAuth, type Auth } from 'firebase/auth';

import { authPersistence } from '@/lib/auth-persistence';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  );
}

function getFirebaseApp() {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Faltan las variables EXPO_PUBLIC_FIREBASE_*. Copia .env.example a .env y reinicia Expo.',
    );
  }

  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
}

let auth: Auth | undefined;

export function getFirebaseAuth() {
  if (auth) {
    return auth;
  }

  const app = getFirebaseApp();

  try {
    auth = initializeAuth(app, {
      persistence: authPersistence,
    });
  } catch (error) {
    if (error instanceof FirebaseError && error.code === 'auth/already-initialized') {
      auth = getAuth(app);
    } else {
      throw error;
    }
  }

  return auth;
}
