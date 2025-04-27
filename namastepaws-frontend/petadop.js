document.addEventListener('DOMContentLoaded', function() {
            const API_BASE_URL = 'http://localhost:5000/api';
            let currentPage = 'adopt'; // Track current page
            let currentPet = null; // Track currently viewed pet
            let authToken = localStorage.getItem('authToken') || null;

            // 1. Navigation System
            function setupNavigation() {
                const nav = document.querySelector('nav');

                nav.addEventListener('click', function(e) {
                    const link = e.target.closest('a[data-page]');
                    if (!link) return;

                    e.preventDefault();
                    const pageId = link.getAttribute('data-page');
                    console.log(`Nav link clicked: ${pageId}, currentPage before: ${currentPage}`);

                    if (pageId !== currentPage) {
                        currentPage = pageId;
                        console.log(`Changing page to: ${pageId}`);
                        showPage(pageId);

                        // Update active link styling
                        nav.querySelectorAll('a').forEach(navLink => {
                            navLink.classList.toggle('active', navLink === link);
                        });
                    } else {
                        console.log(`Clicked on current page: ${pageId}, no action taken.`);
                    }
                });

                // Remove admin login nav link if exists
                const adminLoginNavLink = nav.querySelector('a[data-page="admin-login"]');
                if (adminLoginNavLink) {
                    adminLoginNavLink.parentElement.remove();
                }
            }

            // 2. Page Display System
            function showPage(pageId) {
                console.log(`Loading page: ${pageId}`);

                // Hide all pages
                document.querySelectorAll('.page-section').forEach(section => {
                    section.classList.remove('active');
                    section.classList.add('hidden');
                });

                // Show requested page
                const activePage = document.getElementById(`${pageId}-page`);
                if (activePage) {
                    activePage.classList.remove('hidden');
                    activePage.classList.add('active');
                    console.log(`Page shown: ${pageId}`);

                    // Load data if needed
                    switch (pageId) {
                        case 'adopt':
                            if (!activePage.dataset.loaded) {
                                loadPets();
                                activePage.dataset.loaded = 'true';
                            }
                            break;
                        case 'shelters':
                            if (!activePage.dataset.loaded) {
                                loadShelters();
                                activePage.dataset.loaded = 'true';
                            }
                            break;
                        case 'contact':
                            setupContactForm();
                            break;
                        case 'about':
                            // Static content, no loading needed
                            break;
                        case 'pet-details':
                            if (currentPet) {
                                showPetDetails(currentPet);
                            }
                            break;
                        case 'login':
                            setupLoginForm();
                            break;
                        case 'signup':
                            setupSignupForm();
                            break;
                    }
                }
            }

            // 3. Data Loading Functions
            async function loadPets() {
                const container = document.getElementById('adopt-pet-list');
                console.log('loadPets called');
                try {
                    container.innerHTML = '<div class="loading-spinner"></div>';
                    const response = await fetch(`${API_BASE_URL}/pets`);
                    console.log('fetch response:', response);

                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                    const pets = await response.json();
                    console.log('pets data:', pets);
                    displayPets(pets, container);
                } catch (error) {
                    console.error('Pet loading error:', error);
                    container.innerHTML = `
        <div class="error-message">
            <p>😿 Couldn't load pets</p>
            <p class="error-detail">${error.message}</p>
            <button class="retry-btn" onclick="loadPets()">Try Again</button>
        </div>
    `;
                }
            }

            async function loadShelters() {
                const container = document.getElementById('shelter-list');
                try {
                    container.innerHTML = '<div class="loading-spinner"></div>';
                    const response = await fetch(`${API_BASE_URL}/shelters`);

                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                    const shelters = await response.json();
                    console.log('Fetched shelters data:', shelters);
                    displayShelters(shelters, container);
                } catch (error) {
                    console.error('Shelter loading error:', error);
                    container.innerHTML = `
            <div class="error-message">
                <p>🏠 Couldn't load shelters</p>
                <p class="error-detail">${error.message}</p>
                <button class="retry-btn" onclick="loadShelters()">Try Again</button>
            </div>
        `;
                }
            }

            // 4. Display Functions
            function displayPets(pets, container) {
                console.log('displayPets called with pets:', pets);
                container.innerHTML = pets.length > 0 ?
                    pets
                    .map(
                        pet => `
        <div class="pet-card">
            <img src="${pet.image || 'https://placehold.co/300x200?text=No+Image'}" 
                 alt="${pet.name}"
                 onerror="this.src='https://placehold.co/300x200?text=Image+Error'">
            <div class="pet-info">
                <h3>${pet.name}</h3>
                <p><span class="breed">${pet.breed}</span>, <span class="age">${pet.age} years</span></p>
                <p class="description">${pet.description}</p>
                <p class="status">Status: <strong>${pet.status}</strong></p>
                <button class="details-btn" data-id="${pet.id}">View Details</button>
            </div>
        </div>
      `
                    )
                    .join('') :
                    '<div class="no-results">No pets available at this time.</div>';

                // Add event listeners to details buttons
                container.querySelectorAll('.details-btn').forEach(button => {
                    button.addEventListener('click', () => {
                        const petId = button.getAttribute('data-id');
                        const pet = pets.find(p => p.id == petId);
                        if (pet) {
                            currentPet = pet;
                            // Show pet details page instead of modal
                            showPage('pet-details');
                        }
                    });
                });
            }

            function displayShelters(shelters, container) {
                container.innerHTML = shelters.length > 0 ?
                    shelters
                    .map(
                        shelter => `
            <div class="shelter-card">
                <h3>${shelter.name || 'N/A'}</h3>
                <div class="contact-info">
                    <p><i class="fas fa-envelope"></i> ${shelter.email || 'N/A'}</p>
                    <p><i class="fas fa-phone"></i> ${shelter.phone || 'N/A'}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${shelter.address || 'N/A'}</p>
                </div>
                <a href="https://maps.google.com/?q=${encodeURIComponent(
                    shelter.address || ''
                )}" 
                   target="_blank" class="map-link">
                    <i class="fas fa-map"></i> View on Map
                </a>
            </div>
          `
                    )
                    .join('') :
                    '<div class="no-results">No shelters found in our database.</div>';
            }

            // Show pet details page
            function showPetDetails(pet) {
                const container = document.querySelector('.pet-details-container');
                if (!container) return;

                container.innerHTML = `
        <h2>${pet.name}</h2>
        <img src="${pet.image || 'https://placehold.co/300x200?text=No+Image'}" alt="${pet.name}" onerror="this.src='https://placehold.co/300x200?text=Image+Error'">
        <p><strong>Breed:</strong> ${pet.breed}</p>
        <p><strong>Age:</strong> ${pet.age} years</p>
        <p><strong>Description:</strong> ${pet.description}</p>
        <p><strong>Status:</strong> <span id="pet-status">${pet.status}</span></p>
        ${pet.status === 'Available'
            ? '<button id="adopt-btn" class="button primary">Adopt</button>'
            : '<p>This pet has already been adopted.</p>'
        }
        <button id="back-btn" class="button secondary">Back to List</button>
        `;

                // Setup adopt button
                const adoptBtn = document.getElementById('adopt-btn');
                if (adoptBtn) {
                    adoptBtn.addEventListener('click', async() => {
                        adoptBtn.disabled = true;
                        adoptBtn.textContent = 'Adopting...';
                        try {
                            const response = await fetch(`${API_BASE_URL}/pets/${pet.id}/adopt`, {
                                method: 'PUT',
                            });
                            if (!response.ok) throw new Error('Failed to adopt pet');
                            const data = await response.json();
                            alert(`You have successfully adopted ${data.pet.name}!`);
                            pet.status = 'Adopted';
                            const petStatus = document.getElementById('pet-status');
                            if (petStatus) petStatus.textContent = 'Adopted';
                            adoptBtn.remove();
                            loadPets();
                        } catch (error) {
                            alert('Error adopting pet. Please try again.');
                            adoptBtn.disabled = false;
                            adoptBtn.textContent = 'Adopt';
                        }
                    });
                }

                // Setup back button
                const backBtn = document.getElementById('back-btn');
                if (backBtn) {
                    backBtn.addEventListener('click', () => {
                        showPage('adopt');
                    });
                }
            }

            // 5. Contact Form Handling
            function setupContactForm() {
                const form = document.getElementById('contact-form');
                if (form) {
                    form.addEventListener('submit', async function(e) {
                        e.preventDefault();

                        const submitBtn = form.querySelector('button[type="submit"]');
                        const originalText = submitBtn.textContent;

                        const formData = {
                            name: form.elements['name'].value,
                            email: form.elements['email'].value,
                            message: form.elements['message'].value,
                        };

                        try {
                            submitBtn.disabled = true;
                            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

                            const response = await fetch('http://localhost:5000/api/contact', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(formData),
                            });

                            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }

                            alert('Thank you for your message! We will respond soon.');
                            form.reset();
                        } catch (error) {
                            console.error('Form error:', error);
                            alert('There was an error sending your message. Please try again.');
                        } finally {
                            submitBtn.disabled = false;
                            submitBtn.textContent = originalText;
                        }
                    });
                }
            }

            // 6. Login Form Handling
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
                                showPage('admin-dashboard');
                                // Load admin dashboard data
                                loadAdminDashboard();
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
                            showPage('adopt');
                        } catch (error) {
                            alert('Error during login. Please try again.');
                            console.error('Login error:', error);
                        }
                    });
                }
            }
        }

        async function loadAdminDashboard() {
            const adminToken = localStorage.getItem('adminToken');
            if (!adminToken) return;

            try {
                const response = await fetch('http://localhost:5000/api/admin/adoption-requests', {
                    headers: {
                        'Authorization': `Bearer ${adminToken}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch adoption requests');
                }
                const requests = await response.json();
                populateAdminTable(requests);
            } catch (error) {
                alert(error.message);
            }
        }

        function populateAdminTable(requests) {
            const tbody = document.querySelector('#admin-requests-table tbody');
            tbody.innerHTML = '';
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

            tbody.appendChild(tr);
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
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            alert('Admin not logged in');
            return;
        }
        try {
            const response = await fetch(`http://localhost:5000/api/admin/adoption-requests/${id}/status`, {
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
            await loadAdminDashboard();
        } catch (error) {
            alert(error.message);
        }
    }

    // 7. Signup Form Handling
    function setupSignupForm() {
        const form = document.getElementById('signup-form');
        if (form) {
            form.addEventListener('submit', async function(e) {
                e.preventDefault();

                const firstname = form.elements['firstname'].value;
                const lastname = form.elements['lastname'].value;
                const email = form.elements['email'].value;
                const password = form.elements['password'].value;

                try {
                    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ firstname, lastname, email, password }),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        alert(data.message || 'Signup failed');
                        return;
                    }

                    alert('Signup successful. Please login.');
                    showPage('login');
                } catch (error) {
                    alert('Error during signup. Please try again.');
                    console.error('Signup error:', error);
                }
            });
        }
    }

    // Initialize
    setupNavigation();
    showPage(currentPage); // Show default page

    // Make functions available for retry buttons
    window.loadPets = loadPets;
    window.loadShelters = loadShelters;
});