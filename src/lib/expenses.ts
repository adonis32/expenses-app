import type { Expense } from "../context/expense";
import Dinero from "dinero.js";

export type ExpenseUser = string;
export type ExpenseInput = Pick<Expense, "expense" | "user" | "version">;

export function calculateLogStatsBetweenTwoUsers(
  userUid: ExpenseUser,
  otherUserUid: ExpenseUser,
  expenses: ExpenseInput[]
) {
  const groupedExpenses = expenses
    .filter((expense) => [userUid, otherUserUid].includes(expense.user))
    .reduce((prev, next) => {
      const prevExpenses = prev[next.user] ?? [];

      return {
        ...prev,
        [next.user]: [...prevExpenses, next],
      };
    }, {} as Record<string, ExpenseInput[]>);

  const {
    [userUid]: userExpenses = [],
    [otherUserUid]: otherUserExpenses = [],
  } = groupedExpenses;

  const userTotalSplitted = expensesTotal(userExpenses);
  const otherUserTotalSplitted = expensesTotal(otherUserExpenses);

  const diffSplitted = userTotalSplitted.subtract(otherUserTotalSplitted);
  const diffUnsplitted = diffSplitted.divide(2);

  return {
    userTotalSplitted,
    diffSplitted,
    diffUnsplitted,
  };
}

type UserDiff = ReturnType<typeof calculateLogStatsBetweenTwoUsers>;

export function calculateLogStatsOfUser(
  userUid: ExpenseUser,
  otherUsers: ExpenseUser[],
  expenses: ExpenseInput[]
) {
  const diffs: Record<string, UserDiff> = {};

  for (const otherUserUid of otherUsers.filter((uid) => uid !== userUid)) {
    diffs[otherUserUid] = calculateLogStatsBetweenTwoUsers(
      userUid,
      otherUserUid,
      expenses
    );
  }

  const userTotalSplitted = expensesTotal(
    expenses.filter((expense) => expense.user === userUid)
  );

  const zero = Dinero({ amount: 0 });

  const userOwes = Object.values(diffs)
    .filter((diff) => diff.diffUnsplitted.lessThan(zero))
    .map((diff) => diff.diffUnsplitted)
    .reduce(
      (prev, next) => prev.add(Dinero({ amount: Math.abs(next.getAmount()) })),
      Dinero({ amount: 0 })
    );

  const owedToUser = Object.values(diffs)
    .filter((diff) => diff.diffSplitted.greaterThan(zero))
    .map((diff) => diff.diffUnsplitted)
    .reduce((prev, next) => prev.add(next), Dinero({ amount: 0 }));

  return {
    userTotalSplitted,
    userOwes,
    owedToUser,
    diffs,
  };
}

function expensesTotal(expenses: Pick<ExpenseInput, "expense" | "version">[]) {
  return expenses.reduce(
    (prev, next) =>
      prev.add(
        Dinero({
          amount: safeExpenseAmount(next),
        })
      ),
    Dinero({ amount: 0 })
  );
}

export function convertToCents(amount: number) {
  return String(amount).includes(".")
    ? Number(amount.toFixed(2).replace(".", ""))
    : amount * 100;
}

export function safeExpenseAmount(
  expense: Pick<ExpenseInput, "expense" | "version">
) {
  return expense.version === 2
    ? expense.expense
    : convertToCents(expense.expense);
}
