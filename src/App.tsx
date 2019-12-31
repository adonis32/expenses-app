import React from "react";
import LoginScreen from "./components/login-screen";
import { useAuth } from "./context/auth";

function App() {
  const { user } = useAuth();

  if (!user) {
    return <LoginScreen />;
  }

  return <>LoggedIn!</>;
}

export default App;
