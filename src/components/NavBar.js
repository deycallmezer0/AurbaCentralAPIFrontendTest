import React from 'react';
import './NavBar.css';
function Navbar() {
  return (
    <div>
        <nav>
            <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/search">Search</a></li>
                <li><a href="/settings">Settings</a></li>
            </ul>
        </nav>
    </div>
  );
}

export default Navbar;