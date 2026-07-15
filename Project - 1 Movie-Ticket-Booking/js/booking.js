document.addEventListener('DOMContentLoaded', () => {
    const bookingForm = document.getElementById('booking-form');
    const customerNameInput = document.getElementById('customer-name');
    const emailInput = document.getElementById('email');
    const movieSelect = document.getElementById('movie-select');
    const seatsInput = document.getElementById('seats');
    const bookingDateInput = document.getElementById('booking-date');
    const logoutBtn = document.getElementById('logout-btn');
    
    const validationSummary = document.getElementById('validation-summary');
    const validationErrors = document.getElementById('validation-errors');
    const bookBtn = document.getElementById('book-btn');
    
    // Modal elements
    const successModal = document.getElementById('success-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const successBookingId = document.getElementById('success-booking-id');
    const successName = document.getElementById('success-name');
    const successMovie = document.getElementById('success-movie');
    const successSeats = document.getElementById('success-seats');
    const successDate = document.getElementById('success-date');

    // 1. Session check to protect the page
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
                document.body.classList.remove('hidden-content');
            } else {
                window.location.href = 'login.html';
            }
        })
        .catch(err => {
            console.error('Session check failed:', err);
            window.location.href = 'login.html';
        });

    // 2. Set min date for booking date input (Today's date)
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayString = `${yyyy}-${mm}-${dd}`;
    bookingDateInput.setAttribute('min', todayString);
    bookingDateInput.value = todayString;

    // Auto-select movie from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const movieParam = urlParams.get('movie');
    if (movieParam) {
        const optionExists = Array.from(movieSelect.options).some(option => option.value === movieParam);
        if (optionExists) {
            movieSelect.value = movieParam;
        }
    }

    // 3. Logout handler
    logoutBtn.addEventListener('click', () => {
        fetch('php/login.php?action=logout')
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
                if (data.status === 'success') {
                    window.location.href = 'login.html';
                }
            })
            .catch(err => console.error('Logout failed:', err));
    });

    // 4. Client-side Form Validation and Submission
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Hide errors
        validationSummary.classList.add('hidden');
        validationErrors.textContent = '';
        
        const customerName = customerNameInput.value.trim();
        const email = emailInput.value.trim();
        const movieName = movieSelect.value;
        const seats = parseInt(seatsInput.value, 10);
        const bookingDate = bookingDateInput.value;

        // Input validations
        let errors = [];
        
        if (!customerName) {
            highlightField(customerNameInput, true);
            errors.push('Customer Name is required.');
        } else {
            highlightField(customerNameInput, false);
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            highlightField(emailInput, true);
            errors.push('Email address is required.');
        } else if (!emailRegex.test(email)) {
            highlightField(emailInput, true);
            errors.push('Please enter a valid email address.');
        } else {
            highlightField(emailInput, false);
        }

        if (!movieName) {
            highlightField(movieSelect, true);
            errors.push('Please select a movie.');
        } else {
            highlightField(movieSelect, false);
        }

        if (isNaN(seats) || seats <= 0) {
            highlightField(seatsInput, true);
            errors.push('Number of seats must be a positive number.');
        } else if (seats > 10) {
            highlightField(seatsInput, true);
            errors.push('Maximum booking is 10 seats at a time.');
        } else {
            highlightField(seatsInput, false);
        }

        if (!bookingDate) {
            highlightField(bookingDateInput, true);
            errors.push('Please select a booking date.');
        } else {
            const selectedDate = new Date(bookingDate);
            selectedDate.setHours(0,0,0,0);
            const currentDate = new Date();
            currentDate.setHours(0,0,0,0);
            
            if (selectedDate < currentDate) {
                highlightField(bookingDateInput, true);
                errors.push('Booking date cannot be in the past.');
            } else {
                highlightField(bookingDateInput, false);
            }
        }

        if (errors.length > 0) {
            showErrors(errors.join(' '));
            return;
        }

        // Show loading state
        setLoading(true);

        // Submit form data
        fetch('php/book.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customer_name: customerName,
                email: email,
                movie_name: movieName,
                seats: seats,
                booking_date: bookingDate
            })
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
                // Populate success modal
                successBookingId.textContent = `#${data.booking_id}`;
                successName.textContent = customerName;
                successMovie.textContent = movieName;
                successSeats.textContent = `${seats} ${seats === 1 ? 'Seat' : 'Seats'}`;
                successDate.textContent = formatDate(bookingDate);
                
                // Show modal
                successModal.classList.remove('hidden');
                
                // Reset form
                bookingForm.reset();
                bookingDateInput.value = todayString; // Reset to today
            } else {
                showErrors(data.message || 'Failed to book ticket.');
            }
        })
        .catch(err => {
            setLoading(false);
            showErrors(err.message || 'An error occurred while booking. Please try again.');
            console.error('Booking error:', err);
        });
    });

    // Close success modal
    modalCloseBtn.addEventListener('click', () => {
        successModal.classList.add('hidden');
    });

    // Helper utilities
    function highlightField(input, isError) {
        const wrapper = input.closest('.input-wrapper');
        if (isError) {
            wrapper.classList.add('input-error');
        } else {
            wrapper.classList.remove('input-error');
        }
    }

    function showErrors(msg) {
        validationErrors.textContent = msg;
        validationSummary.classList.remove('hidden');
        validationSummary.classList.add('shake');
        setTimeout(() => {
            validationSummary.classList.remove('shake');
        }, 500);
    }

    function setLoading(isLoading) {
        if (isLoading) {
            bookBtn.disabled = true;
            bookBtn.innerHTML = `<span>Processing...</span> <i class="fa-solid fa-spinner fa-spin btn-icon"></i>`;
        } else {
            bookBtn.disabled = false;
            bookBtn.innerHTML = `<i class="fa-solid fa-ticket btn-icon-left"></i> <span>Book Ticket</span>`;
        }
    }

    function formatDate(dateString) {
        const parts = dateString.split('-');
        if (parts.length === 3) {
            const date = new Date(parts[0], parts[1] - 1, parts[2]);
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        }
        return dateString;
    }
});
