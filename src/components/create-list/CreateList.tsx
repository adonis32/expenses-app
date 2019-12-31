import React, { useState, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../context/auth";
import firebase from "firebase/app";
import { Flex, IconButton, Heading, Box, Input, Text } from "@chakra-ui/core";

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

    await firebase
      .firestore()
      .collection("lists")
      .add({
        name,
        users: [user.uid],
        permissions: {
          admin: user.uid
        },
        createdOn: Date.now()
      });

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
          icon="close"
          ml={1}
          backgroundColor="transparent"
          onClick={() => history.goBack()}
        />

        <Flex py={4} px={2} alignItems="center">
          <Heading as="h2" size="sm">
            Create list
          </Heading>
        </Flex>

        <IconButton
          ml="auto"
          aria-label="Save"
          icon="check"
          variantColor="blue"
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
