import axios from 'axios';
import React, { useState } from 'react';
import { MakeAuthenticatedRequest } from './APIHelper';
import React, { useState } from 'react';

function Signup({ setOtpModalOpen, setId }) {
    const [clickDisable, setClickDisable] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        password: '',
        confirm_password: '',
        gender: '',
        agreeToTerms: false,
    });

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (formData.password !== formData.confirm_password) {
            alert('Passwords do not match!');
            return;
        }
        try {
            setClickDisable(true);
            setId(formData.email);

            const response = await MakeAuthenticatedRequest(
                'http://13.49.66.75/api/signup/',
                'post',
                formData,
                false
            );

            console.log('Signup successful:', response.data);
            // alert(response.data.message);

            const accessToken = response.data.access_token;
            localStorage.setItem('access_token', accessToken);
            setOtpModalOpen(true);
            
        } catch (error) {
            console.error(error);
            let errorMessage = 'An error occurred during signup.';
            if (error.response?.data) {
                const errorData = error.response.data.message;
                if (typeof errorData === 'string') {
                    errorMessage = errorData;
                } else if (Array.isArray(errorData)) {
                    errorMessage = errorData.join(', ');
                } else {
                    errorMessage = Object.values(errorData)
                        .flat()
                        .join(', ');
                }
            }
            alert(errorMessage);
        } finally {
            setClickDisable(false);
        }
    };

    return (
        <div className="col container custom_signup">
            <form className="row g-3" onSubmit={handleSubmit}>
                {['first_name', 'last_name', 'email', 'username', 'password', 'confirm_password'].map((field, index) => (
                    <div className="col-12" key={index}>
                        <div className="form-label text-end fw-bold">{field.replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase())}</div>
                        <input
                            type={field.includes('password') ? 'password' : (field === 'email' ? 'email' : 'text')}
                            className="form-control"
                            name={field}
                            value={formData[field]}
                            onChange={handleChange}
                            required
                        />
                    </div>
                ))}
                <div className="col-12">
                    <div className="form-label text-end fw-bold">Gender</div>
                    <select
                        name="gender"
                        className="form-select"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Choose...</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                    </select>
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
                        <label className="form-check-label text-start" htmlFor="gridCheck">
                            I agree 
                        </label>
                    </div>
                </div>
                <div className="col-12 text-start">
                    <button 
                        type="submit" 
                        className="btn btn-primary col-12" 
                        disabled={clickDisable} // Disable button on click
                    >
                        {clickDisable ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Signup;