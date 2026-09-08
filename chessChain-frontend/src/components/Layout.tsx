import type { ReactNode } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";

import logoCC from "../assets/logo.png";

interface LayoutProps {
  children?: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/profile", label: "Profile" },
    { path: "/chess-ai", label: "vs AI" },
    { path: "/chess-web3", label: "Web3" },
    { path: "/chess-free", label: "Free Play" },
  ];

  return (
    <div className="relative flex min-h-screen flex-col bg-zinc-950 font-outfit text-zinc-100 selection:bg-gold-400/30 selection:text-white">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-gold-500/10 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/5 bg-zinc-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="group flex items-center gap-3">
            <img
              className="h-9 w-9 rounded-full ring-1 ring-white/10 transition group-hover:ring-gold-400/50"
              src={logoCC}
              alt="ChessChain logo"
            />
            <span className="text-xl font-bold tracking-tight">
              Chess<span className="text-gold-400">Chain</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive ? "text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <span className="absolute inset-0 rounded-full bg-white/5 ring-1 ring-gold-400/30" />
                  )}
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="relative flex-1">
        {children}
        <Outlet />
      </main>

      <footer className="relative border-t border-white/5 py-6 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} ChessChain — Crafted for the modern
        board.
      </footer>
    </div>
  );
}
