/* ====================================
   LUXURY HOTEL BOOKING SYSTEM - JS
   ==================================== */

const API_BASE_URL = 'http://localhost:4000/api/v1';

// ====== UTILITIES ======

// Show Toast Notification
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), duration);
    }
}

// Format Currency
function formatCurrency(amount, currency = 'USD') {
    const rates = { USD: 1, GHS: 12.5, EUR: 0.92 };
    const symbols = { USD: '$', GHS: '₵', EUR: '€' };
    const converted = amount * rates[currency];
    return `${symbols[currency]}${converted.toFixed(2)}`;
}

// Get Current Currency
function getCurrency() {
    return document.getElementById('currencySelector')?.value || 'USD';
}

// ====== THEME TOGGLE ======

const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        themeToggle.innerHTML = document.body.classList.contains('dark-mode') ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });

    // Load saved theme
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

// ====== CURRENCY SWITCHER ======

const currencySelector = document.getElementById('currencySelector');
if (currencySelector) {
    currencySelector.addEventListener('change', (e) => {
        document.querySelectorAll('[data-price]').forEach(el => {
            const originalPrice = parseFloat(el.dataset.price);
            el.textContent = formatCurrency(originalPrice, e.target.value);
        });
    });
}

// ====== BACK TO TOP ======

const backToTopBtn = document.getElementById('backToTop');
if (backToTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ====== NAVBAR STICKY ======

const navbar = document.querySelector('.navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = 'var(--shadow-md)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    });
}

// ====== FEATURED ROOMS (HOME) ======

const featuredRoomsGrid = document.getElementById('featuredRoomsGrid');
if (featuredRoomsGrid) {
    async function loadFeaturedRooms() {
        try {
            const response = await fetch(`${API_BASE_URL}/rooms?limit=3`);
            if (!response.ok) throw new Error('Failed to fetch rooms');

            const rooms = await response.json();

            featuredRoomsGrid.innerHTML = ''; // clear loading state if any

            rooms.forEach(room => {
                const card = document.createElement('div');
                card.className = 'room-card';
                // Using room details from the API response
                const isAvailable = room.totalUnits > 0;

                card.innerHTML = `
                    <div class="room-card-image">
                        <img src="${room.image || 'https://via.placeholder.com/300x250'}" alt="${room.name}">
                        <span class="room-card-badge">${isAvailable ? 'Available' : 'Unavailable'}</span>
                    </div>
                    <div class="room-card-body">
                        <h3>${room.name}</h3>
                        <div class="room-card-meta">
                            <span><i class="fas fa-bed"></i> ${room.type}</span>
                            <span><i class="fas fa-user-friends"></i> Up to ${room.maxGuests}</span>
                        </div>
                        <div class="room-card-price">
                            ${formatCurrency(room.basePrice, getCurrency())}<small>/night</small>
                        </div>
                        <div class="room-card-actions">
                            <a href="room-details.html?id=${room.id}" class="btn btn-primary" style="flex: 1;">View Details</a>
                            <button class="wishlist-btn" onclick="toggleWishlist(this, '${room.id}')">
                                <i class="far fa-heart"></i>
                            </button>
                        </div>
                    </div>
                `;
                featuredRoomsGrid.appendChild(card);
            });
        } catch (error) {
            console.error('Error loading featured rooms:', error);
            featuredRoomsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--danger);">Unable to load rooms. Please try again later.</p>';
        }
    }

    // Initial load
    featuredRoomsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Loading featured rooms...</p>';
    loadFeaturedRooms();
}

// ====== ROOMS PAGE ======

const roomsGrid = document.getElementById('roomsGrid');
if (roomsGrid) {
    let allRooms = []; // Will be populated from the API

    async function loadAllRooms() {
        try {
            const response = await fetch(`${API_BASE_URL}/rooms`);
            if (!response.ok) throw new Error('Failed to fetch rooms');

            allRooms = await response.json();
            renderRooms();
        } catch (error) {
            console.error('Error loading rooms:', error);
            roomsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--danger);">Unable to load rooms. Please try again later.</p>';
        }
    }

    function renderRooms(filter = {}) {
        roomsGrid.innerHTML = '';
        const filtered = allRooms.filter(room => {
            if (filter.maxPrice && room.basePrice > filter.maxPrice) return false;
            if (filter.types && filter.types.length && !filter.types.includes(room.type)) return false;
            if (filter.amenities && filter.amenities.length && !filter.amenities.some(a => room.amenities.includes(a))) return false;
            // Removed arbitrary rating requirement since it's not in the DB currently
            if (filter.available && room.totalUnits === 0) return false;
            return true;
        });

        if (filtered.length === 0) {
            roomsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No rooms found matching your criteria.</p>';
            return;
        }

        filtered.forEach(room => {
            const card = document.createElement('div');
            card.className = 'room-card';
            const isAvailable = room.totalUnits > 0;

            card.innerHTML = `
                <div class="room-card-image">
                    <img src="${room.image || 'https://via.placeholder.com/300x250'}" alt="${room.name}">
                    <span class="room-card-badge">${isAvailable ? 'Available' : 'Coming Soon'}</span>
                </div>
                <div class="room-card-body">
                    <h3>${room.name}</h3>
                    <div class="room-card-meta">
                        <span><i class="fas fa-bed"></i> ${room.type}</span>
                        <span><i class="fas fa-users"></i> Up to ${room.maxGuests || 2}</span>
                    </div>
                    <div class="room-card-price">
                        ${formatCurrency(room.basePrice, getCurrency())}<small>/night</small>
                    </div>
                    <div class="room-card-actions">
                        <a href="room-details.html?id=${room.id}" class="btn btn-primary" style="flex: 1;">View Details</a>
                        <button class="wishlist-btn" onclick="toggleWishlist(this, '${room.id}')">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>
                </div>
            `;
            roomsGrid.appendChild(card);
        });
    }

    // Price filter
    const priceRange = document.getElementById('priceRange');
    const priceDisplay = document.getElementById('priceDisplay');
    if (priceRange) {
        priceRange.addEventListener('input', (e) => {
            priceDisplay.textContent = `$${e.target.value}`;
            applyFilters();
        });
    }

    // Room type filters
    document.querySelectorAll('.room-type-filter').forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });

    // Amenity filters
    document.querySelectorAll('.amenity-filter').forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });

    // Availability filter
    document.querySelectorAll('.availability-filter').forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });

    function applyFilters() {
        const maxPrice = parseInt(priceRange?.value) || 500;
        const types = Array.from(document.querySelectorAll('.room-type-filter:checked')).map(c => c.value);
        const amenities = Array.from(document.querySelectorAll('.amenity-filter:checked')).map(c => c.value);
        const available = document.querySelector('.availability-filter:checked') ? true : false;

        renderRooms({ maxPrice, types: types.length ? types : null, amenities: amenities.length ? amenities : null, available });
    }

    // Reset filters
    const resetBtn = document.getElementById('resetFilters');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            if (priceRange) priceRange.value = 500;
            if (priceDisplay) priceDisplay.textContent = '$500';
            renderRooms();
        });
    }

    // Initial load
    roomsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Loading rooms...</p>';
    loadAllRooms();
}

// ====== ROOM COMPARISON ======

let selectedRooms = [];

function addToCompare(roomId) {
    if (selectedRooms.includes(roomId)) {
        selectedRooms = selectedRooms.filter(id => id !== roomId);
    } else {
        if (selectedRooms.length < 3) {
            selectedRooms.push(roomId);
        } else {
            showToast('You can only compare up to 3 rooms');
            return;
        }
    }
    updateCompareCount();
}

function updateCompareCount() {
    const count = document.getElementById('compareCount');
    if (count) count.textContent = selectedRooms.length;
}

const compareBtn = document.getElementById('compareBtn');
if (compareBtn) {
    compareBtn.addEventListener('click', () => {
        if (selectedRooms.length === 0) {
            showToast('Please select rooms to compare');
            return;
        }
        const modal = document.getElementById('compareModal');
        if (modal) {
            modal.classList.add('show');
            renderComparison();
        }
    });
}

function renderComparison() {
    const table = document.getElementById('comparisonTable');
    if (!table) return;

    const rooms = [
        { id: 1, name: 'Luxury Suite', price: 299, beds: 2, size: '50m²', amenities: 5 },
        { id: 2, name: 'Deluxe Double', price: 199, beds: 1, size: '35m²', amenities: 3 },
        { id: 3, name: 'Penthouse', price: 499, beds: 3, size: '100m²', amenities: 8 }
    ];

    const compared = rooms.filter(r => selectedRooms.includes(r.id));
    let html = '<table><tr><th>Feature</th>';
    compared.forEach(r => html += `<th>${r.name}</th>`);
    html += '</tr>';
    html += `<tr><td>Price/Night</td>${compared.map(r => `<td>${formatCurrency(r.price, getCurrency())}</td>`).join('')}</tr>`;
    html += `<tr><td>Beds</td>${compared.map(r => `<td>${r.beds}</td>`).join('')}</tr>`;
    html += `<tr><td>Size</td>${compared.map(r => `<td>${r.size}</td>`).join('')}</tr>`;
    html += `<tr><td>Amenities</td>${compared.map(r => `<td>${r.amenities}</td>`).join('')}</tr>`;
    html += '</table>';

    table.innerHTML = html;
}

// ====== WISHLIST ======

function toggleWishlist(btn, roomId) {
    btn.classList.toggle('active');
    const isAdded = btn.classList.contains('active');
    showToast(isAdded ? 'Added to wishlist!' : 'Removed from wishlist');
    btn.innerHTML = isAdded ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
}

// ====== BOOKING PAGE ======

const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form data
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone')?.value || null;

        const checkIn = document.getElementById('checkInDate')?.value || new Date().toISOString().split('T')[0];
        const checkOutDateObj = new Date();
        checkOutDateObj.setDate(checkOutDateObj.getDate() + 1);
        const checkOut = document.getElementById('checkOutDate')?.value || checkOutDateObj.toISOString().split('T')[0];

        // Retrieve room details from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const roomId = urlParams.get('id');

        if (!roomId) {
            showToast('Please select a room first');
            return;
        }

        try {
            // First get room details to know price and type
            const roomRes = await fetch(`${API_BASE_URL}/rooms/${roomId}`);
            if (!roomRes.ok) throw new Error('Failed to get room details');
            const roomData = await roomRes.json();

            // Prepare booking request matching backend DTO
            const bookingPayload = {
                checkInDate: new Date(checkIn).toISOString(),
                checkOutDate: new Date(checkOut).toISOString(),
                guestFirstName: firstName,
                guestLastName: lastName,
                guestEmail: email,
                guestPhone: phone,
                items: [
                    {
                        roomTypeId: roomData.id,
                        quantity: 1,
                        pricePerNight: Number(roomData.basePrice)
                    }
                ]
            };

            const response = await fetch(`${API_BASE_URL}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingPayload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Booking failed');
            }

            const result = await response.json();

            // Show confirmation modal
            const modal = document.getElementById('confirmationModal');
            if (modal) {
                document.getElementById('confirmationNumber').textContent = result.bookingNumber;
                document.getElementById('confirmationEmail').textContent = email;
                modal.classList.add('show');
            }

            // Create a pending payment
            const paymentPayload = {
                bookingId: result.id,
                amount: Number(result.totalAmount),
                method: document.querySelector('.payment-option.selected input')?.value || 'CARD'
            };

            await fetch(`${API_BASE_URL}/payments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentPayload)
            });

            showToast('Booking confirmed! Check your email.');
        } catch (err) {
            console.error(err);
            showToast(err.message || 'An error occurred during booking');
        }
    });

    // Payment method selection
    document.querySelectorAll('.payment-option input').forEach(input => {
        input.addEventListener('change', (e) => {
            document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
            e.target.closest('.payment-option').classList.add('selected');
        });
    });
}

// ====== PROMO CODE ======

function applyPromoCode() {
    const code = document.getElementById('promoCode').value.toUpperCase();
    const message = document.getElementById('promoMessage');
    const promoCodes = {
        'SAVE10': 0.10,
        'SAVE20': 0.20,
        'LUXURY50': 0.50
    };

    if (promoCodes[code]) {
        const discount = promoCodes[code];
        showToast(`Promo code applied! ${(discount * 100).toFixed(0)}% discount`);
        if (message) {
            message.textContent = `✓ Discount applied: ${(discount * 100).toFixed(0)}%`;
            message.style.color = 'green';
        }
    } else {
        showToast('Invalid promo code');
        if (message) {
            message.textContent = 'Invalid promo code';
            message.style.color = 'red';
        }
    }
}

// ====== CHECK-IN PAGE ======

function nextStep(step) {
    if (step === 1) {
        const name = document.getElementById('fullName').value;
        if (!name) {
            showToast('Please fill in all required fields');
            return;
        }
    }

    document.getElementById(`step${step}`).classList.add('hidden');
    document.getElementById(`step${step + 1}`).classList.remove('hidden');

    // Update progress
    document.querySelectorAll('.step').forEach((el, i) => {
        el.classList.toggle('active', i + 1 <= step + 1);
    });

    // Update summary on step 3
    if (step === 2) {
        document.getElementById('confirmName').textContent = document.getElementById('fullName').value;
        document.getElementById('confirmIdType').textContent = document.getElementById('idType').value;
        document.getElementById('confirmIdNumber').textContent = document.getElementById('idNumber').value;
        document.getElementById('confirmDate').textContent = document.getElementById('arrivalDate').value;
        document.getElementById('confirmTime').textContent = document.getElementById('arrivalTime').value;
        document.getElementById('confirmGuests').textContent = document.getElementById('guestCount').value;
    }
}

function prevStep(step) {
    document.getElementById(`step${step}`).classList.add('hidden');
    document.getElementById(`step${step - 1}`).classList.remove('hidden');

    // Update progress
    document.querySelectorAll('.step').forEach((el, i) => {
        el.classList.toggle('active', i + 1 <= step - 1);
    });
}

const checkinForm = document.getElementById('checkinForm');
if (checkinForm) {
    checkinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Check-in completed successfully!');
        setTimeout(() => window.location.href = 'dashboard.html', 1500);
    });

    // File upload preview
    const fileInput = document.getElementById('idFile');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const preview = document.getElementById('filePreview');
            if (preview && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    preview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        });
    }
}

// ====== REVIEWS PAGE ======

document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
        const answer = btn.nextElementSibling;
        const isOpen = answer.style.display !== 'none';

        document.querySelectorAll('.faq-answer').forEach(a => a.style.display = 'none');
        document.querySelectorAll('.faq-question').forEach(b => b.classList.remove('active'));

        if (!isOpen) {
            answer.style.display = 'block';
            btn.classList.add('active');
        }
    });
});

document.querySelectorAll('.helpful-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const count = parseInt(btn.querySelector('span').textContent) + 1;
        btn.querySelector('span').textContent = count;
        showToast('Thank you for your feedback!');
    });
});

// ====== FORMS VALIDATION ======

document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => {
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.style.borderColor = 'var(--danger)';
                isValid = false;
            } else {
                input.style.borderColor = 'var(--border-light)';
            }
        });

        if (!isValid) {
            e.preventDefault();
            showToast('Please fill in all required fields');
        }
    });
});

// ====== MODAL CLOSE ======

document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.target.closest('.modal').classList.remove('show');
    });
});

document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
});

// ====== NEWSLETTER ======

document.querySelectorAll('#newsletterForm').forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Thank you for subscribing!');
        form.reset();
    });
});

// ====== CONTACT FORM ======

const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Thank you for your message. We will be in touch soon!');
        contactForm.reset();
    });
}

// ====== RATING INPUT ======

document.querySelectorAll('.rating-input .star').forEach(star => {
    star.addEventListener('click', () => {
        const value = star.dataset.value;
        document.querySelectorAll('.rating-input .star').forEach((s, i) => {
            s.classList.toggle('active', i < value);
        });
        document.getElementById('ratingValue').textContent = `${value} out of 5 stars`;
    });
});

// ====== REVIEW FORM ======

const reviewForm = document.getElementById('reviewForm');
if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Thank you for your review!');
        document.getElementById('reviewModal').classList.remove('show');
        reviewForm.reset();
    });
}

// Open review modal
document.querySelectorAll('.btn').forEach(btn => {
    if (btn.textContent.includes('Write a Review') || btn.textContent.includes('Write Your Review')) {
        btn.addEventListener('click', () => {
            const modal = document.getElementById('reviewModal');
            if (modal) modal.classList.add('show');
        });
    }
});

// ====== DASHBOARD SIDEBAR NAVIGATION ======

document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', (e) => {
        document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

// ====== LOGOUT ======

function logout() {
    showToast('Logging out...');
    setTimeout(() => window.location.href = 'index.html', 1500);
}

// ====== ROOM DETAILS PAGE ======

if (document.getElementById('detailsRoomName')) {
    // Calculate pricing based on dates
    document.getElementById('inlineCheckIn')?.addEventListener('change', calculatePrice);
    document.getElementById('inlineCheckOut')?.addEventListener('change', calculatePrice);

    function calculatePrice() {
        const checkIn = new Date(document.getElementById('inlineCheckIn').value);
        const checkOut = new Date(document.getElementById('inlineCheckOut').value);

        if (checkIn && checkOut && checkOut > checkIn) {
            const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
            const price = parseFloat(document.getElementById('roomPrice').textContent.replace('$', ''));
            const total = price * nights;

            document.getElementById('nightsCount').textContent = nights;
            document.getElementById('totalPrice').textContent = formatCurrency(total, getCurrency());
        }
    }
}

// ====== CAROUSEL ======

document.querySelectorAll('.carousel-thumb').forEach((thumb, index) => {
    thumb.addEventListener('click', () => {
        const main = document.getElementById('mainImage');
        if (main) {
            main.src = thumb.src;
            document.querySelectorAll('.carousel-thumb').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        }
    });
});

// ====== ADMIN SIDEBAR NAVIGATION ======

document.querySelectorAll('.admin-nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        document.querySelectorAll('.admin-nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

// ====== ROOM STATUS FILTER ======

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// ====== INITIALIZE ======

document.addEventListener('DOMContentLoaded', () => {
    // Set default dates (today and tomorrow)
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    document.querySelectorAll('input[type="date"]').forEach((input, index) => {
        if (input.id.includes('CheckIn') || input.id === 'arrivalDate') {
            input.value = today;
            input.min = today;
        } else if (input.id.includes('CheckOut')) {
            input.value = tomorrow;
            input.min = tomorrow;
        }
    });

    // Log initialization
    console.log('Hotel Booking System Initialized');
});
