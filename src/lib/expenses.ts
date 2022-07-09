import type { User } from "../context/auth";
import type { Expense } from "../context/expense";

export type ExpenseUser = Pick<User, "uid">;
export type ExpenseInput = Pick<Expense, "expense" | "user">;

export function calculateLogStatsBetweenTwoUsers(
  user: ExpenseUser,
  otherUser: ExpenseUser,
  expenses: ExpenseInput[]
) {
  const groupedExpenses = expenses
    .filter((expense) => [user.uid, otherUser.uid].includes(expense.user))
    .reduce((prev, next) => {
      const prevExpenses = prev[next.user] ?? [];

      return {
        ...prev,
        [next.user]: [...prevExpenses, next],
      };
    }, {} as Record<string, ExpenseInput[]>);

  const {
    [user.uid]: userExpenses = [],
    [otherUser.uid]: otherUserExpenses = [],
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
  user: ExpenseUser,
  otherUsers: ExpenseUser[],
  expenses: ExpenseInput[]
) {
  const diffs: Record<string, UserDiff> = {};

  for (const otherUser of otherUsers) {
    diffs[otherUser.uid] = calculateLogStatsBetweenTwoUsers(
      user,
      otherUser,
      expenses
    );
  }

  const userTotalSplitted = expensesTotal(
    expenses.filter((expense) => expense.user === user.uid)
  );

  const userOwes = Object.values(diffs)
    .filter((diff) => diff.diffUnsplitted <= 0)
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

/**
 * @deprecated
 */
export function calculateLogStats(user: ExpenseUser, expenses: ExpenseInput[]) {
  const groupedExpenses = expenses.reduce((prev, next) => {
    const prevExpenses = prev[next.user] ?? [];

    return {
      ...prev,
      [next.user]: [...prevExpenses, next],
    };
  }, {} as Record<string, ExpenseInput[]>);

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

  return {
    userTotal,
    diffGroup: isNaN(diffGroup) ? 0 : diffGroup,
    diffToEachParticipant: isNaN(diffToEachParticipant)
      ? 0
      : diffToEachParticipant,
  };
}

function expensesTotal(expenses: Pick<ExpenseInput, "expense">[]) {
  return expenses.reduce((prev, next) => prev + next.expense, 0);
}
