import { CloseIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Icon,
  IconButton,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Check } from "react-feather";
import { useHistory, useRouteMatch } from "react-router-dom";
import { useAuth } from "../../context/auth";
import ExpenseProvider, { useExpense } from "../../context/expense";
import { useListById } from "../../context/list";
import { calculateLogStatsOfUser } from "../../lib/expenses";
import DiffValue from "../diff-value";
import ProfileAvatar from "../profile-avatar";
import ProfileName from "../profile-name";
import Dinero from "dinero.js";
import { CreateExpenseLocationState } from "../create-expense";

function ListUserStats() {
  const match = useRouteMatch<{ listId: string }>();
  const { listId } = match.params;

  return (
    <ExpenseProvider listId={listId}>
      <ListUserStatsUi listId={listId} />
    </ExpenseProvider>
  );
}

export default ListUserStats;

interface ListUserStatsUiProps {
  listId: string;
}

function ListUserStatsUi({ listId }: ListUserStatsUiProps) {
  const { user } = useAuth();
  const { expenses } = useExpense();
  const history = useHistory();
  const list = useListById(listId);

  if (!user) return null;
  if (!list) return null;

  const userUid = user.uid;

  const { owedToUser, userOwes, diffs } = calculateLogStatsOfUser(
    userUid,
    list.users,
    expenses
  );

  const userOwesMap = Object.entries(diffs)
    .filter(([uid, diff]) => {
      return diff.diffUnsplitted.getAmount() < 0;
    })
    .map(([uid, diff]) => {
      return {
        uid,
        amount: Dinero({
          amount: Math.abs(diff.diffUnsplitted.getAmount()),
        }),
      };
    });

  const owedToUserMap = Object.entries(diffs)
    .filter(([uid, diff]) => {
      return diff.diffUnsplitted.getAmount() > 0;
    })
    .map(([uid, diff]) => {
      return {
        uid,
        amount: Dinero({
          amount: Math.abs(diff.diffUnsplitted.getAmount()),
        }),
      };
    });

  function markAsPaid(uid: string, amount: number) {
    const state: CreateExpenseLocationState = {
      paidFor: {
        [uid]: 1,
        [userUid]: 0,
      },
      amount,
      name: "Expenses debt payment",
      autoCreate: true,
    };

    history.push(`/list/${listId}/create`, state);
  }

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
          Your stats for {list?.name}
        </Text>
      </Flex>

      <Spacer h={8} />

      <Box bgColor="white" rounded="xl" boxShadow="md" px={6} py={4}>
        <Text fontSize="lg" fontWeight={500} whiteSpace="pre-wrap">
          You owe a total of{"\n"}
          <DiffValue
            as="span"
            fontSize="2xl"
            positiveColor="red.500"
            fontWeight={700}
            diff={userOwes}
          />
        </Text>

        <Spacer h={4} />

        <VStack>
          {userOwesMap.map(({ uid, amount }) => (
            <ActionableItem
              key={uid}
              uid={uid}
              amount={amount}
              onMarkAsCompleted={() => markAsPaid(uid, amount.getAmount())}
            />
          ))}
        </VStack>
      </Box>

      <Spacer h={6} />

      <Box bgColor="white" rounded="xl" boxShadow="md" px={6} py={4}>
        <Text fontSize="lg" fontWeight={500} whiteSpace="pre-wrap">
          The group owes you a total of{"\n"}
          <DiffValue
            as="span"
            fontSize="2xl"
            fontWeight={700}
            diff={owedToUser}
          />
        </Text>

        <Spacer h={4} />

        <VStack>
          {owedToUserMap.map(({ uid, amount }) => (
            <NonActionableItem key={uid} uid={uid} amount={amount} />
          ))}
        </VStack>
      </Box>
    </Box>
  );
}

interface ActionableItemProps {
  uid: string;
  amount: Dinero.Dinero;
  onMarkAsCompleted: () => void;
}

function ActionableItem({
  uid,
  amount,
  onMarkAsCompleted,
}: ActionableItemProps) {
  return (
    <Box p="4" width="full" flexWrap="wrap" bgColor="gray.50" rounded="lg">
      <Text
        display="inline-flex"
        fontSize="lg"
        alignItems="center"
        flexWrap="wrap"
        gap="1"
      >
        <Text flexShrink={0} mr={1}>
          Pay{" "}
          <DiffValue diff={amount} positiveColor="red.500" fontWeight="500" />{" "}
          to
        </Text>
        <Box
          display="inline-flex"
          alignItems="center"
          bgColor="gray.200"
          pr="2"
          rounded="full"
          fontSize="lg"
        >
          <ProfileAvatar uid={uid} boxSize="7" mr="1" />{" "}
          <Text isTruncated={true}>
            <ProfileName uid={uid} />
          </Text>
        </Box>
      </Text>

      <Spacer h={4} />

      <Box>
        <Button
          size="md"
          variant="link"
          colorScheme="green"
          rightIcon={<Icon as={Check} />}
          onClick={onMarkAsCompleted}
        >
          Mark as completed
        </Button>
      </Box>
    </Box>
  );
}

interface NonActionableItemProps {
  uid: string;
  amount: Dinero.Dinero;
}

function NonActionableItem({ uid, amount }: NonActionableItemProps) {
  return (
    <Box
      width="full"
      display="flex"
      p="4"
      flexWrap="wrap"
      alignItems="center"
      bgColor="gray.50"
      rounded="lg"
      gap="1"
    >
      <Box
        display="inline-flex"
        alignItems="center"
        bgColor="gray.200"
        pr="2"
        rounded="full"
        fontSize="lg"
      >
        <ProfileAvatar uid={uid} boxSize="7" mr="1" />{" "}
        <Text isTruncated={true}>
          <ProfileName uid={uid} />
        </Text>
      </Box>

      <Text
        display="inline-flex"
        fontSize="lg"
        alignItems="center"
        flexWrap="wrap"
        gap="1"
      >
        <Text flexShrink={0} mr={1}>
          has to pay you <DiffValue diff={amount} fontWeight="500" />
        </Text>
      </Text>
    </Box>
  );
}
