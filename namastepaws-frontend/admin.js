document.addEventListener('DOMContentLoaded', () => {
            const API_BASE_URL = 'http://localhost:5000/api/admin';

            const adminLoginPage = document.getElementById('admin-login-page');
            const adminDashboardPage = document.getElementById('admin-dashboard-page');
            const adminLoginForm = document.getElementById('admin-login-form');
            const adminLoginError = document.getElementById('admin-login-error');
            const adminLogoutBtn = document.getElementById('admin-logout-btn');
            const adminRequestsTableBody = document.querySelector('#admin-requests-table tbody');

            let adminToken = localStorage.getItem('adminToken');

            function showPage(page) {
                // Hide all admin pages
                adminLoginPage.classList.add('hidden');
                adminDashboardPage.classList.add('hidden');

                // Show the requested page
                page.classList.remove('hidden');
            }

            async function fetchAdoptionRequests() {
                try {
                    const response = await fetch(`${API_BASE_URL}/adoption-requests`, {
                        headers: {
                            'Authorization': `Bearer ${adminToken}`,
                        },
                    });
                    if (!response.ok) {
                        throw new Error('Failed to fetch adoption requests');
                    }
                    const requests = await response.json();
                    populateTable(requests);
                } catch (error) {
                    alert(error.message);
                }
            }

            function populateTable(requests) {
                adminRequestsTableBody.innerHTML = '';
                requests.forEach(req => {
                            const tr = document.createElement('tr');

                            tr.innerHTML = `
                <td>${req.id}</td>
                <td>${req.pet_name}</td>
                <td>${req.first_name} ${req.last_name}</td>
                <td>${req.email}</td>
                <td class="status-${req.status}">${req.status}</td>
                <td>${new Date(req.request_date).toLocaleString()}</td>
                <td>${req.decision_date ? new Date(req.decision_date).toLocaleString() : ''}</td>
                <td>
                    ${req.status === 'pending' ? `
                    <button class="approve-btn" data-id="${req.id}">Approve</button>
                    <button class="deny-btn" data-id="${req.id}">Deny</button>
                    ` : ''}
                </td>
            `;

            adminRequestsTableBody.appendChild(tr);
        });

        // Add event listeners for approve/deny buttons
        document.querySelectorAll('.approve-btn').forEach(button => {
            button.addEventListener('click', () => updateRequestStatus(button.dataset.id, 'approved'));
        });
        document.querySelectorAll('.deny-btn').forEach(button => {
            button.addEventListener('click', () => updateRequestStatus(button.dataset.id, 'denied'));
        });
    }

    async function updateRequestStatus(id, status) {
        try {
            const response = await fetch(`${API_BASE_URL}/adoption-requests/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`,
                },
                body: JSON.stringify({ status }),
            });
            if (!response.ok) {
                throw new Error('Failed to update adoption request status');
            }
            await fetchAdoptionRequests();
        } catch (error) {
            alert(error.message);
        }
    }

    adminLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        adminLoginError.style.display = 'none';

        const username = adminLoginForm.username.value.trim();
        const password = adminLoginForm.password.value.trim();

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Login failed');
            }

            const data = await response.json();
            adminToken = data.token;
            localStorage.setItem('adminToken', adminToken);

            showPage(adminDashboardPage);
            fetchAdoptionRequests();
        } catch (error) {
            adminLoginError.textContent = error.message;
            adminLoginError.style.display = 'block';
        }
    });

    adminLogoutBtn.addEventListener('click', () => {
        adminToken = null;
        localStorage.removeItem('adminToken');
        showPage(adminLoginPage);
    });

    // On page load, show admin dashboard if logged in, else show login
    if (adminToken) {
        showPage(adminDashboardPage);
        fetchAdoptionRequests();
    } else {
        showPage(adminLoginPage);
    }
});