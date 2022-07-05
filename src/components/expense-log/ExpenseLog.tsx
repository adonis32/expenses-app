import React from "react";
import { useRouteMatch, useHistory } from "react-router-dom";
import ExpenseProvider, { useExpense, Expense } from "../../context/expense";
import { Box, Heading, Text, Flex, IconButton } from "@chakra-ui/react";
import { useListById, useIsListAdmin } from "../../context/list";
import { useAuth } from "../../context/auth";
import ProfileName from "../profile-name";
import { AddIcon, AtSignIcon, CloseIcon } from "@chakra-ui/icons";

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

  const groupedExpenses = expenses.reduce((prev, next) => {
    const prevExpenses = prev[next.user] ?? [];

    return {
      ...prev,
      [next.user]: [...prevExpenses, next],
    };
  }, {} as Record<string, Expense[]>);

  const { [user.uid]: userExpenses = [], ...otherUserExpenses } =
    groupedExpenses;

  const otherUsersTotalEntries = Object.entries(otherUserExpenses).map(
    ([user, expenses]) => {
      return [user, expensesTotal(expenses)];
    }
  );

  const otherUsersTotal: Record<string, number> = Object.fromEntries(
    otherUsersTotalEntries
  );

  const otherUsersTotalMedian =
    Object.values(otherUsersTotal).reduce((prev, next) => prev + next, 0) /
    otherUsersTotalEntries.length;

  const userTotal = expensesTotal(userExpenses);
  const diffGroup = userTotal - otherUsersTotalMedian;
  const diffToEachParticipant =
    diffGroup / (Object.keys(otherUsersTotal).length + 1);

  return (
    <Flex height="100%" flexDirection="column">
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
            {list?.name}
          </Text>
        </Flex>

        <Flex ml="auto">
          {isAdmin && (
            <IconButton
              aria-label="Manage list"
              icon={<AtSignIcon />}
              variant="ghost"
              mr={2}
              onClick={() => history.push(`/list/${listId}/manage`)}
            />
          )}

          <IconButton
            aria-label="Add expense"
            icon={<AddIcon />}
            colorScheme="blue"
            mr={2}
            onClick={() => history.push(`/list/${listId}/create`)}
          />
        </Flex>
      </Flex>

      <Box flex="1" overflowY="scroll">
        {expenses.map((expense) => {
          const date = new Date(expense.createdOn);

          const itsMine = user.uid === expense.user;

          return (
            <Flex
              key={expense.__ref.id}
              p={4}
              alignItems="center"
              width="100%"
              borderLeftWidth="6px"
              borderLeftColor={itsMine ? "blue.500" : "gray.200"}
              backgroundColor={itsMine ? "blue.50" : "transparent"}
            >
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
      </Box>

      <Flex
        justifyContent="space-between"
        alignItems="center"
        p={4}
        borderTopColor="gray.200"
        borderTopWidth={1}
      >
        <Flex
          flexDirection="column"
          justifyContent="space-between"
          height="100%"
        >
          <Heading as="h2" size="xs">
            Your expenses
          </Heading>

          <Text as="h3" pt={1} color="gray.600">
            Difference with the group
          </Text>

          <Text as="h3" pt={1} color="gray.600">
            Difference with each participant
          </Text>
        </Flex>

        <Flex
          flexDirection="column"
          justifyContent="space-between"
          alignItems="flex-end"
          height="100%"
        >
          <Text as="span" fontSize="xl" color="blue.500">
            {Math.fround(userTotal).toFixed(2)}€
          </Text>

          <DiffValue diff={diffGroup} />

          <DiffValue diff={diffToEachParticipant} />
        </Flex>
      </Flex>
    </Flex>
  );
}

function DiffValue({ diff }: { diff: number }) {
  const value = isNaN(diff) ? 0 : Number(diff.toFixed(2));
  let color: string;

  switch (true) {
    case value > 0:
      color = "green.400";
      break;
    case value < 0:
      color = "red.400";
      break;
    default:
      color = "gray.500";
  }

  return (
    <Text as="span" fontSize="md" pt={1} color={color}>
      {value}€
    </Text>
  );
}

function expensesTotal(expenses: Expense[]) {
  return expenses.reduce((prev, next) => prev + next.expense, 0);
}
