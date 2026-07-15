document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    const submitBtn = document.getElementById('submit-btn');

    // Check if user is already logged in
    fetch('php/login.php?action=check')
        .then(res => {
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return res.json();
            }
            return res.text().then(text => {
                throw new Error('Non-JSON response received: ' + text);
            });
        })
        .then(data => {
            if (data.authenticated) {
                window.location.href = 'booking.html';
            }
        })
        .catch(err => console.error('Session check failed:', err));

    // Toggle Password Visibility
    togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        const icon = togglePasswordBtn.querySelector('i');
        if (type === 'text') {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });

    // Form Submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Hide error container
        errorContainer.classList.add('hidden');
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        
        // Client-side Validation
        let hasError = false;
        
        if (!username) {
            highlightField(usernameInput, true);
            hasError = true;
        } else {
            highlightField(usernameInput, false);
        }
        
        if (!password) {
            highlightField(passwordInput, true);
            hasError = true;
        } else {
            highlightField(passwordInput, false);
        }
        
        if (hasError) {
            showError('Please fill in all fields.');
            return;
        }

        // Show loading state
        setLoading(true);

        // Send login details to backend
        fetch('php/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(res => {
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return res.json().then(data => {
                    if (!res.ok) {
                        throw new Error(data.message || 'Server error occurred.');
                    }
                    return data;
                });
            } else {
                return res.text().then(text => {
                    console.error('Expected JSON, but received:', text);
                    throw new Error('Server returned an unexpected response format (non-JSON).');
                });
            }
        })
        .then(data => {
            setLoading(false);
            if (data.status === 'success') {
                window.location.href = 'booking.html';
            } else {
                showError(data.message || 'Invalid username or password.');
                highlightField(usernameInput, true);
                highlightField(passwordInput, true);
            }
        })
        .catch(err => {
            setLoading(false);
            showError(err.message || 'An error occurred. Please try again later.');
            console.error('Login error:', err);
        });
    });

    // Helper functions
    function highlightField(input, isError) {
        const wrapper = input.closest('.input-wrapper');
        if (isError) {
            wrapper.classList.add('input-error');
        } else {
            wrapper.classList.remove('input-error');
        }
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorContainer.classList.remove('hidden');
        errorContainer.classList.add('shake');
        
        // Remove shake class after animation finishes
        setTimeout(() => {
            errorContainer.classList.remove('shake');
        }, 500);
    }

    function setLoading(isLoading) {
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span>Logging in...</span> <i class="fa-solid fa-spinner fa-spin btn-icon"></i>`;
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span>Log In</span> <i class="fa-solid fa-arrow-right btn-icon"></i>`;
        }
    }
});
