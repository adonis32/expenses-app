import LoginScreen from "./components/login-screen";
import { useAuth } from "./context/auth";
import LoggedInRoutes from "./components/logged-in-routes";
import LoadingScreen from "./components/loading-screen";

function App() {
  const { user, loading } = useAuth();

  if (!user && !loading) {
    return <LoginScreen />;
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return <LoggedInRoutes />;
}

export default App;
