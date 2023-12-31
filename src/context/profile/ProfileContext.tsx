import { createContext, useContext, useCallback, useState } from "react";
import * as React from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

export interface Profile {
  name: string;
  photoURL: string;
}

export interface ProfileContextType {
  profiles: Record<string, Profile>;
  fetchProfile: (uid: string) => void;
}

export const ProfileContext = createContext<ProfileContextType>({
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
  const [profiles, setProfiles] = useState<ProfileContextType["profiles"]>({});

  const fetchingRef = React.useRef<Record<string, boolean>>({});

  const fetchProfile = useCallback(async (uid: string) => {
    if (fetchingRef.current[uid]) {
      return;
    }

    fetchingRef.current[uid] = true;

    const profileDoc = await firebase.firestore().doc(`profiles/${uid}`).get();

    fetchingRef.current[uid] = false;

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
