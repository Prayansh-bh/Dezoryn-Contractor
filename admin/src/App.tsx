import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoginPage } from "./components/LoginPage";
import { AdminPanel } from "../components/admin-panel";
import { Loader2 } from "lucide-react";

function AdminApp() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="admin-loading" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", color: "#c9a35d" }}>
        <Loader2 className="spin" size={24} />
        <span>Validating secure session…</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <AdminPanel
      user={user?.name || user?.email || "Dezoryn Administrator"}
      onSignOut={logout}
    />
  );
}

export function App() {
  return (
    <AuthProvider>
      <AdminApp />
    </AuthProvider>
  );
}

export default App;
