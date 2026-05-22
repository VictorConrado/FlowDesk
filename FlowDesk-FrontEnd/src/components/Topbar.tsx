import { useContext } from "react";

import { useNavigate } from "react-router-dom";

import {
  Bell,
  LogOut,
  Shield,
  UserCircle2,
} from "lucide-react";

import { AuthContext } from "../context/AuthContext";

function getRoleColor(role?: string): string {
  switch (role) {
    case "Admin":
      return "text-red-300";

    case "Technician":
      return "text-yellow-300";

    default:
      return "text-green-300";
  }
}

function getRoleBadge(role?: string): string {
  switch (role) {
    case "Admin":
      return `
        border-red-500/20
        bg-red-500/10
        text-red-300
      `;

    case "Technician":
      return `
        border-yellow-500/20
        bg-yellow-500/10
        text-yellow-300
      `;

    default:
      return `
        border-green-500/20
        bg-green-500/10
        text-green-300
      `;
  }
}

export default function Topbar() {
  const { user, logout } =
    useContext(AuthContext);

  const navigate = useNavigate();

  function handleLogout(): void {
    logout();
    navigate("/");
  }

  return (
    <header
      className="
        sticky
        top-0
        z-30
        border-b
        border-white/10
        bg-white/[0.04]
        px-4
        py-4
        backdrop-blur-2xl
        md:px-8
      "
    >
      <div
        className="
          flex
          flex-col
          gap-4
          md:flex-row
          md:items-center
          md:justify-between
        "
      >
        {/* LEFT */}
        <div>
          <div
            className="
              flex
              items-center
              gap-2
              text-orange-300
            "
          >
            <span
              className="
                text-xs
                uppercase
                tracking-[0.3em]
              "
            >
              Ticket System
            </span>
          </div>

          <h1
            className="
              mt-2
              text-2xl
              font-bold
              tracking-[0.08em]
              text-white
            "
          >
            Bem-vindo ao FlowDesk
          </h1>

          <p
            className="
              mt-1
              text-sm
              text-white/55
            "
          >
            Gerencie tickets e operações
            corporativas em tempo real.
          </p>
        </div>

        {/* RIGHT */}
        <div
          className="
            flex
            flex-wrap
            items-center
            gap-4
          "
        >
          {/* NOTIFICATIONS */}
          <button
            className="
              relative
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              border
              border-white/10
              bg-white/[0.05]
              text-white
              transition-all
              duration-300
              hover:border-orange-400/30
              hover:bg-orange-500/10
              hover:text-orange-300
              hover:shadow-neonOrange
            "
          >
            <Bell size={18} />

            <span
              className="
                absolute
                right-3
                top-3
                h-2
                w-2
                rounded-full
                bg-red-400
                shadow-neonRed
              "
            />
          </button>

          {/* USER CARD */}
          <div
            className="
              glass-card
              flex
              items-center
              gap-4
              rounded-2xl
              border
              border-white/10
              px-5
              py-3
            "
          >
            {/* AVATAR */}
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-gradient-to-br
                from-orange-500/20
                to-red-500/20
                text-orange-300
                shadow-neonOrange
              "
            >
              <UserCircle2 size={24} />
            </div>

            {/* USER INFO */}
            <div>
              <p
                className="
                  text-sm
                  font-semibold
                  text-white
                "
              >
                {user?.name}
              </p>

              <div
                className="
                  mt-1
                  flex
                  items-center
                  gap-2
                "
              >
                <Shield
                  size={12}
                  className={getRoleColor(
                    user?.role
                  )}
                />

                <span
                  className={`
                    rounded-full
                    border
                    px-2
                    py-1
                    text-[10px]
                    uppercase
                    tracking-[0.2em]

                    ${getRoleBadge(
                      user?.role
                    )}
                  `}
                >
                  {user?.role}
                </span>
              </div>
            </div>

            {/* LOGOUT */}
            <button
              onClick={handleLogout}
              className="
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-red-500/20
                bg-red-500/10
                px-4
                py-2
                text-sm
                font-medium
                text-red-300
                transition-all
                duration-300
                hover:border-red-400/40
                hover:bg-red-500/20
                hover:shadow-neonRed
              "
            >
              <LogOut size={16} />

              <span className="hidden sm:block">
                Sair
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}