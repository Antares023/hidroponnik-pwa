import { createContext, useContext, useEffect, useState } from 'react';
import { auth, database } from '../firebase';
import { onAuthStateChanged, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { ref, get, update } from 'firebase/database';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch role
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          
          // Sync email verification status to DB if they just verified
          if (user.emailVerified && !userData.email_verified) {
             await update(userRef, { email_verified: true });
             userData.email_verified = true;
          }

          setUserRole(userData.role);
          setUserStatus(userData.status || 'pending');
          setUserData(userData);
        } else {
          setUserRole('user'); // Default
          setUserStatus('pending');
          setUserData(null);
        }
      } else {
        setUserRole(null);
        setUserStatus(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = () => {
    return signOut(auth);
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const value = {
    currentUser,
    userRole,
    userStatus,
    userData,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
