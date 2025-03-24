import { AuthProvider } from "./context/AuthContext";
import ChatPage from "./pages/ChatPage";

function App() {
  return (
    <AuthProvider>
      <ChatPage />
    </AuthProvider>
  );
}

export default App;
