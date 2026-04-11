import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar() {
  const { user } = useContext(AuthContext);

  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4">
      <h1 className="text-xl font-bold mb-6">FlowDesk</h1>

      <nav className="flex flex-col gap-3">
        <Link to="/dashboard" className="hover:bg-gray-700 p-2 rounded">
          Dashboard
        </Link>

        <Link to="/tickets" className="hover:bg-gray-700 p-2 rounded">
          Tickets
        </Link>

        {user?.role === "Admin" && (
          <Link to="/admin" className="hover:bg-gray-700 p-2 rounded">
            Admin
          </Link>
        )}
      </nav>
    </div>
  );
}