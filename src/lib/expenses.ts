import type { ExpenseV1, ExpenseV2 } from "../context/expense";
import Dinero from "dinero.js";

export type ExpenseUser = string;
export type ExpenseInput =
  | Pick<ExpenseV1, "expense" | "user" | "version">
  | Pick<ExpenseV2, "expense" | "user" | "version" | "paidBy" | "paidFor">;

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
          userUid in expense.paidFor &&
          otherUserUid in expense.paidFor
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

  /**
   * What U2 has to pay to U1
   */
  const whatU2HasToPayToU1 = getSplitTotal(userExpenses, otherUserUid, v1Split);

  /**
   * What U1 has to pay to U2
   */
  const whatU1HasToPayToU2 = getSplitTotal(otherUserExpenses, userUid, v1Split);

  const diff = whatU2HasToPayToU1.subtract(whatU1HasToPayToU2);

  return {
    diffUnsplitted: diff,
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

function getSplitTotal(
  expenses: ExpenseInput[],
  uid: string,
  v1Split: number,
  reverse = false
) {
  return expenses.reduce((prev, next) => {
    let amount = Dinero({
      amount: safeExpenseAmount(next),
    });

    if (!next.version) {
      amount = amount.multiply(v1Split);
    } else {
      amount = amount.multiply(
        reverse ? 1 - next.paidFor[uid] : next.paidFor[uid]
      );
    }

    return prev.add(amount);
  }, Dinero({ amount: 0 }));
}
