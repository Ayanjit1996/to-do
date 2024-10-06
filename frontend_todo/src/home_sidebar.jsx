import React, { useEffect, useState } from "react";
import { MakeAuthenticatedRequest } from "./APIHelper";

function Sidebar({ setRefresh }) {
    const [userProfile, setUserProfile] = useState({
        name: "Loading...",
        username: "@Loading...",
        email: "Loading...",
        profilePic: "",
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const getPersonalinfo = async () => {
        try {
            const response = await MakeAuthenticatedRequest('http://13.49.66.75/api/info');
            if (response.status === 200) {
                setUserProfile(response.data);
            } else {
                throw new Error("User invalid");
            }
        } catch (error) {
            console.error("Error fetching info:", error);
        }
    };

    const deleteProfile = async () => {
        setIsDeleting(true);
        try {
            const response = await MakeAuthenticatedRequest('http://13.49.66.75/api/deleteuser/', 'DELETE');

            if (response.status === 200) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                alert(response.data.message);
                console.log(response.data);
                window.location.reload();
            } else {
                throw new Error("User deletion failed");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
        } finally {
            setIsDeleting(false); 
        }
    };

    useEffect(() => {
        getPersonalinfo();
    }, []);

    return (
        <div className="sidebar d-flex flex-column vh-90">
            {isDeleting && <div className="overlay"></div>}
            <div className="profile-pic flex-shrink-0">
                <img src="/images/bg.png" alt="Profile Pic" />
            </div>
            <div className="user-info flex-shrink-0">
                <h4 className="name">{userProfile.name}</h4>
                <p className="username">{userProfile.username}</p>
                <p className="email">{userProfile.email}</p>
            </div>
            <div className="d-flex flex-column flex-grow-1">
                <div className="mt-auto mb-5">
                    <button type="button" className="btn btn-danger fw-bold d-flex justify-content-center" onClick={deleteProfile}>DELETE PROFILE</button>
                </div>
            </div>
            {isDeleting && <div className="engage">Deleting Profile...</div>} 
        </div>
    );
}

export default Sidebar;