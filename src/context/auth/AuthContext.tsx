import { createContext, useContext, useEffect, useState } from "react";
import * as React from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

export type User = firebase.User;

export interface AuthContextType {
  user: User | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
});

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: React.ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unmounted = false;

    const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (unmounted) return;

      if (user) {
        await firebase
          .firestore()
          .enablePersistence({
            synchronizeTabs: true,
          })
          .catch(() => {
            console.info(
              "Persistence could not be enabled. Offline data for this user will be lost when the user closes the app."
            );
          });

        firebase.firestore().doc(`profiles/${user.uid}`).set({
          name: user.displayName,
          photoURL: user.photoURL,
        });
      }

      setUser(user);
      setLoading(false);
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
