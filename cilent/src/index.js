import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './components/AuthProvider';

// Create a root
const container = document.getElementById('root');
const root = createRoot(container); 

// Initial render
root.render(
    <AuthProvider>
        <App />
    </AuthProvider>
);
