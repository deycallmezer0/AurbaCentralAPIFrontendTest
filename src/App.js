import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Search from './pages/Search';
import Settings from './pages/Settings';
const NavBar = React.lazy(() => import('./components/NavBar'));

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

// const container = document.getElementById('root');
// // const root = createRoot(container);
// // root.render(<App />);