import type { ReactNode } from "react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({
  children,
}: LayoutProps) {
  return (
    <div
      className="
        app-shell
        relative
        flex
        min-h-screen
        bg-space
      "
    >

      <div
        className="
          pointer-events-none
          fixed
          inset-0
          z-0
          overflow-hidden
        "
      >

        <div
          className="
            absolute
            -left-32
            -top-32
            h-[400px]
            w-[400px]
            rounded-full
            bg-red-500/10
            blur-3xl
          "
        />

        <div
          className="
            absolute
            -right-40
            top-0
            h-[450px]
            w-[450px]
            rounded-full
            bg-orange-500/10
            blur-3xl
          "
        />

        <div
          className="
            absolute
            bottom-0
            left-0
            h-[300px]
            w-[300px]
            rounded-full
            bg-green-500/10
            blur-3xl
          "
        />

        <div
          className="
            absolute
            inset-0
            opacity-[0.03]
          "
          style={{
            backgroundImage: `
              linear-gradient(
                rgba(255,255,255,0.12) 1px,
                transparent 1px
              ),
              linear-gradient(
                90deg,
                rgba(255,255,255,0.12) 1px,
                transparent 1px
              )
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <Sidebar />

      <main
        className="
          relative
          z-10
          min-h-screen
          flex-1
          transition-all
          duration-300
          md:ml-[280px]
        "
      >

        <Topbar />

        <div
          className="
            page-container
            px-4
            py-6
            md:px-8
            md:py-8
          "
        >
          <div
            className="
              mx-auto
              w-full
              max-w-[1800px]
            "
          >
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}