import React from "react";
import LoginScreen from "./components/login-screen";
import { useAuth } from "./context/auth";
import LoggedInRoutes from "./components/logged-in-routes";

function App() {
  const { user } = useAuth();

  if (!user) {
    return <LoginScreen />;
  }

  return <LoggedInRoutes />;
}

export default App;
