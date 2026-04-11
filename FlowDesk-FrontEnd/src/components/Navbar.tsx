import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="bg-gray-800 text-white p-4 flex justify-between">
      <div className="flex gap-4">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/tickets">Tickets</Link>
      </div>

      <div className="flex gap-4">
        <span>{user?.name}</span>

        <button onClick={handleLogout} className="bg-red-500 px-3 rounded">
          Sair
        </button>
      </div>
    </div>
  );
}