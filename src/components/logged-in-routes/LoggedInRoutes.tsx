import React from "react";
import { Switch, Route } from "react-router-dom";
import Lists from "../lists";
import ExpenseLog from "../expense-log";

function LoggedInRoutes() {
  return (
    <Switch>
      <Route exact path="/">
        <Lists />
      </Route>

      <Route path="/list/:listId">
        <ExpenseLog />
      </Route>
    </Switch>
  );
}

export default LoggedInRoutes;
