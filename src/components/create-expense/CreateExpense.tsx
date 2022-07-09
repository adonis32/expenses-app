import { useState, useCallback } from "react";
import * as React from "react";
import {
  Flex,
  IconButton,
  Box,
  Text,
  Input,
  Spacer,
  useToast,
} from "@chakra-ui/react";
import { useHistory, useRouteMatch } from "react-router-dom";
import { useListById } from "../../context/list";
import { useAuth } from "../../context/auth";
import { CloseIcon, CheckIcon } from "@chakra-ui/icons";
import { offlineAwait } from "../../lib/offline";
import CurrencyInput, { CurrencyInputProps } from "react-currency-input-field";

function CreateExpense() {
  const match = useRouteMatch<{ listId: string }>();
  const { listId } = match.params;
  const history = useHistory();
  const list = useListById(listId);
  const [name, setName] = useState("");
  const [expense, setExpense] = useState(1);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const createExpense = useCallback(async () => {
    if (!list || !user) {
      return;
    }

    const ref = list.__ref;

    if (!name) {
      toast({
        status: "error",
        title: "A name for the expense is required",
        position: "top",
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    await offlineAwait(
      ref.collection("expenses").add({
        name,
        expense,
        user: user.uid,
        createdOn: Date.now(),
      })
    );

    setLoading(false);

    history.goBack();
  }, [name, expense, list, user, history, toast]);

  const onExpenseValueChange: CurrencyInputProps["onValueChange"] = (
    _,
    __,
    values
  ) => {
    const float = values?.float;

    if (float) {
      setExpense(float);
    }
  };

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

        <Input
          as={CurrencyInput}
          defaultValue={1.0}
          intlConfig={{ locale: "es-ES", currency: "EUR" }}
          onValueChange={onExpenseValueChange}
          allowDecimals={true}
          autoFocus={true}
        />

        <Spacer h={4} />

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
