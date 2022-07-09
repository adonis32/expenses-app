import { useRouteMatch, useHistory } from "react-router-dom";
import ExpenseProvider, { useExpense } from "../../context/expense";
import { Box, Heading, Text, Flex, IconButton } from "@chakra-ui/react";
import { useListById, useIsListAdmin } from "../../context/list";
import { useAuth } from "../../context/auth";
import ProfileName from "../profile-name";
import { AddIcon, AtSignIcon, CloseIcon } from "@chakra-ui/icons";
import { calculateLogStats } from "../../lib/expenses";
import DiffValue from "../diff-value";
import HyperScroller from "react-hyper-scroller";
import { useRef } from "react";

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

  const scrollViewRef = useRef<HTMLDivElement>(null);

  if (!user) return null;

  const { userTotal, diffGroup, diffToEachParticipant } = calculateLogStats(
    user,
    expenses
  );

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

      <Box flex="1" overflowY="scroll" ref={scrollViewRef}>
        <HyperScroller estimatedItemHeight={98} targetView={scrollViewRef}>
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
        </HyperScroller>
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

          <DiffValue diff={diffGroup} fontSize="md" pt={1} />

          <DiffValue diff={diffToEachParticipant} fontSize="md" pt={1} />
        </Flex>
      </Flex>
    </Flex>
  );
}
