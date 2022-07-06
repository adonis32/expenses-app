import React, { useState, useCallback } from "react";
import {
  Flex,
  IconButton,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Box,
  Text,
  Input,
} from "@chakra-ui/react";
import { useHistory, useRouteMatch } from "react-router-dom";
import { useListById } from "../../context/list";
import { useAuth } from "../../context/auth";
import { CloseIcon, CheckIcon } from "@chakra-ui/icons";

function CreateExpense() {
  const match = useRouteMatch<{ listId: string }>();
  const { listId } = match.params;
  const history = useHistory();
  const list = useListById(listId);
  const [name, setName] = useState("");
  const [expense, setExpense] = useState(1);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const createExpense = useCallback(async () => {
    if (!list || !user) {
      return;
    }

    const ref = list.__ref;

    setLoading(true);

    await ref.collection("expenses").add({
      name,
      expense,
      user: user.uid,
      createdOn: Date.now(),
    });

    setLoading(false);

    history.goBack();
  }, [name, expense, list, user, history]);

  return (
    <div>
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
            Add expense to {list?.name}
          </Text>
        </Flex>

        <IconButton
          ml="auto"
          aria-label="Save"
          icon={<CheckIcon />}
          colorScheme="blue"
          mr={2}
          onClick={createExpense}
          isLoading={loading}
          isDisabled={loading}
        />
      </Flex>

      <Box p={4}>
        <Text as="label" fontWeight="bold">
          Expense
        </Text>

        <NumberInput
          aria-label="Expense"
          value={expense}
          min={0.01}
          precision={2}
          step={1}
          onChange={(value) => setExpense(Number(value))}
        >
          <NumberInputField type="number" />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>

        <br />

        <Text as="label" fontWeight="bold">
          Name
        </Text>

        <Input
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
          placeholder="Expense name"
          isRequired={true}
        />
      </Box>
    </div>
  );
}

export default CreateExpense;
