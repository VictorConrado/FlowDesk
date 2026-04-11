import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Topbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="h-16 bg-white shadow flex items-center justify-end px-6">
      <div className="flex items-center gap-4">
        <span className="font-medium">{user?.name}</span>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Sair
        </button>
      </div>
    </div>
  );
}