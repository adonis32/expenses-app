import { User } from "../context/auth";
import { Expense } from "../context/expense";

export function calculateLogStats(user: User, expenses: Expense[]) {
  const groupedExpenses = expenses.reduce((prev, next) => {
    const prevExpenses = prev[next.user] ?? [];

    return {
      ...prev,
      [next.user]: [...prevExpenses, next],
    };
  }, {} as Record<string, Expense[]>);

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
    diffGroup,
    diffToEachParticipant,
  };
}

function expensesTotal(expenses: Expense[]) {
  return expenses.reduce((prev, next) => prev + next.expense, 0);
}
