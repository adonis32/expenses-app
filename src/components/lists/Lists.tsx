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
  Grid,
  GridItem,
  HStack,
} from "@chakra-ui/react";
import { Link, useHistory } from "react-router-dom";
import Logo from "../logo";
import { ArrowRight, PlusCircle } from "react-feather";
import ProfileAvatar from "../profile-avatar";
import ExpenseProvider, { useExpense } from "../../context/expense";
import { useAuth } from "../../context/auth";
import DiffValue from "../diff-value";
import { calculateLogStatsOfUser } from "../../lib/expenses";
import { Users as UserGroupIcon } from "react-feather";

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
        px="6"
        height="64px"
        rounded="2xl"
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

            <Grid templateColumns="1.25fr 1fr">
              <GridItem>
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
              </GridItem>

              <GridItem display="flex" alignItems="center">
                <ExpenseProvider listId={list.__ref.id}>
                  <ListStats users={list.users} />
                </ExpenseProvider>
              </GridItem>
            </Grid>
          </Box>
        ))}
      </VStack>

      <Spacer h={6} />
    </Box>
  );
}

export default Lists;

interface ListStatsProps {
  users: string[];
}

function ListStats({ users }: ListStatsProps) {
  const { user } = useAuth();
  const { expenses } = useExpense();

  if (!user) {
    return null;
  }

  if (!expenses.length) {
    return null;
  }

  const { userOwes, owedToUser } = calculateLogStatsOfUser(
    user.uid,
    users,
    expenses
  );

  const userElement = <ProfileAvatar uid={user.uid} boxSize="18px" />;
  const groupElement = (
    <Icon as={UserGroupIcon} boxSize="16px" color="gray.500" />
  );

  return (
    <Grid templateColumns="1fr 1fr" rowGap="2" width="full">
      <GridItem
        as={HStack}
        spacing={1}
        justifyContent="flex-start"
        alignItems="center"
      >
        {userElement}

        <Icon as={ArrowRight} boxSize="12px" color="gray.500" />

        {groupElement}
      </GridItem>

      <GridItem display="flex" justifyContent="flex-end" alignItems="center">
        <DiffValue
          diff={userOwes}
          positiveColor="red.500"
          lineHeight="12px"
          fontSize={"14px"}
          mt="1px"
        />
      </GridItem>

      <GridItem
        as={HStack}
        spacing={1}
        justifyContent="flex-start"
        alignItems="center"
      >
        {groupElement}

        <Icon as={ArrowRight} boxSize="12px" color="gray.500" />

        {userElement}
      </GridItem>

      <GridItem display="flex" justifyContent="flex-end" alignItems="center">
        <DiffValue
          diff={owedToUser}
          lineHeight="12px"
          fontSize={"14px"}
          mt="1px"
        />
      </GridItem>
    </Grid>
  );
}
