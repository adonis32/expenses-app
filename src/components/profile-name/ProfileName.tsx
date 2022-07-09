import { useProfileById } from "../../context/profile/profile-hooks";

interface ProfileNameProps {
  uid: string;
}

function ProfileName({ uid }: ProfileNameProps) {
  const profile = useProfileById(uid);

  return <>{profile?.name}</>;
}

export default ProfileName;
