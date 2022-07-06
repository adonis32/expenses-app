import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../auth";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

export interface List {
  name: string;
  users: string[];
  permissions: {
    admin: string;
  };
  code: string;
  deleting?: boolean;
  __ref: firebase.firestore.DocumentReference;
}

export interface ListContextType {
  lists: List[];
}

export const ListContext = createContext<ListContextType>({
  lists: [],
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
      .orderBy("createdOn", "desc")
      .onSnapshot((snapshot) => {
        if (unmounted) return;

        const lists = snapshot.docs.map((listDoc) => {
          const list = {
            ...listDoc.data(),
            __ref: listDoc.ref,
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
    <ListContext.Provider
      value={{ lists: lists.filter((list) => !list.deleting) }}
    >
      {children}
    </ListContext.Provider>
  );
}

export default ListProvider;
