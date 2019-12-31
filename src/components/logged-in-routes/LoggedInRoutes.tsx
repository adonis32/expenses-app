import React from "react";
import { Switch, Route } from "react-router-dom";
import Lists from "../lists";
import ExpenseLog from "../expense-log";
import ListProvider from "../../context/list";

function LoggedInRoutes() {
  return (
    <ListProvider>
      <Switch>
        <Route exact path="/">
          <Lists />
        </Route>

        <Route path="/list/:listId">
          <ExpenseLog />
        </Route>
      </Switch>
    </ListProvider>
  );
}

export default LoggedInRoutes;
