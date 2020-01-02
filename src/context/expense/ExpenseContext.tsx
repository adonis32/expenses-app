import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../auth";
import firebase from "firebase/app";

export interface Expense {
  name: string;
  expense: number;
  user: string;
  __ref: firebase.firestore.DocumentReference;
}

export interface ExpenseContext {
  expenses: Expense[];
}

export const ExpenseContext = createContext<ExpenseContext>({
  expenses: []
});

export function useExpense() {
  return useContext(ExpenseContext);
}

interface ExpenseProviderProps {
  children: React.ReactNode;
  listId: string;
}

function ExpenseProvider({ children, listId }: ExpenseProviderProps) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    setExpenses([]);
  }, [listId]);

  useEffect(() => {
    if (!user) {
      return;
    }

    let unmounted = false;

    const unsubscribe = firebase
      .firestore()
      .collection(`lists/${listId}/expenses`)
      .onSnapshot(snapshot => {
        if (unmounted) return;

        const expenses = snapshot.docs.map(expenseDoc => {
          const expense = {
            ...expenseDoc.data(),
            __ref: expenseDoc.ref
          } as Expense;

          return expense;
        });

        setExpenses(expenses);
      });

    return () => {
      unmounted = true;
      unsubscribe();
    };
  }, [user, listId]);

  return (
    <ExpenseContext.Provider value={{ expenses }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export default ExpenseProvider;
