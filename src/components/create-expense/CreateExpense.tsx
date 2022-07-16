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
  VStack,
} from "@chakra-ui/react";
import { useHistory, useLocation, useRouteMatch } from "react-router-dom";
import { List, useListById } from "../../context/list";
import { useAuth } from "../../context/auth";
import { CloseIcon, CheckIcon } from "@chakra-ui/icons";
import { offlineAwait } from "../../lib/offline";
import CurrencyInput, { CurrencyInputProps } from "react-currency-input-field";
import { convertToCents } from "../../lib/expenses";
import { ExpenseV2 } from "../../context/expense";
import LoadingScreen from "../loading-screen";
import PercentageInputControl from "./PercentageInputControl";
import ProfileAvatar from "../profile-avatar";
import ProfileName from "../profile-name";
import Dinero from "dinero.js";
import DiffValue from "../diff-value";

export interface CreateExpenseLocationState {
  name?: string;
  amount?: number;
  paidFor?: Record<string, number>;
  autoCreate?: boolean;
}

function CreateExpenseScreen() {
  const match = useRouteMatch<{ listId: string }>();
  const { listId } = match.params;
  const list = useListById(listId);

  if (!list) {
    return <LoadingScreen />;
  }

  return <CreateExpense list={list} />;
}

export default CreateExpenseScreen;

interface CreateExpenseProps {
  list: List;
}

function CreateExpense({ list }: CreateExpenseProps) {
  const history = useHistory();
  const { state = {} } = useLocation<CreateExpenseLocationState>();
  const [name, setName] = useState(state.name ?? "");
  const [expense, setExpense] = useState(state.amount ?? 100);
  const [paidFor, setPaidFor] = useState(
    () =>
      state.paidFor ??
      Object.fromEntries(
        list.users.map((user) => [user, 1 / list.users.length])
      )
  );
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

    const raw: Omit<ExpenseV2, "__ref"> = {
      name,
      expense,
      user: user.uid,
      paidBy: user.uid,
      paidFor,
      createdOn: Date.now(),
      version: 2,
      currency: "EUR",
    };

    await offlineAwait(ref.collection("expenses").add(raw));

    setLoading(false);

    history.goBack();
  }, [name, expense, list, user, history, toast, paidFor]);

  const didAutoCreateRef = React.useRef(false);

  React.useEffect(() => {
    if (state.autoCreate && !didAutoCreateRef.current) {
      didAutoCreateRef.current = true;
      createExpense();
    }
  }, [state.autoCreate, createExpense]);

  const changedStackRef = React.useRef<string[]>([]);

  if (state.autoCreate) {
    return <LoadingScreen />;
  }

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
      setExpense(convertToCents(float));
    }
  };

  function onPaidForChange(userId: string, value: number) {
    changedStackRef.current = changedStackRef.current.filter(
      (id) => id !== userId
    );
    changedStackRef.current.push(userId);

    setPaidFor((paidFor) => {
      return adjustPaidFor(
        {
          ...paidFor,
          [userId]: value,
        },
        changedStackRef.current
      );
    });
  }

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

        <Spacer h={4} />

        <Text as="label" fontWeight="bold">
          Share expense with
        </Text>

        <Spacer h={6} />

        <VStack spacing={6}>
          {Object.entries(paidFor).map(([userId, percentage]) => {
            const amountInCurrency = Dinero({
              amount: expense,
              currency: "EUR",
            })
              .multiply(percentage)
              .setLocale("es-ES");

            return (
              <Box
                key={userId}
                p={4}
                bgColor="white"
                rounded="xl"
                boxShadow="lg"
                width="full"
              >
                <Flex alignItems="center" mb={4}>
                  <ProfileAvatar uid={userId} size="sm" />

                  <Text ml="3" lineHeight="16px" fontSize="16px">
                    <ProfileName uid={userId} />
                  </Text>

                  <DiffValue
                    ml="auto"
                    positiveColor="brand.500"
                    diff={amountInCurrency}
                  />
                </Flex>
                <PercentageInputControl
                  value={percentage}
                  onChange={(value) => {
                    onPaidForChange(userId, value);
                  }}
                  valueLabel={amountInCurrency.toFormat("$0.00")}
                />
              </Box>
            );
          })}
        </VStack>

        <Spacer h={6} />
      </Box>
    </div>
  );
}

function adjustPaidFor(paidFor: Record<string, number>, adjustList: string[]) {
  const total = Object.values(paidFor).reduce((a, b) => a + b, 0);

  if (total === 1) {
    return paidFor;
  }

  let diff = 1 - total;
  const keys = Object.keys(paidFor).filter((key) => !adjustList.includes(key));
  adjustList = [...keys, ...adjustList];

  const newPaidFor = { ...paidFor };

  for (const key of adjustList) {
    const value = newPaidFor[key];
    const newValue = value + diff;
    newPaidFor[key] = newValue;

    if (newValue < 0) {
      diff = newValue;
      newPaidFor[key] = 0;
    }

    if (newValue > 1) {
      diff = newValue - 1;
      newPaidFor[key] = 1;
    }

    if (newValue > 0 && newValue <= 1) {
      diff = 0;
    }

    if (diff === 0) {
      break;
    }
  }

  const oneHundred = Dinero({ amount: 100 });

  for (const [key, value] of Object.entries(newPaidFor)) {
    const amount = oneHundred.multiply(value);

    if (amount.equalsTo(oneHundred)) {
      newPaidFor[key] = 1;
    } else {
      newPaidFor[key] = Number(
        "0." + amount.getAmount().toString().padStart(2, "0")
      );
    }
  }

  return newPaidFor;
}
