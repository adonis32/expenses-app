import { useList } from "./ListContext";

export function useListById(id: string) {
  const { lists } = useList();

  return lists.find(list => list.__ref.id === id);
}
