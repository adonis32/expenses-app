import React, { createContext, useContext, useEffect, useState } from "react";
import firebase from "firebase/app";

export interface AuthContext {
  user: firebase.User | null;
}

export const AuthContext = createContext<AuthContext>({ user: null });

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: React.ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<firebase.User | null>(null);

  useEffect(() => {
    let unmounted = false;

    const unsubscribe = firebase.auth().onAuthStateChanged(user => {
      if (unmounted) return;
      setUser(user);
    });

    return () => {
      unmounted = true;
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
}

export default AuthProvider;
