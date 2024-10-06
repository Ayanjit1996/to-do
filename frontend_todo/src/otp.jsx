import React, { useState } from 'react';
import { MakeAuthenticatedRequest } from './APIHelper';

function OtpModal({ isOpen, onClose, Id }) {
    const [otp, setOtp] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("OTP Submitted:", otp);

        try {

            const response = await MakeAuthenticatedRequest('http://localhost:8000/verify-otp/', 'POST', {
                otp: otp,
                cred: Id
            },false);

            console.log('Response:', response);

            if (response.status === 200) {
                const { access_token, refresh_token } = response.data; 
                localStorage.setItem('access_token', access_token);
                localStorage.setItem('refresh_token', refresh_token);

                console.log('OTP verification successful:', response.data);
                window.location.reload();
                onClose(); 
            }
        } catch (error) {
            console.error('Error during OTP verification:', error.response ? error.response.data : error.message);
            setErrorMessage(error.response?.data?.message || 'Error verifying OTP. Please try again.');
        }
    };

    const handleClose = () => {
        setOtp(''); 
        setErrorMessage('');
        onClose();
    };

    if (!isOpen) return null; 

    return (
        <div className="otp-modal-overlay">
            <div className="otp-modal">
                <h2>Enter OTP</h2>
                <h6>OTP sent to your email address, valid for 2 minutes</h6>
                {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                <form className="d-flex flex-column" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6-digit OTP"
                        required
                        className="mb-3"
                        pattern="\d{6}"
                        inputMode="numeric"
                    />
                    <div className="d-flex justify-content-between">
                        <button className="btn btn-primary fw-bold" type="button" onClick={handleClose}>
                            Close
                        </button>
                        <button className="btn btn-primary fw-bold" type="submit">
                            Verify
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default OtpModal;