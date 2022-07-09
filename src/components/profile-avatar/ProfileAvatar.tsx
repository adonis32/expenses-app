import { Avatar, AvatarProps } from "@chakra-ui/react";
import { useProfileById } from "../../context/profile/profile-hooks";

interface ProfileAvatarProps extends AvatarProps {
  uid: string;
}

function ProfileAvatar({ uid, ...props }: ProfileAvatarProps) {
  const profile = useProfileById(uid);

  return (
    <Avatar
      name={profile?.name}
      src={profile?.photoURL}
      {...props}
      referrerPolicy="no-referrer"
    />
  );
}

export default ProfileAvatar;
