import React from "react";
import { Switch, Route } from "react-router-dom";
import Lists from "../lists";
import ExpenseLog from "../expense-log";
import ListProvider from "../../context/list";
import CreateExpense from "../create-expense";
import CreateList from "../create-list";
import ManageList from "../manage-list";

function LoggedInRoutes() {
  return (
    <ListProvider>
      <Switch>
        <Route exact path="/">
          <Lists />
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
  );
}

export default LoggedInRoutes;
