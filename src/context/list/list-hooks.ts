import { useList } from "./ListContext";
import { useAuth } from "../auth";

export function useListById(id: string) {
  const { lists } = useList();

  return lists.find((list) => list.__ref.id === id);
}

export function useIsListAdmin(id: string) {
  const list = useListById(id);
  const { user } = useAuth();

  if (!list) {
    return false;
  }

  return list.permissions.admin === user?.uid;
}
