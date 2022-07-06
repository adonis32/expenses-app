import React from "react";
import { useList } from "../../context/list";
import { Box, IconButton, Flex, Text } from "@chakra-ui/react";
import { Link, useHistory } from "react-router-dom";
import { AddIcon } from "@chakra-ui/icons";

function Lists() {
  const { lists } = useList();
  const history = useHistory();

  return (
    <Box>
      <Flex
        alignItems="center"
        borderBottomColor="gray.200"
        borderBottomWidth={1}
      >
        <Flex py={4} px={4} alignItems="center">
          <Text as="h1" size="sm" fontWeight={600}>
            Lists
          </Text>
        </Flex>

        <IconButton
          ml="auto"
          aria-label="Create list"
          icon={<AddIcon />}
          colorScheme="blue"
          mr={2}
          onClick={() => history.push("/list/create")}
        />
      </Flex>

      {lists.map((list) => (
        <Link key={list.__ref.id} to={`/list/${list.__ref.id}`}>
          <Box p={4} cursor="pointer">
            <Text as="h2" fontSize="lg" fontWeight={400}>
              {list.name}
            </Text>
          </Box>
        </Link>
      ))}
    </Box>
  );
}

export default Lists;
