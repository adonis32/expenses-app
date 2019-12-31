import React, { useState, useCallback, useEffect } from "react";
import { Flex, IconButton, Heading, Box, Text, Input } from "@chakra-ui/core";
import { useHistory, useRouteMatch } from "react-router-dom";
import { useListById, List } from "../../context/list";
import { useAuth } from "../../context/auth";

function ManageList() {
  const match = useRouteMatch<{ listId: string }>();
  const { listId } = match.params;
  const history = useHistory();
  const list = useListById(listId);
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

  if (!list) {
    return null;
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

      <ManageListForm list={list} onChange={setPartial} />
    </div>
  );
}

export default ManageList;

interface ManageListFormProps {
  list: List;
  onChange: (partial: Partial<List>) => void;
}

function ManageListForm({ list, onChange }: ManageListFormProps) {
  const [name, setName] = useState(list.name);
  const [users, setUsers] = useState<string[]>(list.users);
  const { user } = useAuth();

  useEffect(() => {
    onChange({
      name,
      users
    });
  }, [name, users, onChange]);

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

      {users.map(userId => (
        <Box key={userId} p={4}>
          <Heading as="h4" size="sm">
            {userId} {userId === user?.uid ? "(You)" : ""}
          </Heading>
        </Box>
      ))}

      <Box p={4}>
        <Text as="label" fontWeight="bold">
          Add user:
        </Text>

        <Input
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setUsers(current => [...current, e.target.value])
          }
          placeholder="User ID"
        />
      </Box>
    </>
  );
}
