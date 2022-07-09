import type { Expense } from "../context/expense";

export type ExpenseUser = string;
export type ExpenseInput = Pick<Expense, "expense" | "user">;

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

  const diffSplitted = userTotalSplitted - otherUserTotalSplitted;
  const diffUnsplitted = diffSplitted / 2;

  return {
    userTotalSplitted,
    diffSplitted: isNaN(diffSplitted) ? 0 : diffSplitted,
    diffUnsplitted: isNaN(diffUnsplitted) ? 0 : diffUnsplitted,
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

  const userOwes = Object.values(diffs)
    .filter((diff) => diff.diffUnsplitted < 0)
    .map((diff) => diff.diffUnsplitted)
    .reduce((prev, next) => prev + Math.abs(next), 0);

  const owedToUser = Object.values(diffs)
    .filter((diff) => diff.diffUnsplitted >= 0)
    .map((diff) => diff.diffUnsplitted)
    .reduce((prev, next) => prev + next, 0);

  return {
    userTotalSplitted,
    userOwes,
    owedToUser,
    diffs,
  };
}

function expensesTotal(expenses: Pick<ExpenseInput, "expense">[]) {
  return expenses.reduce((prev, next) => prev + next.expense, 0);
}
