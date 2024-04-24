import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import axios from 'axios'; // Import axios for API requests
import { BsPerson, BsHouseDoor, BsPeople } from 'react-icons/bs';
import { FaCalendarAlt } from "react-icons/fa"; // Import Bootstrap icons
import "./Header.css";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    // Check if the user is logged in (you can implement your own logic here)
    const userIsLoggedIn = localStorage.getItem('token') !== null;
    setIsLoggedIn(userIsLoggedIn);
    import('bootstrap/dist/css/bootstrap.min.css');
  }, []);


  const handleLogout = () => {
    try {
      // Clear authentication token from local storage
      localStorage.removeItem('authToken');
      // Redirect to the login page or perform any other action
      window.location.href = '/'; // Redirect to the login page after logout
    } catch (error) {
      console.error('Logout error:', error);
      // Handle error if logout fails
    }
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
      <div className="container-fluid">
        <a className="navbar-brand">DEV WEB</a>
        <button
          className="navbar-toggler"
          type="button"
          onClick={handleMenuToggle}
          aria-label={isMenuOpen ? "close menu" : "menu"}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/Dashboard"><BsHouseDoor /> Acceuil</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/users"><BsPeople /> Utilisateurs</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/Conge"><FaCalendarAlt /> Congés</Link>
            </li>
            <li className="nav-item">
            <Link className="nav-link" to="/motif"><FaCalendarAlt /> Motif</Link>
            </li>
          </ul>
          <div className="d-flex align-items-center">
            <div className="search-container me-3">
              <input className="input form-control form-control-sm" type="text" placeholder="Search.." />
            </div>
            <div className="position-relative" ref={menuRef}>
              <BsPerson size={50} color="white" className="me-3" onClick={handleMenuToggle} />
              {isMenuOpen && (
                <div className="user-menu position-absolute bg-dark p-2 rounded">
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <button className="btn btn-danger" onClick={handleLogout}>
                        Déconnecter
                      </button>
                    </li>
                    {/* Add other menu items here */}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
