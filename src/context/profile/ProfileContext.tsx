import React, { createContext, useContext, useCallback, useState } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

export interface Profile {
  name: string;
  photoURL: string;
}

export interface ProfileContext {
  profiles: Record<string, Profile>;
  fetchProfile: (uid: string) => void;
}

export const ProfileContext = createContext<ProfileContext>({
  profiles: {},
  fetchProfile: () => null,
});

export function useProfile() {
  return useContext(ProfileContext);
}

interface ProfileProviderProps {
  children: React.ReactNode;
}

function ProfileProvider({ children }: ProfileProviderProps) {
  const [profiles, setProfiles] = useState<ProfileContext["profiles"]>({});

  const fetchProfile = useCallback(async (uid: string) => {
    const profileDoc = await firebase.firestore().doc(`profiles/${uid}`).get();

    if (!profileDoc.exists) return;

    setProfiles((current) => ({
      ...current,
      [uid]: profileDoc.data() as Profile,
    }));
  }, []);

  return (
    <ProfileContext.Provider value={{ profiles, fetchProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export default ProfileProvider;
