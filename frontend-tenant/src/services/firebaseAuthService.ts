import { signInWithPopup, User } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { api } from '@/lib/api';
import { handleLoginSuccess } from './authService';

export interface FirebaseAuthResponse {
  message: string;
  user: {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  token: string;
  tenant: {
    id: number;
    name: string;
    domain: string;
  };
}

/**
 * Extraire des données étendues du profil Google via People API
 */
const fetchExtendedUserData = async (accessToken: string) => {
  try {
    const response = await fetch(`https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos,birthdays,genders,phoneNumbers,addresses,locales`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        birthday: data.birthdays?.[0]?.date ? 
          `${data.birthdays[0].date.year || ''}-${String(data.birthdays[0].date.month || '').padStart(2, '0')}-${String(data.birthdays[0].date.day || '').padStart(2, '0')}`.replace(/^-+|-+$/g, '') : null,
        gender: data.genders?.[0]?.value || null,
        phone: data.phoneNumbers?.[0]?.value || null,
        address: data.addresses?.[0] ? `${data.addresses[0].streetAddress || ''}, ${data.addresses[0].city || ''}, ${data.addresses[0].country || ''}`.replace(/^,+|,+$/g, '').replace(/,\s*,/g, ',').trim() : null,
        locale: data.locales?.[0]?.value || null
      };
    }
    return {};
  } catch (error) {
    console.warn('Impossible de récupérer les données étendues:', error);
    return {};
  }
};

/**
 * Authentification Google via Firebase avec récupération maximale de données
 */
export const signInWithGoogle = async (): Promise<void> => {
  try {
    // 1. Authentification Firebase
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // 2. Récupérer les tokens Firebase et Google
    const firebaseToken = await user.getIdToken();
    const credential = result.user.accessToken || result._tokenResponse?.oauthAccessToken;
    
    // 3. Récupérer les données étendues du profil si possible
    const extendedData = credential ? await fetchExtendedUserData(credential) : {};
    
    // 4. Préparer toutes les données utilisateur disponibles
    const userData = {
      email: user.email,
      name: user.displayName,
      avatar: user.photoURL,
      google_id: user.uid,
      phone_verified: user.phoneNumber ? true : false,
      email_verified: user.emailVerified,
      ...extendedData
    };
    
    // 5. Envoyer au backend Laravel
    const response = await api.post('/auth/firebase', {
      firebase_token: firebaseToken,
      user_data: userData
    });
    
    // 6. Utiliser la même logique que le code existant
    const { user: backendUserData, token } = response.data;
    handleLoginSuccess(backendUserData, token);
    
  } catch (error) {
    console.error('Erreur Firebase Auth:', error);
    throw error;
  }
};

/**
 * Déconnexion Firebase
 */
export const signOutFromFirebase = async (): Promise<void> => {
  try {
    await auth.signOut();
    // Nettoyer le localStorage comme dans votre logique actuelle
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Erreur déconnexion Firebase:', error);
    throw error;
  }
};

/**
 * Vérifier l'état d'authentification Firebase
 */
export const getCurrentFirebaseUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Observer les changements d'authentification Firebase
 */
export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  return auth.onAuthStateChanged(callback);
};