import './App.css';
import Navbar from './navbar';
import Landing from './landingpage';
import { React, useEffect, useState } from 'react';
import OtpModal from './otp';
import Homeview from './homeview';
import { MakeAuthenticatedRequest } from './APIHelper';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

function App() {
    const [signup, setSignup] = useState(false);
    const [signin, setSignin] = useState(true);
    const [signoff, setSignoff] = useState(false);
    const [isOtpModalOpen, setOtpModalOpen] = useState(false);
    const [landing, setLanding] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [Id, setId] = useState('');
    const [taskList, setTaskList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refresh, setRefresh] = useState(false);

    const checkAuthStatus = async () => {
        try {
            const response = await MakeAuthenticatedRequest(`${API_BASE_URL}/api`);
            if (response.status === 200) {
                setIsLoggedIn(true);
                setSignoff(true);
                setSignin(false);
                setSignup(false);
                setLanding(false);
                setTaskList(response.data);
            }
        } catch (error) {
            setIsLoggedIn(false);
            setSignin(true);
            setSignup(false);
            setSignoff(false);
            setLanding(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setRefresh(false);
        checkAuthStatus();
    }, [refresh]);

    const toggleSignup = () => {
        setSignup(false);
        setSignin(true);
    };

    const toggleSignin = () => {
        setSignup(true);
        setSignin(false);
    };

    return (
        <div className="App">
            {loading ? (
                <div className="d-flex justify-content-center align-items-center vh-100">
                    <h4>Loading...</h4>
                </div>
            ) : (
                <>
                    <Navbar 
                        signup={signup} 
                        signin={signin} 
                        signoff={signoff} 
                        toggleSignup={toggleSignup} 
                        toggleSignin={toggleSignin}
                        setIsLoggedIn={setIsLoggedIn} 
                        setSignoff={setSignoff}       
                        setSignin={setSignin}         
                        setSignup={setSignup}         
                        setLanding={setLanding}
                    />
                    {landing && (
                        <Landing 
                            signup={signup} 
                            signin={signin} 
                            setOtpModalOpen={setOtpModalOpen} 
                            setId={setId}
                        />
                    )}
                    {isLoggedIn ? (
                        <Homeview taskList={taskList}/>
                    ) : (
                        <OtpModal 
                            isOpen={isOtpModalOpen} 
                            onClose={() => setOtpModalOpen(false)} 
                            Id={Id}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default App;