import { useProfile, Profile } from "./ProfileContext";
import { useEffect } from "react";

export function useProfileById(uid: string): Profile | undefined {
  const { profiles, fetchProfile } = useProfile();

  const profile = profiles[uid];

  useEffect(() => {
    if (!profile) {
      fetchProfile(uid);
    }
  }, [uid, fetchProfile, profile]);

  return profile;
}
