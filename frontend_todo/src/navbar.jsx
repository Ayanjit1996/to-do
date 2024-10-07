import { MakeAuthenticatedRequest } from './APIHelper';
import React from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

function Navbar({ signup, signin, signoff, toggleSignup, toggleSignin, setIsLoggedIn, setSignoff, setSignin, setSignup, setLanding }) {

    const handleLogout = async () => {
        try {
            const logout = MakeAuthenticatedRequest(`${API_BASE_URL}/api/logout/`, 'DELETE');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setIsLoggedIn(false);
            setSignoff(false);
            setSignin(true);
            setSignup(false);
            setLanding(true);
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <div>
            <nav className="navbar navbar-expand-lg bg-body-tertiary">
                <div className="container-fluid">
                    <a className="navbar-brand brand fw-bold fs-3" href="#">
                        To-do-LIST
                    </a>
                    {signin && (
                        <a 
                            className="nav-link active fw-bold fs-5 brand-sub ps-4" 
                            aria-current="page" 
                            href="#"
                            onClick={toggleSignin}
                        >
                            Sign In
                        </a>
                    )}
                    {signup && (
                        <a 
                            className="nav-link active fw-bold fs-5 brand-sub ps-4" 
                            aria-current="page" 
                            href="#"
                            onClick={toggleSignup}
                        >
                            Sign Up
                        </a>
                    )}
                    {signoff && (
                        <a className="btn btn-danger fw-bold d-flex justify-content-center" onClick={handleLogout}>
                            Log Out
                        </a>                    
                    )}
                </div>
            </nav>
        </div>
    );
}

export default Navbar;