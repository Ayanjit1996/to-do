import React, { useState } from "react";
import { MakeAuthenticatedRequest } from "./APIHelper";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

function Signin({ setOtpModalOpen, setId }) {
    const [credential, setCredential] = useState("email");
    const [clickDisable, setClickDisable] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        username: "",
        password: "",
        agreeToTerms: false,
    });

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleCredentialChange = (e) => setCredential(e.target.value);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setClickDisable(true);
        try {
            setId(credential === "email" ? formData.email : formData.username);
        
            const loginData = {
                email: credential === "email" ? formData.email : "",
                username: credential === "username" ? formData.username : "",
                password: formData.password,
                agreeToTerms: formData.agreeToTerms,
            };

            const response = await MakeAuthenticatedRequest(
                `${API_BASE_URL}/api/login/`,
                'POST',
                loginData,
                false
            );

            // console.log("Signin successful:", response.data);
            // alert(response.data.message);
            setOtpModalOpen(true);

        } catch (error) {
            console.error('Signin error:', error.response?.data?.message || error.message);

            let errorMessage = "An error occurred during sign-in.";
            if (error.response?.data) {
                const errorData = error.response.data.message;
                errorMessage = Array.isArray(errorData) ? errorData.join(", ") : errorData;
            }

            alert(errorMessage);
        } finally {
            setClickDisable(false);
        }
    };

    return (
        <div className="col container custom_signin">
            <form className="row g-3" onSubmit={handleSubmit}>
                <div className="col-12">
                    <div className="form-label d-flex">
                        <div className="form-check text-start fw-bold ms-3">
                            <input
                                className="form-check-input border"
                                type="radio"
                                name="credential"
                                value="email"
                                checked={credential === "email"}
                                onChange={handleCredentialChange}
                                required
                            />
                            <label className="form-check-label text-start">
                                Email
                            </label>
                        </div>
                        <b>OR</b>
                        <div className="form-check text-start fw-bold me-3">
                            <input
                                className="form-check-input border"
                                type="radio"
                                name="credential"
                                value="username"
                                checked={credential === "username"}
                                onChange={handleCredentialChange}
                                required
                            />
                            <label className="form-check-label text-start">
                                Username
                            </label>
                        </div>
                    </div>
                    {credential === "email" ? (
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            placeholder="Enter email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                        />
                    ) : (
                        <input
                            type="text"
                            name="username"
                            className="form-control"
                            placeholder="Enter username"
                            required
                            value={formData.username}
                            onChange={handleChange}
                        />
                    )}
                </div>
                <div className="col-12">
                    <div className="form-label text-end fw-bold">Password</div>
                    <input
                        type="password"
                        name="password"
                        className="form-control"
                        required
                        value={formData.password}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-12">
                    <div className="form-check text-start fw-bold">
                        <input
                            className="form-check-input border"
                            type="checkbox"
                            name="agreeToTerms"
                            checked={formData.agreeToTerms}
                            onChange={handleChange}
                            required
                        />
                        <label className="form-check-label text-start">
                            I agree
                        </label>
                    </div>
                </div>
                <div className="col-12 text-start">
                    <button 
                        type="submit" 
                        className="btn btn-primary col-12" 
                        disabled={clickDisable} 
                    >
                        {clickDisable ? 'Signing in...' : 'Sign in'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Signin;