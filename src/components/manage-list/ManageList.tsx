import React, { useState, useCallback, useEffect } from "react";
import {
  Flex,
  IconButton,
  Heading,
  Box,
  Text,
  Input,
  Button,
} from "@chakra-ui/react";
import { useHistory, useRouteMatch, Redirect } from "react-router-dom";
import { useListById, List, useIsListAdmin } from "../../context/list";
import { useAuth } from "../../context/auth";
import { nanoid } from "nanoid";
import ProfileName from "../profile-name";
import firebase from "firebase/compat/app";
import "firebase/compat/functions";
import { CheckIcon, CloseIcon, LinkIcon } from "@chakra-ui/icons";

type DeleteListFunction = (params: {
  id: string;
}) => Promise<firebase.functions.HttpsCallableResult>;

const deleteListFunction: DeleteListFunction = firebase
  .app()
  .functions("europe-west1")
  .httpsCallable("deleteList");

function ManageList() {
  const match = useRouteMatch<{ listId: string }>();
  const { listId } = match.params;
  const history = useHistory();
  const list = useListById(listId);
  const isAdmin = useIsListAdmin(listId);
  const { user } = useAuth();
  const [saveLoading, setSaveLoading] = useState(false);
  const [partial, setPartial] = useState<Partial<List>>({});
  const [deleteLoading, setDeleteLoading] = useState(false);

  const updateList = useCallback(async () => {
    if (!list || !user) {
      return;
    }

    const ref = list.__ref;

    setSaveLoading(true);

    await ref.update(partial);

    setSaveLoading(false);

    history.goBack();
  }, [list, user, history, partial]);

  const shareInviteLink = useCallback(async () => {
    if (!list) {
      return;
    }

    const code = nanoid();
    const ref = list.__ref;

    await ref.update({ code });

    const url = `${window.location.origin}/list/join?id=${ref.id}&code=${code}`;

    if (navigator.share) {
      await navigator.share({
        text: `Join ${list.name} at ExpensesApp!`,
        url,
      });
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);

      alert("Link copied to your clipboard!");
    } else {
      prompt("Send this link to the people you wanna invite", url);
    }
  }, [list]);

  async function deleteList() {
    if (!list) {
      return;
    }

    setDeleteLoading(true);

    const confirmed = window.confirm(
      "Are you sure? The list will be deleted permanently"
    );

    if (!confirmed) {
      setDeleteLoading(false);
      return;
    }

    await deleteListFunction({ id: list.__ref.id });

    history.replace("/");
    setDeleteLoading(false);
  }

  if (!list) {
    return null;
  }

  if (!isAdmin) {
    return <Redirect to={`/list/${listId}`} />;
  }

  return (
    <div>
      <Flex
        alignItems="center"
        borderBottomColor="gray.200"
        borderBottomWidth={1}
      >
        <IconButton
          aria-label="Close"
          icon={<CloseIcon />}
          ml={1}
          backgroundColor="transparent"
          onClick={() => history.goBack()}
        />

        <Flex py={4} px={2} alignItems="center">
          <Text as="h1" size="sm" fontWeight={600}>
            Manage {list?.name}
          </Text>
        </Flex>

        <IconButton
          ml="auto"
          aria-label="Save"
          icon={<CheckIcon />}
          colorScheme="blue"
          mr={2}
          onClick={updateList}
          isLoading={saveLoading}
          isDisabled={saveLoading}
        />
      </Flex>

      <ManageListForm
        list={list}
        onChange={setPartial}
        shareInviteLink={shareInviteLink}
      />

      <Box p={4}>
        <Button
          variant="outline"
          color="red.400"
          width="100%"
          isLoading={deleteLoading}
          isDisabled={deleteLoading}
          onClick={deleteList}
        >
          Delete list
        </Button>
      </Box>
    </div>
  );
}

export default ManageList;

interface ManageListFormProps {
  list: List;
  onChange: (partial: Partial<List>) => void;
  shareInviteLink: () => Promise<void>;
}

function ManageListForm({
  list,
  onChange,
  shareInviteLink,
}: ManageListFormProps) {
  const [name, setName] = useState(list.name);
  const [users] = useState<string[]>(list.users);
  const { user } = useAuth();
  const [shareLoading, setShareLoading] = useState(false);

  useEffect(() => {
    onChange({
      name,
      users,
    });
  }, [name, users, onChange]);

  async function onSendInviteLinkClick() {
    setShareLoading(true);

    await shareInviteLink();

    setShareLoading(false);
  }

  return (
    <>
      <Box p={4}>
        <Text as="label" fontWeight="bold">
          Name
        </Text>

        <Input
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
          placeholder="List name"
          isRequired={true}
        />
      </Box>

      <Box px={4}>
        <Button
          leftIcon={<LinkIcon />}
          onClick={onSendInviteLinkClick}
          width="100%"
          isLoading={shareLoading}
          isDisabled={shareLoading}
        >
          Create and send invite link
        </Button>
      </Box>

      {users.map((userId) => (
        <Box key={userId} p={4}>
          <Text size="sm" fontWeight={600}>
            <ProfileName uid={userId} /> {userId === user?.uid ? "(You)" : ""}
          </Text>
        </Box>
      ))}
    </>
  );
}
