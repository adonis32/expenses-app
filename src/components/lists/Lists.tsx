import React from "react";
import { useList } from "../../context/list";
import { Box, Heading, IconButton, Flex } from "@chakra-ui/core";
import { Link, useHistory } from "react-router-dom";

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
        <IconButton
          aria-label="Close"
          icon="close"
          ml={1}
          backgroundColor="transparent"
          onClick={() => history.goBack()}
        />

        <Flex py={4} px={2} alignItems="center">
          <Heading as="h2" size="sm">
            Lists
          </Heading>
        </Flex>

        <IconButton
          ml="auto"
          aria-label="Create list"
          icon="add"
          variantColor="blue"
          mr={2}
          onClick={() => history.push("/list/create")}
        />
      </Flex>

      {lists.map(list => (
        <Link key={list.__ref.id} to={`/list/${list.__ref.id}`}>
          <Box p={4} cursor="pointer">
            <Heading as="h2" size="sm">
              {list.name}
            </Heading>
          </Box>
        </Link>
      ))}
    </Box>
  );
}

export default Lists;
