import { MakeAuthenticatedRequest } from './APIHelper';
import React, { useState } from 'react';

function Navbar({ signup, signin, signoff, toggleSignup, toggleSignin, setIsLoggedIn, setSignoff, setSignin, setSignup, setLanding }) {

    const handleLogout = async () => {
        try {
            const logout = MakeAuthenticatedRequest('http://13.49.66.75/api/logout/','DELETE')
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            console.log(logout)
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
