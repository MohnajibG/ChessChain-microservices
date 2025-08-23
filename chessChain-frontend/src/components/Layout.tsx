import type { ReactNode } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";

import logoCC from "../assets/logo.png"; // Import du logo

interface LayoutProps {
  children?: ReactNode; // <-- Permet de recevoir {children}
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/profile", label: "Profile" },
    { path: "/chess-ai", label: "Chess AI" },
    { path: "/chess-web3", label: "Chess Web3" },
    { path: "/chess-free", label: "Chess Free" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#044352] text-white font-outfit">
      {/* Header */}
      <header className="bg-[#044352] shadow-lg p-4 flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-bold text-[#0BB4D9] hover:text-[#F78A28] transition flex items-center gap-2"
        >
          <img
            className="w-10 h-10 rounded-full"
            src={logoCC}
            alt="logoCheckChain"
          />
          Check<span className=" text-[#F78A28] ">Chain</span>
        </Link>
        <nav className="flex gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`font-semibold transition ${
                location.pathname === item.path
                  ? "text-[#F78A28] shadow-lg "
                  : "text-gray-300 shadow-md "
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Content */}
      <main className="flex-1 p-6">
        {children}
        <Outlet /> {/* React Router content */}
      </main>

      {/* Footer */}
      <footer className="bg-[#044352] text-gray-400 text-center py-4 text-sm">
        © {new Date().getFullYear()} CheckChain – All rights reserved
      </footer>
    </div>
  );
}
