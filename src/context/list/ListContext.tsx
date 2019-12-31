import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../auth";
import firebase from "firebase/app";

export interface List {
  name: string;
  users: string[];
  permissions: {
    admin: string;
  };
  code: string;
  __ref: firebase.firestore.DocumentReference;
}

export interface ListContext {
  lists: List[];
}

export const ListContext = createContext<ListContext>({
  lists: []
});

export function useList() {
  return useContext(ListContext);
}

interface ListProviderProps {
  children: React.ReactNode;
}

function ListProvider({ children }: ListProviderProps) {
  const { user } = useAuth();
  const [lists, setLists] = useState<List[]>([]);

  useEffect(() => {
    if (!user) {
      return;
    }

    let unmounted = false;

    const unsubscribe = firebase
      .firestore()
      .collection("lists")
      .where("users", "array-contains", user.uid)
      .onSnapshot(snapshot => {
        if (unmounted) return;

        const lists = snapshot.docs.map(listDoc => {
          const list = {
            ...listDoc.data(),
            __ref: listDoc.ref
          } as List;

          return list;
        });

        setLists(lists);
      });

    return () => {
      unmounted = true;
      unsubscribe();
    };
  }, [user]);

  return (
    <ListContext.Provider value={{ lists }}>{children}</ListContext.Provider>
  );
}

export default ListProvider;
