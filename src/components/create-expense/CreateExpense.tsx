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
import { convertToCents } from "../../lib/expenses";
import { ExpenseV2 } from "../../context/expense";

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

    const splittedWith = Object.fromEntries(
      list.users.map((user) => [user, 1 / list.users.length])
    );

    const raw: Omit<ExpenseV2, "__ref"> = {
      name,
      expense: convertToCents(expense),
      user: user.uid,
      paidBy: user.uid,
      splittedWith,
      createdOn: Date.now(),
      version: 2,
      currency: "EUR",
    };

    await offlineAwait(ref.collection("expenses").add(raw));

    setLoading(false);

    history.goBack();
  }, [name, expense, list, user, history, toast]);

  const intl = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  });

  const decimalSeparator = intl.format(0.1).charAt(1);

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
          transformRawValue={(raw: string) => {
            return raw.replace(".", decimalSeparator);
          }}
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
