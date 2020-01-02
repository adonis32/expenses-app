import React, { useState, useCallback, useEffect } from "react";
import {
  Flex,
  IconButton,
  Heading,
  Box,
  Text,
  Input,
  Button
} from "@chakra-ui/core";
import { useHistory, useRouteMatch, Redirect } from "react-router-dom";
import { useListById, List, useIsListAdmin } from "../../context/list";
import { useAuth } from "../../context/auth";
import nanoid from "nanoid";
import ProfileName from "../profile-name";

function ManageList() {
  const match = useRouteMatch<{ listId: string }>();
  const { listId } = match.params;
  const history = useHistory();
  const list = useListById(listId);
  const isAdmin = useIsListAdmin(listId);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [partial, setPartial] = useState<Partial<List>>({});

  const updateList = useCallback(async () => {
    if (!list || !user) {
      return;
    }

    const ref = list.__ref;

    setLoading(true);

    await ref.update(partial);

    setLoading(false);

    history.goBack();
  }, [list, user, history, partial]);

  const shareInviteLink = useCallback(async () => {
    if (!list) {
      return;
    }

    const code = nanoid();
    const ref = list.__ref;

    await ref.update({ code });

    const url = `${process.env.PUBLIC_URL}/list/join?id=${ref.id}&code=${code}`;

    if (navigator.share) {
      await navigator.share({
        text: `Join ${list.name} at ExpensesApp!`,
        url
      });
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);

      alert("Link copied to your clipboard!");
    } else {
      prompt("Send this link to the people you wanna invite", url);
    }
  }, [list]);

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
          icon="close"
          ml={1}
          backgroundColor="transparent"
          onClick={() => history.goBack()}
        />

        <Flex py={4} px={2} alignItems="center">
          <Heading as="h2" size="sm">
            Manage {list?.name}
          </Heading>
        </Flex>

        <IconButton
          ml="auto"
          aria-label="Save"
          icon="check"
          variantColor="blue"
          mr={2}
          onClick={updateList}
          isLoading={loading}
          isDisabled={loading}
        />
      </Flex>

      <ManageListForm
        list={list}
        onChange={setPartial}
        shareInviteLink={shareInviteLink}
      />
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
  shareInviteLink
}: ManageListFormProps) {
  const [name, setName] = useState(list.name);
  const [users] = useState<string[]>(list.users);
  const { user } = useAuth();
  const [shareLoading, setShareLoading] = useState(false);

  useEffect(() => {
    onChange({
      name,
      users
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
          leftIcon="link"
          onClick={onSendInviteLinkClick}
          width="100%"
          isLoading={shareLoading}
          isDisabled={shareLoading}
        >
          Create and send invite link
        </Button>
      </Box>

      {users.map(userId => (
        <Box key={userId} p={4}>
          <Heading as="h4" size="sm">
            <ProfileName uid={userId} /> {userId === user?.uid ? "(You)" : ""}
          </Heading>
        </Box>
      ))}
    </>
  );
}
