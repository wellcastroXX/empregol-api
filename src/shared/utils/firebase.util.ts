import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { env } from '../../config/env';
import { AppError, UnauthorizedError } from '../errors/app-error';

let app: admin.app.App | null = null;

function loadServiceAccount(): admin.ServiceAccount {
  if (env.FIREBASE_SERVICE_ACCOUNT) {
    return JSON.parse(env.FIREBASE_SERVICE_ACCOUNT) as admin.ServiceAccount;
  }
  if (env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    return JSON.parse(readFileSync(env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf-8')) as admin.ServiceAccount;
  }
  throw new AppError(
    'Login social indisponível: service account do Firebase não configurado no servidor.',
    503,
    'SOCIAL_NOT_CONFIGURED',
  );
}

/** Lazily initialize the Firebase Admin app (only when social login is used). */
function getApp(): admin.app.App {
  if (app) return app;
  app = admin.apps.length
    ? admin.app()
    : admin.initializeApp({ credential: admin.credential.cert(loadServiceAccount()) });
  return app;
}

export interface FirebaseIdentity {
  email: string | null;
  emailVerified: boolean;
  uid: string;
  provider: string;
}

/** Verifies a Firebase ID token and returns the identity (email/uid/provider). */
export async function verifyFirebaseIdToken(idToken: string): Promise<FirebaseIdentity> {
  let decoded: admin.auth.DecodedIdToken;
  try {
    decoded = await getApp().auth().verifyIdToken(idToken);
  } catch (err) {
    if (err instanceof AppError) throw err; // config error → bubble up
    throw new UnauthorizedError('Token social inválido ou expirado');
  }
  return {
    email: decoded.email ?? null,
    emailVerified: decoded.email_verified ?? false,
    uid: decoded.uid,
    provider: decoded.firebase?.sign_in_provider ?? 'unknown',
  };
}
