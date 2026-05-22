import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ToastProvider } from './hooks/useToast';
import DecksPage from './pages/DecksPage';
import DeckDetailPage from './pages/DeckDetailPage';
import ReviewPage from './pages/ReviewPage';

function Nav() {
  const navigate = useNavigate();
  return (
    <nav className="nav">
      <div className="page-container">
        <div className="nav-inner">
          <Link to="/" className="nav-logo">
            <span className="nav-logo-dot" />
            Recall
          </Link>
          <div className="nav-links">
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>
              My Decks
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="app-wrapper">
          <Nav />
          <Routes>
            <Route path="/" element={<DecksPage />} />
            <Route path="/deck/:id" element={<DeckDetailPage />} />
            <Route path="/deck/:id/review" element={<ReviewPage />} />
          </Routes>
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}
