import { useRouteMatch, useHistory } from "react-router-dom";
import ExpenseProvider, { useExpense } from "../../context/expense";
import {
  Box,
  Text,
  Flex,
  IconButton,
  Spacer,
  Button,
  Icon,
  useColorModeValue as mode,
} from "@chakra-ui/react";
import { useListById, useIsListAdmin } from "../../context/list";
import { useAuth } from "../../context/auth";
import ProfileName from "../profile-name";
import { AddIcon, AtSignIcon, CloseIcon } from "@chakra-ui/icons";
import { calculateLogStatsOfUser } from "../../lib/expenses";
import HyperScroller from "react-hyper-scroller";
import { ArrowRight } from "react-feather";
import DiffValue from "../diff-value";

function ExpenseLog() {
  const match = useRouteMatch<{ listId: string }>();
  const { listId } = match.params;

  return (
    <ExpenseProvider listId={listId}>
      <ExpenseList listId={listId} />
    </ExpenseProvider>
  );
}

export default ExpenseLog;

interface ExpenseListProps {
  listId: string;
}

function ExpenseList({ listId }: ExpenseListProps) {
  const { user } = useAuth();
  const { expenses } = useExpense();
  const list = useListById(listId);
  const isAdmin = useIsListAdmin(listId);
  const history = useHistory();

  if (!user) return null;
  if (!list) return null;

  const { owedToUser, userOwes } = calculateLogStatsOfUser(
    user.uid,
    list.users,
    expenses
  );

  return (
    <Box margin="0 auto" maxWidth="4xl" height="100%" p="8">
      <Flex alignItems="center">
        <IconButton
          aria-label="Close"
          icon={<CloseIcon />}
          ml={1}
          rounded="full"
          onClick={() => history.goBack()}
        />

        <Text
          as="h1"
          ml="4"
          lineHeight="1"
          fontWeight="bold"
          fontSize={{ base: "20px", md: "40px" }}
          height={{ base: "20px", md: "40px" }}
        >
          {list?.name}
        </Text>

        <Flex ml="auto">
          {isAdmin && (
            <IconButton
              aria-label="Manage list"
              icon={<AtSignIcon />}
              rounded="full"
              mr={2}
              onClick={() => history.push(`/list/${listId}/manage`)}
            />
          )}

          <IconButton
            aria-label="Add expense"
            icon={<AddIcon />}
            colorScheme="blue"
            onClick={() => history.push(`/list/${listId}/create`)}
            zIndex={1}
            rounded="full"
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
          />
        </Flex>
      </Flex>

      <Spacer h={8} />

      <Box bgColor="white" rounded="xl" boxShadow="md">
        <Box px={6} py={4}>
          <Text fontSize="sm" fontWeight={500} whiteSpace="pre-wrap">
            You owe a total of{"\n"}
            <DiffValue
              as="span"
              fontSize="lg"
              positiveColor="red.500"
              fontWeight={700}
              diff={userOwes}
            />
          </Text>

          <Spacer h={2} />

          <Text fontSize="sm" fontWeight={500} whiteSpace="pre-wrap">
            The group owes you a total of{"\n"}
            <DiffValue
              as="span"
              fontSize="lg"
              fontWeight={700}
              diff={owedToUser}
            />
          </Text>
        </Box>

        <Flex
          justifyContent="flex-end"
          borderTopWidth={1}
          borderTopColor="gray.100"
          px={6}
          py={4}
        >
          <Button
            variant="link"
            color="brand.500"
            rightIcon={<Icon as={ArrowRight} />}
            fontSize="sm"
          >
            View details & how to pay
          </Button>
        </Flex>
      </Box>

      <Spacer h={6} />

      <HyperScroller estimatedItemHeight={98}>
        {expenses.map((expense, index) => {
          const date = new Date(expense.createdOn);

          const itsMine = user.uid === expense.user;

          return (
            <Flex
              key={expense.__ref.id}
              py={4}
              px={6}
              alignItems="center"
              width="100%"
              bgColor="white"
              rounded="xl"
              boxShadow="md"
              marginTop={index === 0 ? 0 : 4}
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                width="6px"
                height="full"
                bgColor={itsMine ? "blue.500" : "gray.200"}
                top={0}
                left={0}
              />
              <Flex flexDirection="column" flex="1">
                <Text as="h2" fontSize="md" fontWeight={500}>
                  {expense.name}
                </Text>
                <Text
                  as="span"
                  fontSize="sm"
                  color={itsMine ? "blue.500" : "gray.500"}
                  fontWeight={itsMine ? "bold" : undefined}
                >
                  <ProfileName uid={expense.user} />
                </Text>
                <Text as="span" fontSize="sm" color="gray.500">
                  {date.toLocaleDateString()} {date.toLocaleTimeString()}
                </Text>
              </Flex>

              <Text as="span" fontSize="lg" color="green.500">
                {expense.expense}€
              </Text>
            </Flex>
          );
        })}
      </HyperScroller>

      <Spacer h={6} />
    </Box>
  );
}
