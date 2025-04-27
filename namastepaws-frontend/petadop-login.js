document.addEventListener('DOMContentLoaded', function() {
    const API_BASE_URL = 'http://localhost:5000/api';
    let authToken = localStorage.getItem('authToken') || null;

    function setupLoginForm() {
        const form = document.getElementById('login-form');
        if (form) {
            form.addEventListener('submit', async function(e) {
                e.preventDefault();

                const email = form.elements['email'].value;
                const password = form.elements['password'].value;

                try {
                    // Admin login via admin API
                    const response = await fetch('http://localhost:5000/api/admin/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ username: email, password }),
                    });

                    const data = await response.json();
                    console.log('Admin login response status:', response.status);
                    console.log('Admin login response data:', data);

                    if (response.ok) {
                        localStorage.setItem('adminToken', data.token);
                        alert('Admin login successful');
                        // Redirect or show admin dashboard
                        window.location.href = '/admin.html';
                        return;
                    }
                } catch (error) {
                    console.error('Admin login error:', error);
                }

                // Normal user login
                try {
                    const response = await fetch(`${API_BASE_URL}/auth/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email, password }),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        alert(data.message || 'Login failed');
                        return;
                    }

                    authToken = data.token;
                    localStorage.setItem('authToken', authToken);
                    alert('Login successful');
                    // Redirect or show user dashboard
                    window.location.href = '/index.html';
                } catch (error) {
                    alert('Error during login. Please try again.');
                    console.error('Login error:', error);
                }
            });
        }
    }

    setupLoginForm();
});