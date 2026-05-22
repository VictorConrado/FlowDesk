import { useContext, useState } from "react";

import {
  Link,
  useLocation,
} from "react-router-dom";

import {
  LayoutDashboard,
  Ticket,
  ShieldCheck,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

import { AuthContext } from "../context/AuthContext";

type SidebarItem = {
  label: string;
  path: string;
  icon: React.ElementType;
  roles: string[];
};

const sidebarItems: SidebarItem[] = [
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

export default function Sidebar() {
  const { user } = useContext(AuthContext);

  const location = useLocation();

  const [collapsed, setCollapsed] =
    useState<boolean>(false);

  const [mobileOpen, setMobileOpen] =
    useState<boolean>(false);

  const visibleItems = sidebarItems.filter((item) =>
    item.roles.includes(user?.role ?? "User")
  );

  return (
    <>
      {/* MOBILE BUTTON */}
      <button
        onClick={() => setMobileOpen(true)}
        className="
          fixed
          left-4
          top-4
          z-50
          rounded-2xl
          border
          border-white/10
          bg-white/10
          p-3
          text-white
          backdrop-blur-xl
          transition
          hover:border-orange-400/30
          hover:bg-orange-500/10
          md:hidden
        "
      >
        <Menu size={20} />
      </button>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="
            fixed
            inset-0
            z-40
            bg-black/60
            backdrop-blur-sm
            md:hidden
          "
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          flex
          h-screen
          flex-col
          border-r
          border-white/10
          bg-white/[0.04]
          backdrop-blur-2xl
          transition-all
          duration-300

          ${
            collapsed
              ? "w-[95px]"
              : "w-[280px]"
          }

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        {/* HEADER */}
        <div
          className={`
            flex
            items-center
            border-b
            border-white/10
            px-5
            py-6
            ${
              collapsed
                ? "justify-center"
                : "justify-between"
            }
          `}
        >
          {!collapsed && (
            <div>
              <h1
                className="
                  text-3xl
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
                  text-[10px]
                  uppercase
                  tracking-[0.35em]
                  text-orange-300
                "
              >
                Ticket Core
              </p>
            </div>
          )}

          {/* DESKTOP COLLAPSE */}
          <button
            onClick={() =>
              setCollapsed((prev) => !prev)
            }
            className="
              hidden
              rounded-xl
              border
              border-white/10
              bg-white/5
              p-2
              text-white
              transition-all
              hover:border-orange-400/30
              hover:bg-orange-500/10
              hover:text-orange-300
              md:flex
            "
          >
            {collapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>

          {/* MOBILE CLOSE */}
          <button
            onClick={() => setMobileOpen(false)}
            className="
              rounded-xl
              border
              border-white/10
              bg-white/5
              p-2
              text-white
              transition-all
              hover:border-red-400/30
              hover:bg-red-500/10
              hover:text-red-300
              md:hidden
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* USER INFO */}
        <div className="px-4 py-5">
          <div
            className={`
              glass-card
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-orange-500/10
              p-4

              ${
                collapsed
                  ? "justify-center"
                  : ""
              }
            `}
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
              <UserCircle size={24} />
            </div>

            {!collapsed && (
              <div className="overflow-hidden">
                <p
                  className="
                    truncate
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  {user?.name}
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    uppercase
                    tracking-[0.2em]
                    text-orange-300
                  "
                >
                  {user?.role}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* NAVIGATION */}
        <nav
          className="
            flex
            flex-1
            flex-col
            gap-3
            px-4
            py-2
          "
        >
          {visibleItems.map((item) => {
            const Icon = item.icon;

            const active =
              location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() =>
                  setMobileOpen(false)
                }
                className={`
                  group
                  relative
                  flex
                  items-center
                  rounded-2xl
                  border
                  px-4
                  py-3
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
                        border-white/5
                        bg-white/[0.03]
                        text-white/70
                        hover:border-orange-400/25
                        hover:bg-orange-500/10
                        hover:text-white
                      `
                  }

                  ${
                    collapsed
                      ? "justify-center"
                      : "gap-4"
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
                  <Icon size={18} />
                </div>

                {!collapsed && (
                  <span
                    className="
                      text-sm
                      font-medium
                      tracking-wide
                    "
                  >
                    {item.label}
                  </span>
                )}

                {active && (
                  <div
                    className="
                      absolute
                      right-3
                      h-2
                      w-2
                      rounded-full
                      bg-orange-300
                      shadow-neonOrange
                    "
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* FOOTER */}
        <div className="p-4">
          <div
            className={`
              rounded-2xl
              border
              border-orange-500/10
              bg-gradient-to-br
              from-orange-500/10
              to-red-500/5
              p-4
              backdrop-blur-xl

              ${
                collapsed
                  ? "text-center"
                  : ""
              }
            `}
          >
            {!collapsed ? (
              <>
                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.3em]
                    text-orange-300
                  "
                >
                  FlowDesk
                </p>

                <h3
                  className="
                    mt-2
                    text-lg
                    font-semibold
                    text-white
                  "
                >
                  Support Fleet
                </h3>

                <p
                  className="
                    mt-2
                    text-xs
                    leading-relaxed
                    text-white/55
                  "
                >
                  Sistema corporativo de
                  gerenciamento de tickets
                  com arquitetura moderna e
                  monitoramento em tempo real.
                </p>
              </>
            ) : (
              <div
                className="
                  mx-auto
                  h-3
                  w-3
                  rounded-full
                  bg-green-400
                  shadow-neonGreen
                "
              />
            )}
          </div>
        </div>
      </aside>
    </>
  );
}