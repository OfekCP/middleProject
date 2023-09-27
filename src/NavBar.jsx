import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import './NavBar.css';

export default function Navbar() {
  return (
    <div className="navBarContainer">
      <nav className="navBar">
        <h1 id="header">
          Stidy
        </h1>
        <ul className="navul">
      
        <li id="link">
        <Link to="/Task">Assignment Management</Link>
          </li>
          <li id="link">
            <Link to="/calendar">Calendar</Link>
          </li>
          <li id="link">
            <Link to="/profile">Profile</Link>
          </li>
          <li id="link">
            <Link to="/loginpage">Logout</Link>
          </li>
        </ul>
      </nav>
      <Outlet />
    </div>
  );
}
