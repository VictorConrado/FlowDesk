import Layout from "./components/Layout";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import Admin from "./pages/Admin"; // 👈 novo
import { ProtectedRoute } from "./routes/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tickets"
        element={
          <ProtectedRoute>
            <Layout>
              <Tickets />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* 👇 NOVA ROTA ADMIN */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <Layout>
              <Admin />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;