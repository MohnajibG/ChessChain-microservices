import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-32 text-center">
      <span className="text-sm font-semibold uppercase tracking-widest text-gold-300">
        Error 404
      </span>
      <h1 className="mt-4 text-5xl font-extrabold tracking-tight md:text-6xl">
        Off the board.
      </h1>
      <p className="mt-4 max-w-md text-zinc-400">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-10 rounded-full bg-gradient-to-r from-gold-400 to-gold-500 px-8 py-3 font-semibold text-zinc-950 shadow-lg shadow-gold-500/20 transition hover:scale-[1.03]"
      >
        Back to Home
      </Link>
    </div>
  );
}
