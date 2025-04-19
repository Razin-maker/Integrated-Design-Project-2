// Sample property data (in a real app, this would come from a database)
let properties = JSON.parse(localStorage.getItem('properties')) || [];

// DOM Elements
const propertyContainer = document.getElementById('property-container');
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('nav ul');

// Toggle mobile menu
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Display properties for seller
function displaySellerProperties() {
    const container = document.getElementById('property-container');
    if (!container) return;

    // Load properties from localStorage
    const properties = JSON.parse(localStorage.getItem('properties')) || [];
    
    // Filter properties for the current seller
    const sellerProperties = properties.filter(property => 
        property.sellerId === currentUser.email
    );

    // Update property counts
    const totalProperties = sellerProperties.length;
    const forSaleProperties = sellerProperties.filter(p => p.status === 'For Sale').length;
    const soldProperties = sellerProperties.filter(p => p.status === 'Sold').length;

    // Update the statistics display
    const statsContainer = document.getElementById('property-stats');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-card">
                <i class="fas fa-home"></i>
                <h3>${totalProperties}</h3>
                <p>Total Properties</p>
            </div>
            <div class="stat-card">
                <i class="fas fa-tag"></i>
                <h3>${forSaleProperties}</h3>
                <p>For Sale</p>
            </div>
            <div class="stat-card">
                <i class="fas fa-check-circle"></i>
                <h3>${soldProperties}</h3>
                <p>Sold</p>
            </div>
        `;
    }

    if (sellerProperties.length === 0) {
        container.innerHTML = `
            <div class="no-properties">
                <i class="fas fa-home fa-3x"></i>
                <h3>No Properties Listed Yet</h3>
                <p>Start by listing your first property</p>
                <a href="property-listing.html" class="btn">
                    <i class="fas fa-plus"></i> List Your First Property
                </a>
            </div>
        `;
        return;
    }

    container.innerHTML = sellerProperties.map(property => `
        <div class="property-card">
            <div class="property-image">
                <img src="${property.image}" alt="${property.title}">
                <div class="property-status ${property.status.toLowerCase().replace(' ', '-')}">
                    ${property.status}
                </div>
            </div>
            <div class="property-info">
                <h3>${property.title}</h3>
                <p class="property-address"><i class="fas fa-map-marker-alt"></i> ${property.address}</p>
                <p class="property-price">$${property.price.toLocaleString()}</p>
                <div class="property-details">
                    <span><i class="fas fa-bed"></i> ${property.bedrooms} Beds</span>
                    <span><i class="fas fa-bath"></i> ${property.bathrooms} Baths</span>
                    <span><i class="fas fa-ruler-combined"></i> ${property.area} sqft</span>
                </div>
                <div class="property-features">
                    ${property.features.slice(0, 3).map(feature => `
                        <span class="feature-tag">${feature}</span>
                    `).join('')}
                    ${property.features.length > 3 ? `<span class="feature-tag">+${property.features.length - 3} more</span>` : ''}
                </div>
                <div class="property-actions">
                    <button onclick="editProperty('${property.id}')" class="btn btn-edit">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="markAsSold('${property.id}')" class="btn btn-sold">
                        <i class="fas fa-check-circle"></i> Mark as Sold
                    </button>
                    <button onclick="deleteProperty('${property.id}')" class="btn btn-delete">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Display properties for customers
function displayAvailableProperties() {
    const container = document.getElementById('property-container');
    if (!container) return;

    // Load properties from localStorage
    const properties = JSON.parse(localStorage.getItem('properties')) || [];
    
    // Filter available properties
    const availableProperties = properties.filter(property => 
        property.status === 'For Sale' || property.status === 'For Rent'
    );

    if (availableProperties.length === 0) {
        container.innerHTML = `
            <div class="no-properties">
                <i class="fas fa-home fa-3x"></i>
                <h3>No Properties Available</h3>
                <p>Check back later for new listings</p>
            </div>
        `;
        return;
    }

    container.innerHTML = availableProperties.map(property => `
        <div class="property-card">
            <div class="property-image">
                <img src="${property.image}" alt="${property.title}">
                <div class="property-status ${property.status.toLowerCase().replace(' ', '-')}">
                    ${property.status}
                </div>
            </div>
            <div class="property-info">
                <h3>${property.title}</h3>
                <p class="property-address"><i class="fas fa-map-marker-alt"></i> ${property.address}</p>
                <p class="property-price">৳${property.price.toLocaleString()}</p>
                <div class="property-details">
                    <span><i class="fas fa-bed"></i> ${property.bedrooms} Beds</span>
                    <span><i class="fas fa-bath"></i> ${property.bathrooms} Baths</span>
                    <span><i class="fas fa-ruler-combined"></i> ${property.area} sqft</span>
                </div>
                <div class="property-features">
                    ${property.features.slice(0, 3).map(feature => `
                        <span class="feature-tag">${feature}</span>
                    `).join('')}
                    ${property.features.length > 3 ? `<span class="feature-tag">+${property.features.length - 3} more</span>` : ''}
                </div>
                <button onclick="viewPropertyDetails('${property.id}')" class="btn btn-primary">
                    <i class="fas fa-eye"></i> View Details
                </button>
            </div>
        </div>
    `).join('');
}

// Property management functions
function editProperty(id) {
    // Load properties from localStorage
    properties = JSON.parse(localStorage.getItem('properties')) || [];
    
    const property = properties.find(p => p.id === id);
    if (!property) return;

    // Store the property data in localStorage for the edit form
    localStorage.setItem('editProperty', JSON.stringify(property));
    window.location.href = 'property-listing.html?edit=' + id;
}

function markAsSold(id) {
    if (confirm('Are you sure you want to mark this property as sold?')) {
        // Load properties from localStorage
        properties = JSON.parse(localStorage.getItem('properties')) || [];
        
        const propertyIndex = properties.findIndex(p => p.id === id);
        if (propertyIndex !== -1) {
            properties[propertyIndex].status = 'Sold';
            // Update localStorage
            localStorage.setItem('properties', JSON.stringify(properties));
            displaySellerProperties();
            alert('Property marked as sold successfully!');
        }
    }
}

function deleteProperty(id) {
    if (confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
        // Load properties from localStorage
        properties = JSON.parse(localStorage.getItem('properties')) || [];
        
        const propertyIndex = properties.findIndex(p => p.id === id);
        if (propertyIndex !== -1) {
            properties.splice(propertyIndex, 1);
            // Update localStorage
            localStorage.setItem('properties', JSON.stringify(properties));
            displaySellerProperties();
            alert('Property deleted successfully!');
        }
    }
}

// View property details
function viewPropertyDetails(id) {
    // Load properties from localStorage
    properties = JSON.parse(localStorage.getItem('properties')) || [];
    
    const property = properties.find(p => p.id === id);
    if (!property) return;

    // Store the property data in localStorage for the details page
    localStorage.setItem('viewProperty', JSON.stringify(property));
    window.location.href = 'property-details.html?id=' + id;
}

// Load property details on property details page
function loadPropertyDetails() {
    const container = document.getElementById('property-details-container');
    if (!container) return;

    // Get property ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('id');

    if (!propertyId) {
        container.innerHTML = '<div class="error-message">Property not found</div>';
        return;
    }

    // Load property from localStorage
    const properties = JSON.parse(localStorage.getItem('properties')) || [];
    const property = properties.find(p => p.id === propertyId);

    if (!property) {
        container.innerHTML = '<div class="error-message">Property not found</div>';
        return;
    }

    // Format the Google Maps URL correctly
    let mapUrl = property.mapUrl;
    if (mapUrl) {
        // If it's already an embed URL, use it directly
        if (mapUrl.includes('embed')) {
            // Do nothing, use the URL as is
        }
        // If it's a regular Google Maps URL
        else if (mapUrl.includes('maps.google.com/')) {
            // Extract the location parameters
            const locationMatch = mapUrl.match(/q=([^&]+)/);
            if (locationMatch && locationMatch[1]) {
                mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d0!2d0!3d0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z0JzQvtC70L7QstC-0Lkg0JzQvtC70L7QstC-0Lk!5e0!3m2!1sru!2sru!4v0!5m2!1sru!2sru&q=${encodeURIComponent(locationMatch[1])}`;
            }
        }
        // If it's a share URL
        else if (mapUrl.includes('google.com/maps')) {
            // Try to convert share URL to embed
            const locationMatch = mapUrl.match(/@([^,]+),([^,]+),/);
            if (locationMatch && locationMatch[1] && locationMatch[2]) {
                mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d0!2d0!3d0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z0JzQvtC70L7QstC-0Lkg0JzQvtC70L7QstC-0Lk!5e0!3m2!1sru!2sru!4v0!5m2!1sru!2sru&q=${locationMatch[1]},${locationMatch[2]}`;
            }
        }
    }

    // Create property details HTML
    const propertyDetails = `
        <div class="property-details">
            <div class="property-details-header">
                <h1>${property.title}</h1>
                <div class="property-price">$${property.price.toLocaleString()}</div>
                <div class="property-address">
                    <i class="fas fa-map-marker-alt"></i>
                    ${property.address}
                </div>
            </div>

            <div class="property-image">
                <img src="${property.image}" alt="${property.title}">
            </div>

            <div class="property-map">
                <h3>Location</h3>
                <div class="map-container">
                    ${mapUrl ? 
                        `<iframe 
                            src="${mapUrl}" 
                            width="100%" 
                            height="450" 
                            style="border:0;" 
                            allowfullscreen="" 
                            loading="lazy" 
                            referrerpolicy="no-referrer-when-downgrade">
                        </iframe>` : 
                        `<div class="no-map">
                            <i class="fas fa-map-marked-alt fa-3x"></i>
                            <p>No location map available</p>
                        </div>`
                    }
                </div>
            </div>

            <div class="property-info">
                <div class="property-specs">
                    <div class="spec-item">
                        <i class="fas fa-bed"></i>
                        <span>${property.bedrooms} Bedrooms</span>
                    </div>
                    <div class="spec-item">
                        <i class="fas fa-bath"></i>
                        <span>${property.bathrooms} Bathrooms</span>
                    </div>
                    <div class="spec-item">
                        <i class="fas fa-ruler-combined"></i>
                        <span>${property.area} sq ft</span>
                    </div>
                    <div class="spec-item">
                        <i class="fas fa-home"></i>
                        <span>${property.type}</span>
                    </div>
                </div>

                <div class="property-description">
                    <h3>Description</h3>
                    <p>${property.description}</p>
                </div>

                <div class="property-features">
                    <h3>Features</h3>
                    <ul>
                        ${property.features.map(feature => `
                            <li><i class="fas fa-check"></i> ${feature}</li>
                        `).join('')}
                    </ul>
                </div>

                <div class="property-contact">
                    <h3>Contact Seller</h3>
                    <button onclick="contactSeller('${property.sellerId}')" class="btn">
                        <i class="fas fa-envelope"></i> Contact Seller
                    </button>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = propertyDetails;
}

// Contact seller function
function contactSeller(sellerEmail) {
    window.location.href = `mailto:${sellerEmail}?subject=Interested in your property listing`;
}

// Form validation
function validateForm(form) {
    if (!form) return false;

    let isValid = true;
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
    });

    // Password confirmation check for registration
    if (form.id === 'registerForm') {
        const password = form.querySelector('#password');
        const confirmPassword = form.querySelector('#confirmPassword');
        if (password && confirmPassword && password.value !== confirmPassword.value) {
            isValid = false;
            confirmPassword.classList.add('error');
            alert("Passwords don't match!");
        }
    }

    return isValid;
}

// Registration functionality
function handleRegistration(e) {
    e.preventDefault();
    const form = e.target;
    
    if (!validateForm(form)) {
        return;
    }

    const fullName = form.querySelector('#fullName').value;
    const email = form.querySelector('#email').value;
    const phone = form.querySelector('#phone').value;
    const password = form.querySelector('#password').value;
    const userType = form.querySelector('input[name="userType"]:checked').value;

    // Create user object
    const userData = {
        fullName: fullName,
        email: email,
        phone: phone,
        password: password,
        userType: userType,
        createdAt: new Date().toISOString()
    };

    // Check if email already exists
    if (users.some(user => user.email === email)) {
        alert('Email already registered. Please use a different email or login.');
        return;
    }

    // Add new user
    users.push(userData);
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('Registration successful! Redirecting to login page...');
    window.location.href = 'login.html';
}

// Login functionality
function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    
    if (!validateForm(form)) {
        return;
    }

    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;
    const userType = form.querySelector('input[name="userType"]:checked').value;

    const user = users.find(u => 
        u.email === email && 
        u.password === password && 
        u.userType === userType
    );

    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Redirect based on user type
        if (userType === 'seller') {
            window.location.href = 'seller-dashboard.html';
        } else {
            window.location.href = 'customer-dashboard.html';
        }
    } else {
        alert('Invalid credentials. Please try again.');
    }
}

// User Management
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null;

// Check if user is logged in
function checkAuth() {
    if (currentUser) {
        // Update navigation based on user type
        const nav = document.querySelector('nav ul');
        if (nav) {
            const loginLink = nav.querySelector('a[href="login.html"]');
            const registerLink = nav.querySelector('a[href="register.html"]');
            
            if (loginLink && registerLink) {
                loginLink.textContent = 'Logout';
                loginLink.href = '#';
                loginLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    sessionStorage.removeItem('currentUser');
                    window.location.href = 'index.html';
                });
                
                registerLink.style.display = 'none';
            }
        }
    }
}

// Handle property listing form submission
function handlePropertyListing(e) {
    e.preventDefault();
    const form = e.target;
    
    if (!validateForm(form)) {
        return;
    }

    // Get form data
    const formData = new FormData(form);
    const imageFile = formData.get('image');
    
    // Create a promise to handle image upload
    const handleImageUpload = new Promise((resolve) => {
        if (imageFile instanceof File) {
            const reader = new FileReader();
            reader.onload = function(e) {
                resolve(e.target.result);
            };
            reader.readAsDataURL(imageFile);
        } else {
            resolve(imageFile); // If it's already a URL (for editing)
        }
    });

    // Process the form data after image is handled
    handleImageUpload.then(imageData => {
        const propertyData = {
            id: Date.now().toString(),
            title: form.querySelector('#title').value,
            address: form.querySelector('#address').value,
            price: parseFloat(form.querySelector('#price').value),
            type: form.querySelector('#type').value,
            status: form.querySelector('#status').value,
            bedrooms: parseInt(form.querySelector('#bedrooms').value),
            bathrooms: parseInt(form.querySelector('#bathrooms').value),
            area: parseFloat(form.querySelector('#area').value),
            image: imageData,
            mapUrl: form.querySelector('#mapUrl').value,
            description: form.querySelector('#description').value,
            features: Array.from(form.querySelectorAll('input[name="features"]:checked')).map(cb => cb.value),
            sellerId: currentUser.email,
            listedAt: new Date().toISOString()
        };

        // Save property to localStorage
        const properties = JSON.parse(localStorage.getItem('properties')) || [];
        properties.push(propertyData);
        localStorage.setItem('properties', JSON.stringify(properties));

        // Use session storage to set a flag that indicates a property was just added
        // This will be used to ensure displaySellerProperties is called when the dashboard loads
        sessionStorage.setItem('propertyAdded', 'true');

        alert('Property listed successfully!');
        window.location.href = 'seller-dashboard.html';
    });
}

// Initialize property form with edit data if available
function initPropertyForm() {
    const form = document.getElementById('propertyListingForm');
    if (!form) return;

    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    
    if (editId) {
        const editProperty = JSON.parse(localStorage.getItem('editProperty'));
        if (editProperty) {
            // Populate form with property data
            form.querySelector('#title').value = editProperty.title;
            form.querySelector('#address').value = editProperty.address;
            form.querySelector('#price').value = editProperty.price;
            form.querySelector('#type').value = editProperty.type;
            form.querySelector('#status').value = editProperty.status;
            form.querySelector('#bedrooms').value = editProperty.bedrooms;
            form.querySelector('#bathrooms').value = editProperty.bathrooms;
            form.querySelector('#area').value = editProperty.area;
            form.querySelector('#description').value = editProperty.description;

            // Check the features checkboxes
            editProperty.features.forEach(feature => {
                const checkbox = form.querySelector(`input[value="${feature}"]`);
                if (checkbox) checkbox.checked = true;
            });

            // Update form title and button
            form.querySelector('h2').textContent = 'Edit Property';
            form.querySelector('button[type="submit"]').textContent = 'Update Property';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize users array and current user
    if (!localStorage.getItem('users')) {
        // Add default users if none exist
        const defaultUsers = [
            {
                fullName: "John Doe",
                email: "john@example.com",
                phone: "123-456-7890",
                password: "password123",
                userType: "customer",
                createdAt: new Date().toISOString()
            },
            {
                fullName: "Jane Smith",
                email: "jane@example.com",
                phone: "987-654-3210",
                password: "password123",
                userType: "seller",
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
        users = defaultUsers;
    } else {
        users = JSON.parse(localStorage.getItem('users'));
    }

    // Check if user is logged in
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        
        // Fix for currentUser being stored in sessionStorage as mentioned in original code
        // This ensures we have the currentUser in the right place
        sessionStorage.setItem('currentUser', storedUser);
    }

    // Initialize register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }

    // Initialize login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Initialize property listing form
    const listingForm = document.getElementById('propertyListingForm');
    if (listingForm) {
        listingForm.addEventListener('submit', handlePropertyListing);
    }

    // Initialize search form
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Implement search functionality here
        });
    }

    // Initialize logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            currentUser = null;
            localStorage.removeItem('currentUser');
            sessionStorage.removeItem('currentUser'); // Clear from both storages
            window.location.href = 'index.html';
        });
    }

    // Update navigation based on authentication status
    updateNavigation();

    // Display appropriate content based on user type and page
    if (currentUser) {
        if (currentUser.userType === 'seller') {
            // Check if we're on the seller dashboard page
            if (window.location.pathname.includes('seller-dashboard')) {
                // Force refresh the properties display
                displaySellerProperties();
                
                // Check if we just added a property and need to clear the flag
                if (sessionStorage.getItem('propertyAdded') === 'true') {
                    sessionStorage.removeItem('propertyAdded');
                    // Force another refresh to make sure the counts are updated
                    setTimeout(displaySellerProperties, 100);
                }
            }
        } else {
            displayAvailableProperties();
        }
    } else {
        // Redirect to login if not authenticated
        if (window.location.pathname.includes('dashboard')) {
            window.location.href = 'login.html';
        }
    }

    // Initialize property form with edit data if available
    initPropertyForm();
});

// Update navigation based on authentication status
function updateNavigation() {
    const nav = document.querySelector('nav ul');
    if (nav) {
        const loginLink = nav.querySelector('a[href="login.html"]');
        const registerLink = nav.querySelector('a[href="register.html"]');
        
        if (currentUser && loginLink && registerLink) {
            // Change login link to dashboard link
            loginLink.textContent = 'Dashboard';
            loginLink.href = currentUser.userType === 'seller' ? 'seller-dashboard.html' : 'customer-dashboard.html';
            
            // Change register link to logout
            registerLink.textContent = 'Logout';
            registerLink.href = '#';
            registerLink.addEventListener('click', function(e) {
                e.preventDefault();
                currentUser = null;
                localStorage.removeItem('currentUser');
                sessionStorage.removeItem('currentUser'); // Clear from both storages
                window.location.href = 'index.html';
            });
        }
    }
} 