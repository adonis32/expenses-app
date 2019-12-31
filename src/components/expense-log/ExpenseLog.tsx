import React from "react";
import { useRouteMatch, useHistory } from "react-router-dom";
import ExpenseProvider, { useExpense, Expense } from "../../context/expense";
import { Box, Heading, Text, Flex, IconButton } from "@chakra-ui/core";
import { useListById } from "../../context/list";
import { useAuth } from "../../context/auth";

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
  const history = useHistory();

  if (!user) return null;

  const groupedExpenses = expenses.reduce((prev, next) => {
    const prevExpenses = prev[next.user] ?? [];

    return {
      ...prev,
      [next.user]: [...prevExpenses, next]
    };
  }, {} as Record<string, Expense[]>);

  const {
    [user.uid]: userExpenses = [],
    ...otherUserExpenses
  } = groupedExpenses;

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

  const diff = userTotal - otherUsersTotalMedian;

  return (
    <Flex height="100%" flexDirection="column">
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
            {list?.name}
          </Heading>
        </Flex>

        <IconButton
          ml="auto"
          aria-label="Add expense"
          icon="add"
          mr={2}
          onClick={() => history.push(`/list/${listId}/create`)}
        />
      </Flex>

      <Box flex="1" overflowY="scroll">
        {expenses.map(expense => (
          <Flex key={expense.__ref.id} p={4} alignItems="center" width="100%">
            <Flex flexDirection="column" flex="1">
              <Heading as="h2" size="sm">
                {expense.name}
              </Heading>
              <Text as="span" fontSize="xs" color="gray.500">
                {expense.user}
              </Text>
            </Flex>

            <Text as="span" fontSize="md" color="green.500">
              {expense.expense}€
            </Text>
          </Flex>
        ))}
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
          <Heading as="h2" size="md">
            Your expenses
          </Heading>

          <Heading as="h4" size="sm" color="gray.600">
            Difference
          </Heading>
        </Flex>

        <Flex
          flexDirection="column"
          justifyContent="space-between"
          alignItems="flex-end"
          height="100%"
        >
          <Text as="span" fontSize="md" color="blue.500">
            {userTotal}€
          </Text>

          <DiffValue diff={diff} />
        </Flex>
      </Flex>
    </Flex>
  );
}

function DiffValue({ diff }: { diff: number }) {
  const value = isNaN(diff) ? 0 : diff;
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
    <Text as="span" fontSize="sm" color={color}>
      {value}€
    </Text>
  );
}

function expensesTotal(expenses: Expense[]) {
  return expenses.reduce((prev, next) => prev + next.expense, 0);
}
