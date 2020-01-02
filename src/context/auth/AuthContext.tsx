import React, { createContext, useContext, useEffect, useState } from "react";
import firebase from "firebase/app";

export interface AuthContext {
  user: firebase.User | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContext>({
  user: null,
  loading: false
});

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: React.ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unmounted = false;

    const unsubscribe = firebase.auth().onAuthStateChanged(user => {
      if (unmounted) return;
      setUser(user);
      setLoading(false);

      if (user) {
        firebase
          .firestore()
          .doc(`profiles/${user.uid}`)
          .set({
            name: user.displayName,
            photoURL: user.photoURL
          });
      }
    });

    return () => {
      unmounted = true;
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
