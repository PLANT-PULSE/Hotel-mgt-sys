/* ====================================
   LUXURY HOTEL BOOKING SYSTEM - JS
   ==================================== */

// Hotel Images from Unsplash (reliable source)
const HOTEL_IMAGES = {
    luxurySuite: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
    deluxeRoom: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
    penthouse: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
    standardRoom: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80',
    familySuite: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
    oceanView: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80',
    hotelExterior: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    pool: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
    restaurant: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    spa: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
    gym: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    lobby: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
    roomDetail: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80',
    avatar1: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    avatar2: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    avatar3: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
    avatar4: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80'
};

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

// ====== OFFLINE MODE ======

// Check online status and update UI
function updateOnlineStatus() {
    const offlineIndicator = document.getElementById('offlineIndicator');
    if (navigator.onLine) {
        if (offlineIndicator) {
            offlineIndicator.style.display = 'none';
        }
        document.body.classList.remove('offline-mode');
    } else {
        if (offlineIndicator) {
            offlineIndicator.style.display = 'flex';
        }
        document.body.classList.add('offline-mode');
        showToast('You are offline. Some features may be limited.');
    }
}

// Initialize offline detection
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Toggle offline mode manually
function toggleOfflineMode() {
    const offlineIndicator = document.getElementById('offlineIndicator');
    if (offlineIndicator) {
        const isHidden = offlineIndicator.style.display === 'none';
        offlineIndicator.style.display = isHidden ? 'flex' : 'none';
        document.body.classList.toggle('offline-mode', isHidden);
        showToast(isHidden ? 'Offline mode enabled' : 'Offline mode disabled');
    }
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
    const rooms = [
        {
            id: 1,
            name: 'Luxury Suite',
            type: 'Suite',
            price: 299,
            image: HOTEL_IMAGES.luxurySuite,
            rating: 5,
            available: true,
            beds: 2,
            guests: 4,
            size: '65m²'
        },
        {
            id: 2,
            name: 'Deluxe King Room',
            type: 'Double',
            price: 199,
            image: HOTEL_IMAGES.deluxeRoom,
            rating: 4.8,
            available: true,
            beds: 1,
            guests: 2,
            size: '45m²'
        },
        {
            id: 3,
            name: 'Presidential Penthouse',
            type: 'Penthouse',
            price: 499,
            image: HOTEL_IMAGES.penthouse,
            rating: 5,
            available: false,
            beds: 3,
            guests: 6,
            size: '120m²'
        }
    ];

    rooms.forEach(room => {
        const card = document.createElement('div');
        card.className = 'room-card';
        card.innerHTML = `
            <div class="room-card-image">
                <img src="${room.image}" alt="${room.name}" onerror="this.src='https://via.placeholder.com/400x300/1a3a52/ffffff?text=${room.name}'">
                <span class="room-card-badge ${room.available ? '' : 'unavailable'}">${room.available ? 'Available' : 'Sold Out'}</span>
                <button class="wishlist-btn" onclick="toggleWishlist(this, ${room.id})">
                    <i class="far fa-heart"></i>
                </button>
            </div>
            <div class="room-card-body">
                <h3>${room.name}</h3>
                <div class="room-card-meta">
                    <span><i class="fas fa-bed"></i> ${room.beds} Bed</span>
                    <span><i class="fas fa-user"></i> ${room.guests} Guests</span>
                    <span><i class="fas fa-ruler-combined"></i> ${room.size}</span>
                </div>
                <div class="room-card-rating">
                    ${generateStars(room.rating)}
                </div>
                <div class="room-card-price">
                    ${formatCurrency(room.price, getCurrency())}<small>/night</small>
                </div>
                <div class="room-card-actions">
                    <a href="room-details.html?id=${room.id}" class="btn btn-primary" style="flex: 1;">View Details</a>
                </div>
            </div>
        `;
        featuredRoomsGrid.appendChild(card);
    });
}

// Generate star rating HTML
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalf) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    return `<span class="stars">${stars} <span class="rating-value">${rating}</span></span>`;
}

// ====== ROOMS PAGE ======

const roomsGrid = document.getElementById('roomsGrid');
if (roomsGrid) {
    const allRooms = [
        { id: 1, name: 'Luxury Suite', type: 'suite', price: 299, rating: 5, amenities: ['wifi', 'pool', 'spa', 'minibar'], status: 'available', beds: 2, guests: 4, size: '65m²', image: HOTEL_IMAGES.luxurySuite },
        { id: 2, name: 'Deluxe King Room', type: 'double', price: 199, rating: 4.8, amenities: ['wifi', 'ac'], status: 'available', beds: 1, guests: 2, size: '45m²', image: HOTEL_IMAGES.deluxeRoom },
        { id: 3, name: 'Presidential Penthouse', type: 'penthouse', price: 499, rating: 5, amenities: ['wifi', 'pool', 'spa', 'minibar', 'butler'], status: 'soon', beds: 3, guests: 6, size: '120m²', image: HOTEL_IMAGES.penthouse },
        { id: 4, name: 'Standard Room', type: 'single', price: 129, rating: 4.2, amenities: ['wifi', 'ac'], status: 'available', beds: 1, guests: 1, size: '30m²', image: HOTEL_IMAGES.standardRoom },
        { id: 5, name: 'Family Suite', type: 'suite', price: 349, rating: 4.9, amenities: ['wifi', 'pool', 'minibar', 'kitchen'], status: 'available', beds: 2, guests: 5, size: '85m²', image: HOTEL_IMAGES.familySuite },
        { id: 6, name: 'Ocean View Deluxe', type: 'double', price: 249, rating: 4.7, amenities: ['wifi', 'spa', 'ac', 'balcony'], status: 'available', beds: 1, guests: 2, size: '50m²', image: HOTEL_IMAGES.oceanView }
    ];

    function renderRooms(filter = {}) {
        roomsGrid.innerHTML = '';
        const filtered = allRooms.filter(room => {
            if (filter.maxPrice && room.price > filter.maxPrice) return false;
            if (filter.types && filter.types.length && !filter.types.includes(room.type)) return false;
            if (filter.amenities && filter.amenities.length && !filter.amenities.some(a => room.amenities.includes(a))) return false;
            if (filter.rating && room.rating < filter.rating) return false;
            if (filter.available && room.status !== 'available') return false;
            return true;
        });

        filtered.forEach(room => {
            const card = document.createElement('div');
            card.className = 'room-card';
            card.innerHTML = `
                <div class="room-card-image">
                    <img src="${room.image}" alt="${room.name}" onerror="this.src='https://via.placeholder.com/400x300/1a3a52/ffffff?text=${room.name}'">
                    <span class="room-card-badge ${room.status === 'available' ? '' : 'unavailable'}">${room.status === 'available' ? 'Available' : 'Coming Soon'}</span>
                    <button class="wishlist-btn" onclick="toggleWishlist(this, ${room.id})">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
                <div class="room-card-body">
                    <h3>${room.name}</h3>
                    <div class="room-card-meta">
                        <span><i class="fas fa-star"></i> ${room.rating}</span>
                        <span><i class="fas fa-door-open"></i> ${room.type}</span>
                        <span><i class="fas fa-ruler-combined"></i> ${room.size}</span>
                    </div>
                    <div class="room-card-price">
                        ${formatCurrency(room.price, getCurrency())}<small>/night</small>
                    </div>
                    <div class="room-card-actions">
                        <a href="room-details.html?id=${room.id}" class="btn btn-primary" style="flex: 1;">View Details</a>
                        <button class="compare-btn" onclick="addToCompare(${room.id})" title="Compare">
                            <i class="fas fa-balance-scale"></i>
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
            priceDisplay.textContent = formatCurrency(parseInt(e.target.value), getCurrency());
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
            priceRange.value = 500;
            priceDisplay.textContent = formatCurrency(500, getCurrency());
            renderRooms();
        });
    }

    renderRooms();
}

// ====== ROOM COMPARISON ======

let selectedRooms = [];

function addToCompare(roomId) {
    if (selectedRooms.includes(roomId)) {
        selectedRooms = selectedRooms.filter(id => id !== roomId);
        showToast('Room removed from comparison');
    } else {
        if (selectedRooms.length < 3) {
            selectedRooms.push(roomId);
            showToast('Room added to comparison');
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
        { id: 1, name: 'Luxury Suite', price: 299, beds: 2, size: '65m²', amenities: 5, rating: 5 },
        { id: 2, name: 'Deluxe King', price: 199, beds: 1, size: '45m²', amenities: 3, rating: 4.8 },
        { id: 3, name: 'Penthouse', price: 499, beds: 3, size: '120m²', amenities: 8, rating: 5 }
    ];

    const compared = rooms.filter(r => selectedRooms.includes(r.id));
    let html = '<table class="comparison-table"><thead><tr><th>Feature</th>';
    compared.forEach(r => html += `<th>${r.name}</th>`);
    html += '</tr></thead><tbody>';
    html += `<tr><td>Price/Night</td>${compared.map(r => `<td>${formatCurrency(r.price, getCurrency())}</td>`).join('')}</tr>`;
    html += `<tr><td>Beds</td>${compared.map(r => `<td>${r.beds}</td>`).join('')}</tr>`;
    html += `<tr><td>Size</td>${compared.map(r => `<td>${r.size}</td>`).join('')}</tr>`;
    html += `<tr><td>Rating</td>${compared.map(r => `<td>${r.rating} <i class="fas fa-star" style="color: var(--accent-gold)"></i></td>`).join('')}</tr>`;
    html += '</tbody></table>';

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
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;

        const modal = document.getElementById('confirmationModal');
        if (modal) {
            const confirmNumber = `LXS-${new Date().getFullYear()}-${Math.floor(Math.random() * 100000)}`;
            document.getElementById('confirmationNumber').textContent = confirmNumber;
            document.getElementById('confirmationEmail').textContent = email;
            modal.classList.add('show');
        }

        showToast('Booking confirmed! Check your email.');
        
        // Simulate earning loyalty points
        earnPoints(299);
    });

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
        'LUXURY50': 0.50,
        'WELCOME': 0.15
    };

    if (promoCodes[code]) {
        const discount = promoCodes[code];
        showToast(`Promo code applied! ${(discount * 100).toFixed(0)}% discount`);
        if (message) {
            message.textContent = `✓ Discount applied: ${(discount * 100).toFixed(0)}%`;
            message.style.color = 'var(--success)';
        }
    } else {
        showToast('Invalid promo code');
        if (message) {
            message.textContent = 'Invalid promo code';
            message.style.color = 'var(--danger)';
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
    
    document.querySelectorAll('.step').forEach((el, i) => {
        el.classList.toggle('active', i + 1 <= step + 1);
    });

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

const newsletterForms = document.querySelectorAll('#newsletterForm');
newsletterForms.forEach(form => {
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
        const ratingValue = document.getElementById('ratingValue');
        if (ratingValue) {
            ratingValue.textContent = `${value} out of 5 stars`;
        }
    });
});

// ====== REVIEW FORM ======

const reviewForm = document.getElementById('reviewForm');
if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Thank you for your review!');
        const reviewModal = document.getElementById('reviewModal');
        if (reviewModal) reviewModal.classList.remove('show');
        reviewForm.reset();
    });
}

document.querySelectorAll('.btn').forEach(btn => {
    if (btn.textContent.includes('Write a Review') || btn.textContent.includes('Write Your Review')) {
        btn.addEventListener('click', () => {
            const modal = document.getElementById('reviewModal');
            if (modal) modal.classList.add('show');
        });
    }
});

// ====== DASHBOARD ======

document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', (e) => {
        document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

function logout() {
    showToast('Logging out...');
    setTimeout(() => window.location.href = 'index.html', 1500);
}

// ====== ROOM DETAILS ======

if (document.getElementById('detailsRoomName')) {
    const inlineCheckIn = document.getElementById('inlineCheckIn');
    const inlineCheckOut = document.getElementById('inlineCheckOut');
    
    if (inlineCheckIn) inlineCheckIn.addEventListener('change', calculatePrice);
    if (inlineCheckOut) inlineCheckOut.addEventListener('change', calculatePrice);

    function calculatePrice() {
        const checkIn = document.getElementById('inlineCheckIn');
        const checkOut = document.getElementById('inlineCheckOut');
        
        if (checkIn && checkOut && checkIn.value && checkOut.value) {
            const checkInDate = new Date(checkIn.value);
            const checkOutDate = new Date(checkOut.value);
            
            if (checkOutDate > checkInDate) {
                const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
                const priceEl = document.getElementById('roomPrice');
                if (priceEl) {
                    const price = parseFloat(priceEl.textContent.replace('$', '').replace(',', ''));
                    const total = price * nights;
                    
                    const nightsCount = document.getElementById('nightsCount');
                    const totalPrice = document.getElementById('totalPrice');
                    
                    if (nightsCount) nightsCount.textContent = nights;
                    if (totalPrice) totalPrice.textContent = formatCurrency(total, getCurrency());
                }
            }
        }
    }
}

// ====== CAROUSEL ======

document.querySelectorAll('.carousel-thumb').forEach((thumb) => {
    thumb.addEventListener('click', () => {
        const main = document.getElementById('mainImage');
        if (main) {
            main.src = thumb.src;
            document.querySelectorAll('.carousel-thumb').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        }
    });
});

// ====== ADMIN ======

document.querySelectorAll('.admin-nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        document.querySelectorAll('.admin-nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// ====== CHATBOT ======

const chatbotToggle = document.querySelector('.chatbot-toggle');
const chatbotWidget = document.getElementById('chatbotWidget');
const chatbotClose = document.querySelector('.chatbot-close');
const chatbotInput = document.getElementById('chatbotInput');

if (chatbotToggle) {
    chatbotToggle.addEventListener('click', () => {
        if (chatbotWidget) {
            chatbotWidget.classList.toggle('show');
            chatbotToggle.style.display = 'none';
        }
    });
}

if (chatbotClose) {
    chatbotClose.addEventListener('click', () => {
        if (chatbotWidget) {
            chatbotWidget.classList.remove('show');
            if (chatbotToggle) chatbotToggle.style.display = 'flex';
        }
    });
}

if (chatbotInput) {
    chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && chatbotInput.value.trim()) {
            const messages = document.getElementById('chatbotMessages');
            if (messages) {
                const userMsg = document.createElement('div');
                userMsg.className = 'message user-message';
                userMsg.textContent = chatbotInput.value;
                messages.appendChild(userMsg);

                setTimeout(() => {
                    const botMsg = document.createElement('div');
                    botMsg.className = 'message bot-message';
                    const responses = [
                        'Thank you for your message. Our team will respond shortly.',
                        'I\'d be happy to help you with that!',
                        'Please hold while I check that for you.',
                        'Great question! Let me provide you with more information.'
                    ];
                    botMsg.textContent = responses[Math.floor(Math.random() * responses.length)];
                    messages.appendChild(botMsg);
                    messages.scrollTop = messages.scrollHeight;
                }, 1000);

                chatbotInput.value = '';
                messages.scrollTop = messages.scrollHeight;
            }
        }
    });
}

// ====== MULTI-LANGUAGE ======

const langSelector = document.getElementById('langSelector');
if (langSelector) {
    langSelector.addEventListener('change', (e) => {
        const lang = e.target.value;
        showToast(`Language changed to ${lang === 'en' ? 'English' : 'Français'}`);
    });
}

// ====== SKELETON LOADERS ======

function showSkeletonLoader(container, count = 3) {
    const grid = document.getElementById(container);
    if (!grid) return;

    grid.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'room-card';
        skeleton.innerHTML = `
            <div class="skeleton skeleton-card"></div>
            <div style="padding: 20px;">
                <div class="skeleton" style="height: 20px; width: 60%; margin-bottom: 10px;"></div>
                <div class="skeleton" style="height: 15px; width: 40%; margin-bottom: 15px;"></div>
                <div class="skeleton" style="height: 25px; width: 30%;"></div>
            </div>
        `;
        grid.appendChild(skeleton);
    }
}

// ====== RECOMMENDATIONS ======

function loadRecommendations(currentRoomId) {
    const recommendationsContainer = document.getElementById('recommendationsGrid');
    if (!recommendationsContainer) return;

    const recommendations = [
        { id: 1, name: 'Deluxe Suite', type: 'suite', price: 299, rating: 4.8, image: HOTEL_IMAGES.luxurySuite },
        { id: 2, name: 'Ocean View Room', type: 'double', price: 249, rating: 4.7, image: HOTEL_IMAGES.oceanView },
        { id: 3, name: 'Family Room', type: 'suite', price: 349, rating: 4.9, image: HOTEL_IMAGES.familySuite }
    ].filter(r => r.id !== currentRoomId);

    recommendationsContainer.innerHTML = '';
    recommendations.forEach(room => {
        const card = document.createElement('div');
        card.className = 'room-card';
        card.innerHTML = `
            <div class="room-card-image">
                <img src="${room.image}" alt="${room.name}" onerror="this.src='https://via.placeholder.com/400x300/1a3a52/ffffff?text=${room.name}'">
            </div>
            <div class="room-card-body">
                <h3>${room.name}</h3>
                <div class="room-card-meta">
                    <span><i class="fas fa-star"></i> ${room.rating}</span>
                </div>
                <div class="room-card-price">
                    ${formatCurrency(room.price, getCurrency())}<small>/night</small>
                </div>
                <a href="room-details.html?id=${room.id}" class="btn btn-primary">View Details</a>
            </div>
        `;
        recommendationsContainer.appendChild(card);
    });
}

// ====== LOYALTY POINTS ======

function updateLoyaltyPoints(points) {
    const pointsDisplay = document.getElementById('loyaltyPoints');
    if (pointsDisplay) {
        pointsDisplay.textContent = points.toLocaleString();
    }
}

function earnPoints(amount) {
    const points = Math.floor(amount * 10);
    const currentPoints = parseInt(localStorage.getItem('loyaltyPoints')) || 0;
    const newTotal = currentPoints + points;
    localStorage.setItem('loyaltyPoints', newTotal);
    updateLoyaltyPoints(newTotal);
    showToast(`You earned ${points} loyalty points!`);
}

// ====== INITIALIZE ======

document.addEventListener('DOMContentLoaded', () => {
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    document.querySelectorAll('input[type="date"]').forEach((input) => {
        if (input.id.includes('CheckIn') || input.id === 'arrivalDate') {
            input.value = today;
            input.min = today;
        } else if (input.id.includes('CheckOut')) {
            input.value = tomorrow;
            input.min = tomorrow;
        }
    });

    // Initialize loyalty points
    const savedPoints = parseInt(localStorage.getItem('loyaltyPoints')) || 0;
    updateLoyaltyPoints(savedPoints);

    // Initialize online status
    updateOnlineStatus();

    // Load recommendations
    const roomDetails = document.getElementById('detailsRoomName');
    if (roomDetails) {
        const urlParams = new URLSearchParams(window.location.search);
        const roomId = parseInt(urlParams.get('id')) || 1;
        loadRecommendations(roomId);
    }

    console.log('Hotel Booking System Initialized');
});
