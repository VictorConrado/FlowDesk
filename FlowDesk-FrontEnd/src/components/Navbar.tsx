import { useContext } from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  Ticket,
  UserCircle,
  ShieldCheck,
  LogOut,
} from "lucide-react";

import { AuthContext } from "../context/AuthContext";

type NavItem = {
  label: string;
  path: string;
  icon: React.ElementType;
  roles: string[];
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    roles: ["Employee", "Technician", "Admin"],
  },

  {
    label: "Tickets",
    path: "/tickets",
    icon: Ticket,
    roles: ["Employee", "Technician", "Admin"],
  },

  {
    label: "Perfil",
    path: "/profile",
    icon: UserCircle,
    roles: ["Employee", "Technician", "Admin"],
  },

  {
    label: "Admin",
    path: "/admin",
    icon: ShieldCheck,
    roles: ["Admin"],
  },
];

function getRoleStyles(
  role?: string
): string {
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

export default function Navbar() {
  const { user, logout } =
    useContext(AuthContext);

  const location = useLocation();

  const navigate = useNavigate();

  const visibleItems = navItems.filter(
    (item) =>
      item.roles.includes(
        user?.role ?? "Employee"
      )
  );

  function handleLogout(): void {
    logout();
    navigate("/");
  }

  return (
    <nav
      className="
        glass-card
        relative
        overflow-hidden
        rounded-[28px]
        border
        border-white/10
        px-6
        py-5
      "
    >
      {/* BACKGROUND GLOW */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-r
          from-orange-500/5
          via-transparent
          to-red-500/5
        "
      />

      <div
        className="
          relative
          z-10
          flex
          flex-col
          gap-6
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        {/* LEFT */}
        <div
          className="
            flex
            flex-col
            gap-5
            lg:flex-row
            lg:items-center
          "
        >
          {/* BRAND */}
          <div className="flex items-center gap-4">
            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-3xl
                border
                border-orange-500/20
                bg-gradient-to-br
                from-orange-500/20
                to-red-500/20
                text-orange-300
                shadow-neonOrange
              "
            >
            </div>

            <div>
              <h1
                className="
                  text-2xl
                  font-extrabold
                  tracking-[0.18em]
                  text-white
                "
              >
                FLOWDESK
              </h1>

              <p
                className="
                  mt-1
                  text-[11px]
                  uppercase
                  tracking-[0.35em]
                  text-orange-300
                "
              >
               Fleet Support
              </p>
            </div>
          </div>

          {/* NAVIGATION */}
          <div
            className="
              flex
              flex-wrap
              items-center
              gap-3
            "
          >
            {visibleItems.map((item) => {
              const Icon = item.icon;

              const active =
                location.pathname ===
                item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    group
                    flex
                    items-center
                    gap-2
                    rounded-2xl
                    border
                    px-4
                    py-3
                    text-sm
                    font-medium
                    transition-all
                    duration-300

                    ${
                      active
                        ? `
                          border-orange-400/30
                          bg-orange-500/10
                          text-white
                          shadow-neonOrange
                        `
                        : `
                          border-white/10
                          bg-white/[0.03]
                          text-white/70
                          hover:border-orange-400/25
                          hover:bg-orange-500/10
                          hover:text-white
                        `
                    }
                  `}
                >
                  <div
                    className={`
                      rounded-xl
                      p-2
                      transition-all
                      duration-300

                      ${
                        active
                          ? `
                            bg-orange-500/20
                            text-orange-300
                          `
                          : `
                            bg-white/5
                            text-white/70
                            group-hover:bg-orange-500/15
                            group-hover:text-orange-300
                          `
                      }
                    `}
                  >
                    <Icon size={16} />
                  </div>

                  <span>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
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
          {/* USER INFO */}
          <div
            className="
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-white/10
              bg-white/[0.03]
              px-4
              py-3
            "
          >
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
              <UserCircle size={22} />
            </div>

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

              <span
                className={`
                  mt-1
                  inline-flex
                  rounded-full
                  border
                  px-2
                  py-1
                  text-[10px]
                  uppercase
                  tracking-[0.2em]

                  ${getRoleStyles(
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
              rounded-2xl
              border
              border-red-500/20
              bg-red-500/10
              px-5
              py-3
              text-sm
              font-medium
              text-red-300
              transition-all
              duration-300
              hover:border-red-400/35
              hover:bg-red-500/20
              hover:shadow-neonRed
            "
          >
            <LogOut size={16} />

            <span>Sair</span>
          </button>
        </div>
      </div>
    </nav>
  );
}