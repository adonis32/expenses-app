import type { ExpenseV1, ExpenseV2 } from "../context/expense";
import Dinero from "dinero.js";

export type ExpenseUser = string;
export type ExpenseInput =
  | Pick<ExpenseV1, "expense" | "user" | "version">
  | Pick<ExpenseV2, "expense" | "user" | "version" | "paidBy" | "splittedWith">;

export function calculateLogStatsBetweenTwoUsers(
  userUid: ExpenseUser,
  otherUserUid: ExpenseUser,
  expenses: ExpenseInput[],
  v1Split: number
) {
  const groupedExpenses = expenses
    .filter((expense) =>
      expense.version === 2
        ? [userUid, otherUserUid].includes(expense.paidBy) &&
          expense.splittedWith[userUid] &&
          expense.splittedWith[otherUserUid]
        : [userUid, otherUserUid].includes(expense.user)
    )
    .reduce((prev, next) => {
      const user = next.version === 2 ? next.paidBy : next.user;
      const prevExpenses = prev[user] ?? [];

      return {
        ...prev,
        [user]: [...prevExpenses, next],
      };
    }, {} as Record<string, ExpenseInput[]>);

  const {
    [userUid]: userExpenses = [],
    [otherUserUid]: otherUserExpenses = [],
  } = groupedExpenses;

  const userDebtWithOtherUser = getSplitTotal(
    otherUserExpenses,
    userUid,
    v1Split
  );
  const otherUserDebtWithUser = getSplitTotal(
    userExpenses,
    otherUserUid,
    v1Split
  );

  const diffUnsplitted = otherUserDebtWithUser.subtract(userDebtWithOtherUser);

  return {
    diffUnsplitted,
  };
}

type UserDiff = ReturnType<typeof calculateLogStatsBetweenTwoUsers>;

export function calculateLogStatsOfUser(
  userUid: ExpenseUser,
  listUsers: ExpenseUser[],
  expenses: ExpenseInput[]
) {
  const diffs: Record<string, UserDiff> = {};
  const v1Split = 1 / new Set([userUid, ...listUsers]).size;

  for (const otherUserUid of listUsers.filter((uid) => uid !== userUid)) {
    diffs[otherUserUid] = calculateLogStatsBetweenTwoUsers(
      userUid,
      otherUserUid,
      expenses,
      v1Split
    );
  }

  const zero = Dinero({ amount: 0 });

  const userOwes = Object.values(diffs)
    .filter((diff) => diff.diffUnsplitted.lessThan(zero))
    .map((diff) => diff.diffUnsplitted)
    .reduce(
      (prev, next) => prev.add(Dinero({ amount: Math.abs(next.getAmount()) })),
      Dinero({ amount: 0 })
    );

  const owedToUser = Object.values(diffs)
    .filter((diff) => diff.diffUnsplitted.greaterThan(zero))
    .map((diff) => diff.diffUnsplitted)
    .reduce((prev, next) => prev.add(next), Dinero({ amount: 0 }));

  return {
    userOwes,
    owedToUser,
    diffs,
  };
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

function getSplitTotal(expenses: ExpenseInput[], uid: string, v1Split: number) {
  return expenses.reduce((prev, next) => {
    let amount = Dinero({
      amount: safeExpenseAmount(next),
    });

    if (!next.version) {
      amount = amount.multiply(v1Split);
    } else {
      amount = amount.multiply(next.splittedWith[uid]);
    }

    return prev.add(amount);
  }, Dinero({ amount: 0 }));
}
