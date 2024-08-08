import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './components/AuthProvider';
import { Signup, Login } from './components/AuthComponents';
import Home from './components/Home';
import Forms from './components/Forms';
import Navbar from './components/Navbar';

const PrivateRoute = ({ element, ...rest }) => {
    const { auth } = useContext(AuthContext);
    return auth ? element : <Navigate to="/login" />;
};

const AppContent = () => {
    const location = useLocation();
    const showNavbar = location.pathname !== '/form';

    return (
        <>
            {showNavbar && <Navbar />}
            <Routes>
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/form" element={<Forms />} />
                <Route path="/" element={<PrivateRoute element={<Home />} />} />
            </Routes>
        </>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
};

export default App;
