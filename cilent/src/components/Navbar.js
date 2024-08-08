import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthProvider';
import './css/global.css'

const CustomNavLink = ({ to, children }) => {
    const location = useLocation()
    const isActive = location.pathname === to
    
    return (
        <li>
            <Link to={to} className={isActive ? 'active' : ''}>
                {children}
            </Link>
        </li>
    )
}

const Navbar = () => {
    const navigate = useNavigate()
    const { auth, setAuth } = useContext(AuthContext)

    const handleLogout = () => {
        setAuth(null);
        navigate('/login');
    };

    return (
        <nav>
            <p className="logo">FORMS</p>
            <ul>
                <CustomNavLink to="/form">Form</CustomNavLink>
                <CustomNavLink to="/">Dashboard</CustomNavLink>
                <button className='logout' onClick={handleLogout}>Logout</button>
            </ul>
        </nav>
    )
}

export default Navbar
