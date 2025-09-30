import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#044352] to-[#032c58] text-white font-outfit">
      <h1 className="text-6xl font-bold text-[#0BB4D9] mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-[#0BB4D9] mb-6">
        Page Not Found
      </h2>
      <p className="text-gray-300 mb-8 text-center max-w-md">
        Oops! The page you are looking for doesn’t exist or has been moved.
      </p>

      <Link
        to="/"
        className="px-6 py-3 bg-[#F78A28] hover:bg-[#0BB4D9] rounded-lg font-semibold transition"
      >
        ⬅ Back to Home
      </Link>

      <footer className="absolute bottom-4 text-sm text-gray-400">
        © {new Date().getFullYear()} ChessChain – All rights reserved
      </footer>
    </div>
  );
}
