import AppRoutes from "./routes/AppRoutes";
import { useScrollToTop } from "./hooks/useScrollToTop";

function App() {
  useScrollToTop();

  return <AppRoutes />;
}

export default App;