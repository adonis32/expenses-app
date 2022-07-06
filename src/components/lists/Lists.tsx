import React from "react";
import { useList } from "../../context/list";
import {
  Box,
  Flex,
  Text,
  Button,
  useColorModeValue as mode,
  Icon,
  Spacer,
  VStack,
  AvatarGroup,
} from "@chakra-ui/react";
import { Link, useHistory } from "react-router-dom";
import Logo from "../logo";
import { PlusCircle } from "react-feather";
import ProfileAvatar from "../profile-avatar";

function Lists() {
  const { lists } = useList();
  const history = useHistory();

  return (
    <Box margin="0 auto" maxWidth="4xl" height="100%" p="8">
      <Flex alignItems="center">
        <Logo
          boxSize={{ base: "32px", md: "56px" }}
          fontSize={{ base: "16px", md: "30px" }}
        />

        <Text
          as="h1"
          ml="4"
          lineHeight="1"
          fontWeight="bold"
          fontSize={{ base: "20px", md: "40px" }}
          height={{ base: "20px", md: "40px" }}
        >
          Expense Lists
        </Text>
      </Flex>

      <Spacer h={8} />

      <Button
        width="full"
        onClick={() => history.push("/list/create")}
        rounded="2xl"
        px="6"
        height="64px"
        color="white"
        boxShadow="md"
        bgGradient={mode(
          `linear(to-r, brand.400, brand.600)`,
          `linear(to-r, brand.600, brand.800)`
        )}
        _hover={{
          bgGradient: mode(
            `linear(to-r, brand.500, brand.700)`,
            `linear(to-r, brand.500, brand.700)`
          ),
        }}
        _activeLink={{
          bgGradient: mode(
            `linear(to-r, brand.500, brand.700)`,
            `linear(to-r, brand.700, brand.800)`
          ),
        }}
      >
        <Flex alignItems="center" justifyContent="space-between" width="full">
          <Text lineHeight="1" fontSize={"20px"} height={"20px"}>
            Create a new list
          </Text>

          <Icon as={PlusCircle} boxSize="28px" opacity={0.9} />
        </Flex>
      </Button>

      <Spacer h={6} />

      <VStack spacing="4">
        {lists.map((list) => (
          <Box
            as={Link}
            key={list.__ref.id}
            to={`/list/${list.__ref.id}`}
            px={6}
            py={6}
            cursor="pointer"
            bgColor="white"
            width="full"
            rounded="2xl"
            boxShadow="sm"
          >
            <Text as="h2" lineHeight="20px" fontSize={"20px"} fontWeight={500}>
              {list.name}
            </Text>

            <Spacer h={4} />

            <Text
              as="h2"
              lineHeight="1"
              fontSize={"12px"}
              height={"12px"}
              fontWeight={500}
              color="gray.500"
            >
              Members
            </Text>

            <Spacer h={2} />

            <AvatarGroup size="sm" max={3}>
              {list.users.map((user) => (
                <ProfileAvatar key={user} uid={user} />
              ))}
            </AvatarGroup>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}

export default Lists;
