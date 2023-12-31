import { useState, useCallback } from "react";
import * as React from "react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../context/auth";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { Flex, IconButton, Box, Input, Text } from "@chakra-ui/react";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { offlineAwait } from "../../lib/offline";

function CreateList() {
  const history = useHistory();
  const [name, setName] = useState("");
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const createList = useCallback(async () => {
    if (!user) {
      return;
    }

    setLoading(true);

    await offlineAwait(
      firebase
        .firestore()
        .collection("lists")
        .add({
          name,
          users: [user.uid],
          permissions: {
            admin: user.uid,
          },
          createdOn: Date.now(),
        })
    );

    setLoading(false);

    history.goBack();
  }, [name, user, history]);

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
            Create list
          </Text>
        </Flex>

        <IconButton
          ml="auto"
          aria-label="Save"
          icon={<CheckIcon />}
          colorScheme="blue"
          mr={2}
          onClick={createList}
          isLoading={loading}
          isDisabled={loading}
        />
      </Flex>

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
    </div>
  );
}

export default CreateList;
