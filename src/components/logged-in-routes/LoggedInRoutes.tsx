import { Switch, Route } from "react-router-dom";
import Lists from "../lists";
import ExpenseLog from "../expense-log";
import ListProvider from "../../context/list";
import CreateExpense from "../create-expense";
import CreateList from "../create-list";
import ManageList from "../manage-list";
import JoinList from "../join-list";
import ProfileProvider from "../../context/profile";
import DeletingListRedirect from "../deleting-list-redirect";

function LoggedInRoutes() {
  return (
    <ProfileProvider>
      <ListProvider>
        <Route path="/list/:listId">
          <DeletingListRedirect />
        </Route>

        <Switch>
          <Route exact path="/">
            <Lists />
          </Route>

          <Route exact path="/list/join">
            <JoinList />
          </Route>

          <Route exact path="/list/create">
            <CreateList />
          </Route>

          <Route path="/list/:listId/create">
            <CreateExpense />
          </Route>

          <Route path="/list/:listId/manage">
            <ManageList />
          </Route>

          <Route path="/list/:listId">
            <ExpenseLog />
          </Route>
        </Switch>
      </ListProvider>
    </ProfileProvider>
  );
}

export default LoggedInRoutes;
