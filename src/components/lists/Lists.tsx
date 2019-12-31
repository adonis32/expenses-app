import React from "react";
import { useList } from "../../context/list";
import { Box, Heading } from "@chakra-ui/core";
import { Link } from "react-router-dom";

function Lists() {
  const { lists } = useList();

  return (
    <Box>
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
