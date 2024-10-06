import axios from 'axios';

export const GetJwtToken = () => localStorage.getItem('access_token');
export const GetRefreshToken = () => localStorage.getItem('refresh_token');

const refreshAccessToken = async () => {
    try {
        const refreshToken = GetRefreshToken();
        const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
            refresh: refreshToken,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        const newAccessToken = response.data.access;
        localStorage.setItem('access_token', newAccessToken);
        return newAccessToken;
    } catch (error) {
        console.error('Error refreshing access token:', error.message);
        throw error;
    }
};

export const MakeAuthenticatedRequest = async (url, method = 'GET', data = null, requireAuth = true) => {
    try {
        let headers = requireAuth ? { Authorization: `Bearer ${GetJwtToken()}` } : {};
        console.log(url)
        if (requireAuth && !headers.Authorization) {
            throw new Error('No token found');
        }
        const config = {
            method,
            url,
            headers,
            ...(data && { data }),
        };

        const response = await axios(config);
        return response;
        
    } catch (error) {
        if (error.response && error.response.status === 401) {
            try {
                const newAccessToken = await refreshAccessToken();
                
                const headers = { Authorization: `Bearer ${newAccessToken}` };
                const config = {
                    method,
                    url,
                    headers,
                    ...(data && { data }),
                };
                
                const response = await axios(config);
                return response;
            } catch (refreshError) {
                console.error('Refresh token error:', refreshError.message);
                throw refreshError;
            }
        } else {
            console.error('Error in authenticated request:', error.message);
            throw error;
        }
    }
};
