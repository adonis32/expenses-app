import { Avatar, AvatarProps } from "@chakra-ui/react";
import { useProfileById } from "../../context/profile/profile-hooks";

interface ProfileAvatarProps extends AvatarProps {
  uid: string;
}

function ProfileAvatar({ uid, ...props }: ProfileAvatarProps) {
  const profile = useProfileById(uid);

  console.log(profile);

  return (
    <Avatar
      name={profile?.name}
      src={profile?.photoURL}
      {...props}
      referrerpolicy="no-referrer"
    />
  );
}

export default ProfileAvatar;
