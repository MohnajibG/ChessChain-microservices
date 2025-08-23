import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import ChessAI from "./components/chess/ChessAI";
import ChessWeb3 from "./components/chess/ChessWeb3";
import ChessFree from "./components/chess/ChessFree";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Layout englobe toutes les routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/chess-ai" element={<ChessAI />} />
          <Route path="/chess-web3" element={<ChessWeb3 />} />
          <Route path="/chess-free" element={<ChessFree />} />
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}
