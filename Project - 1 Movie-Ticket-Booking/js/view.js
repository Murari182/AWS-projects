document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('bookings-table-body');
    const searchInput = document.getElementById('search-input');
    const bookingsCount = document.getElementById('bookings-count');
    const fetchError = document.getElementById('fetch-error');
    const errorText = document.getElementById('error-text');
    const logoutBtn = document.getElementById('logout-btn');
    
    let allBookings = [];

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
                // Fetch bookings only after session validation passes
                fetchBookings();
            } else {
                window.location.href = 'login.html';
            }
        })
        .catch(err => {
            console.error('Session check failed:', err);
            window.location.href = 'login.html';
        });

    // 2. Logout handler
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

    // 3. Fetch Bookings from PHP
    function fetchBookings() {
        fetch('php/fetch.php')
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
                if (data.status === 'success') {
                    allBookings = data.data;
                    renderTable(allBookings);
                } else {
                    showError(data.message || 'Failed to fetch bookings.');
                }
            })
            .catch(err => {
                showError(err.message || 'An error occurred while loading bookings. Please refresh the page.');
                console.error('Fetch bookings error:', err);
            });
    }

    // 4. Render Table rows
    function renderTable(bookings) {
        tableBody.innerHTML = '';
        bookingsCount.textContent = bookings.length;
        
        if (bookings.length === 0) {
            tableBody.innerHTML = `
                <tr class="table-state-row">
                    <td colspan="6" class="text-center no-data">
                        <i class="fa-solid fa-ticket-simple empty-icon"></i>
                        No booking records found.
                    </td>
                </tr>
            `;
            return;
        }

        bookings.forEach(booking => {
            const tr = document.createElement('tr');
            
            // Format ID with leading zeros (e.g. #0005)
            const paddedId = String(booking.id).padStart(4, '0');
            
            tr.innerHTML = `
                <td><span class="booking-id-tag">#${paddedId}</span></td>
                <td><span class="customer-name-tag">${escapeHTML(booking.customer_name)}</span></td>
                <td><a href="mailto:${escapeHTML(booking.email)}" class="email-link">${escapeHTML(booking.email)}</a></td>
                <td><span class="movie-name-tag"><i class="fa-solid fa-film text-muted"></i> ${escapeHTML(booking.movie_name)}</span></td>
                <td><span class="seats-badge">${booking.seats}</span></td>
                <td><span class="date-text">${formatDate(booking.booking_date)}</span></td>
            `;
            
            tableBody.appendChild(tr);
        });
    }

    // 5. Live Search / Filter
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        const filtered = allBookings.filter(booking => {
            return (
                String(booking.id).includes(query) ||
                booking.customer_name.toLowerCase().includes(query) ||
                booking.email.toLowerCase().includes(query) ||
                booking.movie_name.toLowerCase().includes(query)
            );
        });
        
        renderTable(filtered);
    });

    // Helper functions
    function showError(message) {
        tableBody.innerHTML = `
            <tr class="table-state-row">
                <td colspan="6" class="text-center table-error-state">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    ${escapeHTML(message)}
                </td>
            </tr>
        `;
        errorText.textContent = message;
        fetchError.classList.remove('hidden');
    }

    function escapeHTML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function formatDate(dateString) {
        const parts = dateString.split('-');
        if (parts.length === 3) {
            const date = new Date(parts[0], parts[1] - 1, parts[2]);
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        }
        return dateString;
    }
});
