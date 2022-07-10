import { createContext, useContext, useEffect, useState } from "react";
import * as React from "react";
import { useAuth } from "../auth";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

interface ExpenseBase {
  name: string;
  expense: number;
  user: string;
  createdOn: number;
  __ref: firebase.firestore.DocumentReference;
}

export interface ExpenseV1 extends ExpenseBase {
  version?: undefined;
}

export interface ExpenseV2 extends ExpenseBase {
  version: 2;
  paidBy: string;
  paidFor: { [user: string]: number };
  currency: "EUR";
}

export type Expense = ExpenseV1 | ExpenseV2;

export interface ExpenseContextType {
  expenses: Expense[];
}

export const ExpenseContext = createContext<ExpenseContextType>({
  expenses: [],
});

export function useExpense() {
  return useContext(ExpenseContext);
}

interface ExpenseProviderProps {
  children: React.ReactNode;
  listId: string;
}

const cache = new Map<string, Expense[]>();

function ExpenseProvider({ children, listId }: ExpenseProviderProps) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>(
    () => cache.get(listId) ?? []
  );

  useEffect(() => {
    setExpenses(cache.get(listId) ?? []);
  }, [listId]);

  useEffect(() => {
    if (!user) {
      return;
    }

    let unmounted = false;

    const unsubscribe = firebase
      .firestore()
      .collection(`lists/${listId}/expenses`)
      .orderBy("createdOn", "desc")
      .onSnapshot((snapshot) => {
        if (unmounted) return;

        const expenses = snapshot.docs.map((expenseDoc) => {
          const expense = {
            ...expenseDoc.data(),
            __ref: expenseDoc.ref,
          } as Expense;

          return expense;
        });

        cache.set(listId, expenses);
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
