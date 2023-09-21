import React, { useState } from 'react';
import "./NavBar.css"
import { Link, useNavigate } from "react-router-dom"

function NavBar() {

  return (
    <div className='navBarContainer'>
      <h1 id='header'>stuidy</h1>
      <button id='login'>Log in</button>
      <nav className='navBar'>
        <ul>
          <li> <Link id='link' >Home</Link></li>
          <li><Link id='link'>Task Managment</Link></li>
          <li> <Link id='link'>Calendar</Link></li>
          <li> <Link id='link'>Profile</Link></li>
        </ul>
      </nav>
    </div>
  )
}

export default NavBar;