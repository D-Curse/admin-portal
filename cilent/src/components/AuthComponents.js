import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthProvider';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { setAuth } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/api/auth/signup', { username, password, role: 'developer' });
            navigate('/login');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="auth_form">
            <p className="form-head">SIGNUP</p>
            <form onSubmit={handleSignup}>
                <input type="text" placeholder="Username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                <input type="password" placeholder="Password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="submit">Signup</button>
            </form>
            <a href="/login">Already have a account?</a>
        </div>
    );
};

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { setAuth } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/api/auth/login', { username, password });
            setAuth(response.data);
            navigate('/');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="auth_form">
            <p className="form-head">LOGIN</p>
            <form onSubmit={handleLogin}>
                <input type="text" placeholder="Username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                <input type="password" placeholder="Password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="submit">Login</button>
            </form>

            <a href="/signup">Dont have a account yet?</a>
        </div>
    );
};

export { Signup, Login };
