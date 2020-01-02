import { useEffect } from "react";
import { useRouteMatch, useHistory } from "react-router-dom";
import { useListById } from "../../context/list";

function DeletingListRedirect() {
  const match = useRouteMatch<{ listId: string }>();
  const { listId } = match.params;
  const history = useHistory();
  const list = useListById(listId);

  const deleting = list?.deleting;

  useEffect(() => {
    if (deleting) {
      history.replace("/");
    }
  }, [deleting, history]);

  return null;
}

export default DeletingListRedirect;
