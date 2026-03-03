/* ====================================
   LUXURY HOTEL BOOKING SYSTEM - ADVANCED JS
   ==================================== */

// Hotel Images from Unsplash
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

// Room Data with real-time availability
const roomsData = [
    { id: 1, name: 'Luxury Suite', type: 'suite', price: 299, rating: 5, amenities: ['wifi', 'pool', 'spa', 'minibar'], status: 'available', beds: 2, guests: 4, size: '65m²', image: HOTEL_IMAGES.luxurySuite, roomsLeft: 3 },
    { id: 2, name: 'Deluxe King Room', type: 'double', price: 199, rating: 4.8, amenities: ['wifi', 'ac'], status: 'available', beds: 1, guests: 2, size: '45m²', image: HOTEL_IMAGES.deluxeRoom, roomsLeft: 5 },
    { id: 3, name: 'Presidential Penthouse', type: 'penthouse', price: 499, rating: 5, amenities: ['wifi', 'pool', 'spa', 'minibar', 'butler'], status: 'available', beds: 3, guests: 6, size: '120m²', image: HOTEL_IMAGES.penthouse, roomsLeft: 1 },
    { id: 4, name: 'Standard Room', type: 'single', price: 129, rating: 4.2, amenities: ['wifi', 'ac'], status: 'available', beds: 1, guests: 1, size: '30m²', image: HOTEL_IMAGES.standardRoom, roomsLeft: 8 },
    { id: 5, name: 'Family Suite', type: 'suite', price: 349, rating: 4.9, amenities: ['wifi', 'pool', 'minibar', 'kitchen'], status: 'available', beds: 2, guests: 5, size: '85m²', image: HOTEL_IMAGES.familySuite, roomsLeft: 2 },
    { id: 6, name: 'Ocean View Deluxe', type: 'double', price: 249, rating: 4.7, amenities: ['wifi', 'spa', 'ac', 'balcony'], status: 'available', beds: 1, guests: 2, size: '50m²', image: HOTEL_IMAGES.oceanView, roomsLeft: 4 }
];

// Room inventory for real-time updates
let roomInventory = JSON.parse(localStorage.getItem('roomInventory')) || {...roomsData.reduce((acc, room) => ({...acc, [room.id]: room.roomsLeft}), {})};

// Booking Cart for Multi-room booking
let bookingCart = JSON.parse(localStorage.getItem('bookingCart')) || [];

// Dynamic Pricing Factors
const pricingFactors = {
    weekday: 1.0,
    weekend: 1.25,
    peak: 1.5,
    offPeak: 0.85
};

// Promo Codes
const promoCodes = {
    'SAVE10': { discount: 0.10, description: '10% Off' },
    'SAVE20': { discount: 0.20, description: '20% Off' },
    'LUXURY50': { discount: 0.50, description: '50% Off' },
    'WELCOME': { discount: 0.15, description: '15% Welcome Discount' },
    'CORP01': { discount: 0.25, description: '25% Corporate Discount' },
    'GROUP5': { discount: 0.15, description: '15% Group Discount' }
};

// Add-ons pricing
const addOns = {
    breakfast: { price: 25, name: 'Daily Breakfast' },
    airportPickup: { price: 45, name: 'Airport Pickup' },
    spaCredit: { price: 50, name: '$50 Spa Credit' },
    lateCheckout: { price: 35, name: 'Late Checkout (2PM)' },
    extraBed: { price: 40, name: 'Extra Bed' }
};

// ====================================
// UTILITIES
// ====================================

function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), duration);
    }
}

function formatCurrency(amount, currency = 'USD') {
    const rates = { USD: 1, GHS: 12.5, EUR: 0.92 };
    const symbols = { USD: '$', GHS: '₵', EUR: '€' };
    const converted = amount * rates[currency];
    return `${symbols[currency]}${converted.toFixed(2)}`;
}

function getCurrency() {
    return document.getElementById('currencySelector')?.value || 'USD';
}

// ====================================
// OFFLINE MODE
// ====================================

function updateOnlineStatus() {
    const offlineIndicator = document.getElementById('offlineIndicator');
    if (navigator.onLine) {
        if (offlineIndicator) offlineIndicator.style.display = 'none';
        document.body.classList.remove('offline-mode');
    } else {
        if (offlineIndicator) offlineIndicator.style.display = 'flex';
        document.body.classList.add('offline-mode');
        showToast('You are offline. Some features may be limited.');
    }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

function toggleOfflineMode() {
    const offlineIndicator = document.getElementById('offlineIndicator');
    if (offlineIndicator) {
        const isHidden = offlineIndicator.style.display === 'none';
        offlineIndicator.style.display = isHidden ? 'flex' : 'none';
        document.body.classList.toggle('offline-mode', isHidden);
        showToast(isHidden ? 'Offline mode enabled' : 'Offline mode disabled');
    }
}

// ====================================
// THEME & LANGUAGE
// ====================================

const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        themeToggle.innerHTML = document.body.classList.contains('dark-mode') ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

const currencySelector = document.getElementById('currencySelector');
if (currencySelector) {
    currencySelector.addEventListener('change', (e) => {
        updateAllPrices(e.target.value);
    });
}

function updateAllPrices(currency) {
    document.querySelectorAll('[data-price]').forEach(el => {
        const originalPrice = parseFloat(el.dataset.price);
        el.textContent = formatCurrency(originalPrice, currency);
    });
    // Update cart
    updateCartDisplay();
}

// ====================================
// BACK TO TOP
// ====================================

const backToTopBtn = document.getElementById('backToTop');
if (backToTopBtn) {
    window.addEventListener('scroll', () => {
        backToTopBtn.classList.toggle('show', window.scrollY > 300);
    });
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ====================================
// DYNAMIC PRICING ENGINE
// ====================================

function calculateDynamicPrice(basePrice, checkInDate, checkOutDate) {
    const checkIn = new Date(checkInDate);
    const dayOfWeek = checkIn.getDay();
    const isWeekend = (dayOfWeek === 5 || dayOfWeek === 6); // Friday or Saturday
    const isPeakSeason = checkIn.getMonth() >= 10 || checkIn.getMonth() <= 1; // Nov-Feb
    
    let multiplier = 1;
    if (isWeekend) multiplier *= pricingFactors.weekend;
    if (isPeakSeason) multiplier *= pricingFactors.peak;
    else multiplier *= pricingFactors.offPeak;
    
    return Math.round(basePrice * multiplier);
}

function updateDynamicPricing() {
    const checkIn = document.getElementById('inlineCheckIn')?.value;
    const checkOut = document.getElementById('inlineCheckOut')?.value;
    const priceEl = document.getElementById('roomPrice');
    
    if (checkIn && checkOut && priceEl) {
        const basePrice = parseFloat(priceEl.dataset.basePrice) || 299;
        const dynamicPrice = calculateDynamicPrice(basePrice, checkIn, checkOut);
        priceEl.textContent = formatCurrency(dynamicPrice, getCurrency());
        priceEl.dataset.price = dynamicPrice;
    }
}

// ====================================
// REAL-TIME AVAILABILITY
// ====================================

function getRoomsLeft(roomId) {
    return roomInventory[roomId] || 0;
}

function updateRoomAvailability(roomId) {
    if (roomInventory[roomId] > 0) {
        roomInventory[roomId]--;
        localStorage.setItem('roomInventory', JSON.stringify(roomInventory));
    }
    return roomInventory[roomId];
}

function getAvailabilityStatus(roomId) {
    const roomsLeft = getRoomsLeft(roomId);
    if (roomsLeft === 0) return 'Sold Out';
    if (roomsLeft <= 2) return `Only ${roomsLeft} rooms left!`;
    return `${roomsLeft} rooms available`;
}

function renderAvailabilityBadge(roomId) {
    const roomsLeft = getRoomsLeft(roomId);
    if (roomsLeft <= 2 && roomsLeft > 0) {
        return `<span class="urgency-badge">⚡ Only ${roomsLeft} left!</span>`;
    }
    return '';
}

// ====================================
// MULTI-ROOM & GROUP BOOKING
// ====================================

function addToCart(roomId, quantity = 1) {
    const room = roomsData.find(r => r.id === roomId);
    if (!room) return;
    
    const existingItem = bookingCart.find(item => item.roomId === roomId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        bookingCart.push({ ...room, quantity });
    }
    
    localStorage.setItem('bookingCart', JSON.stringify(bookingCart));
    showToast(`Added ${room.name} to cart (${quantity})`);
    updateCartDisplay();
}

function removeFromCart(roomId) {
    bookingCart = bookingCart.filter(item => item.roomId !== roomId);
    localStorage.setItem('bookingCart', JSON.stringify(bookingCart));
    updateCartDisplay();
    showToast('Room removed from cart');
}

function updateCartQuantity(roomId, quantity) {
    const item = bookingCart.find(item => item.roomId === roomId);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(roomId);
        } else {
            item.quantity = quantity;
            localStorage.setItem('bookingCart', JSON.stringify(bookingCart));
            updateCartDisplay();
        }
    }
}

function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    const cartItems = document.getElementById('cartItems');
    
    const totalItems = bookingCart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = bookingCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (cartCount) cartCount.textContent = totalItems;
    if (cartTotal) cartTotal.textContent = formatCurrency(totalPrice, getCurrency());
    
    // Group discount calculation
    const discount = totalItems >= 3 ? 0.15 : (totalItems >= 2 ? 0.10 : 0);
    const discountAmount = totalPrice * discount;
    const finalTotal = totalPrice - discountAmount;
    
    return { totalItems, totalPrice, discount, discountAmount, finalTotal };
}

function renderCartItems() {
    const cartItems = document.getElementById('cartItems');
    if (!cartItems) return;
    
    if (bookingCart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        return;
    }
    
    cartItems.innerHTML = bookingCart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>${formatCurrency(item.price, getCurrency())} / night</p>
                <div class="quantity-control">
                    <button onclick="updateCartQuantity(${item.roomId}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateCartQuantity(${item.roomId}, ${item.quantity + 1})">+</button>
                </div>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${item.roomId})"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');
}

// ====================================
// ADD-ONS SYSTEM
// ====================================

let selectedAddOns = [];

function toggleAddOn(addOnKey) {
    const index = selectedAddOns.indexOf(addOnKey);
    if (index > -1) {
        selectedAddOns.splice(index, 1);
    } else {
        selectedAddOns.push(addOnKey);
    }
    updateAddOnsTotal();
}

function updateAddOnsTotal() {
    const addOnsTotal = selectedAddOns.reduce((sum, key) => sum + (addOns[key]?.price || 0), 0);
    const addOnsEl = document.getElementById('addOnsTotal');
    if (addOnsEl) {
        addOnsEl.textContent = formatCurrency(addOnsTotal, getCurrency());
    }
    return addOnsTotal;
}

function renderAddOns() {
    const container = document.getElementById('addOnsContainer');
    if (!container) return;
    
    container.innerHTML = Object.entries(addOns).map(([key, value]) => `
        <label class="add-on-checkbox">
            <input type="checkbox" onchange="toggleAddOn('${key}')">
            <span class="add-on-info">
                <strong>${value.name}</strong>
                <span>+${formatCurrency(value.price, getCurrency())}</span>
            </span>
        </label>
    `).join('');
}

// ====================================
// PROMO CODES
// ====================================

function applyPromoCode() {
    const code = document.getElementById('promoCode')?.value.toUpperCase() || '';
    const message = document.getElementById('promoMessage');
    const promoData = promoCodes[code];
    
    if (promoData) {
        showToast(`Promo code applied! ${promoData.description}`);
        if (message) {
            message.innerHTML = `✓ ${promoData.description} applied!`;
            message.className = 'promo-message success';
        }
        localStorage.setItem('appliedPromo', code);
        updatePricingSummary();
    } else {
        showToast('Invalid promo code');
        if (message) {
            message.textContent = 'Invalid promo code';
            message.className = 'promo-message error';
        }
    }
}

// ====================================
// PRICING SUMMARY
// ====================================

function updatePricingSummary() {
    const cart = updateCartDisplay();
    const addOnsTotal = updateAddOnsTotal();
    const promoCode = localStorage.getItem('appliedPromo');
    const promoDiscount = promoCode ? promoCodes[promoCode].discount : 0;
    
    const subtotal = cart.totalPrice + addOnsTotal;
    const promoAmount = subtotal * promoDiscount;
    const groupDiscount = cart.discountAmount;
    const grandTotal = subtotal - promoAmount - groupDiscount;
    
    // Update UI elements
    const elements = {
        'subtotal': formatCurrency(subtotal, getCurrency()),
        'groupDiscount': formatCurrency(groupDiscount, getCurrency()),
        'promoDiscount': formatCurrency(promoAmount, getCurrency()),
        'grandTotal': formatCurrency(grandTotal, getCurrency()),
        'discountBadge': cart.discount > 0 ? `<span class="discount-badge">Group Discount: ${cart.discount * 100}%</span>` : ''
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = value;
    });
}

// ====================================
// EMAIL & SMS NOTIFICATIONS UI
// ====================================

function sendNotification(type, data) {
    // Simulated notification system
    const notifications = {
        bookingConfirmation: {
            title: 'Booking Confirmed! 🎉',
            message: `Your booking #${data.bookingId} has been confirmed. A confirmation email has been sent to ${data.email}.`,
            icon: 'fa-check-circle',
            color: 'success'
        },
        reminder: {
            title: 'Check-in Reminder 📅',
            message: `Your check-in is tomorrow (${data.checkIn}). Please complete your online check-in.`,
            icon: 'fa-bell',
            color: 'info'
        },
        paymentReceipt: {
            title: 'Payment Received 💳',
            message: `Payment of ${formatCurrency(data.amount, getCurrency())} received. Your receipt has been emailed.`,
            icon: 'fa-credit-card',
            color: 'success'
        },
        cancellation: {
            title: 'Booking Cancelled ❌',
            message: `Your booking #${data.bookingId} has been cancelled. Refund will be processed within 5-7 days.`,
            icon: 'fa-times-circle',
            color: 'warning'
        }
    };
    
    const notification = notifications[type];
    if (notification) {
        showToast(notification.message);
        return notification;
    }
    return null;
}

function renderNotificationCenter() {
    const container = document.getElementById('notificationCenter');
    if (!container) return;
    
    // Demo notifications
    const demoNotifications = [
        { type: 'bookingConfirmation', data: { bookingId: 'LXS-2024-001', email: 'guest@email.com' } },
        { type: 'reminder', data: { checkIn: 'Dec 15, 2024' } },
        { type: 'paymentReceipt', data: { amount: 299 } }
    ];
    
    container.innerHTML = demoNotifications.map(n => `
        <div class="notification-item ${n.type}">
            <i class="fas ${sendNotification(n.type, n.data)?.icon || 'fa-bell'}"></i>
            <div>
                <strong>${sendNotification(n.type, n.data)?.title || ''}</strong>
                <p>${sendNotification(n.type, n.data)?.message || ''}</p>
            </div>
        </div>
    `).join('');
}

// ====================================
// PAYMENT INTEGRATION UI
// ====================================

function renderPaymentOptions() {
    const container = document.getElementById('paymentOptions');
    if (!container) return;
    
    container.innerHTML = `
        <div class="payment-option" data-method="card">
            <input type="radio" name="payment" id="payCard" value="card">
            <label for="payCard">
                <i class="fas fa-credit-card"></i>
                <span>Credit/Debit Card</span>
                <small>Visa, Mastercard, Amex</small>
            </label>
        </div>
        <div class="payment-option" data-method="mobile">
            <input type="radio" name="payment" id="payMobile" value="mobile">
            <label for="payMobile">
                <i class="fas fa-mobile-alt"></i>
                <span>Mobile Money</span>
                <small>MTN, Vodafone, AirtelTigo</small>
            </label>
        </div>
        <div class="payment-option" data-method="paystack">
            <input type="radio" name="payment" id="payPaystack" value="paystack">
            <label for="payPaystack">
                <i class="fas fa-wallet"></i>
                <span>Paystack</span>
                <small>Secure online payment</small>
            </label>
        </div>
        <div class="payment-option" data-method="flutterwave">
            <input type="radio" name="payment" id="payFlutterwave" value="flutterwave">
            <label for="payFlutterwave">
                <i class="fas fa-exchange-alt"></i>
                <span>Flutterwave</span>
                <small>Africa payments</small>
            </label>
        </div>
        <div class="payment-option" data-method="hotel">
            <input type="radio" name="payment" id="payHotel" value="hotel">
            <label for="payHotel">
                <i class="fas fa-building"></i>
                <span>Pay at Hotel</span>
                <small>Pay when you arrive</small>
            </label>
        </div>
    `;
    
    // Add payment method selection handler
    container.querySelectorAll('.payment-option').forEach(option => {
        option.addEventListener('click', () => {
            container.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
        });
    });
}

function processPayment(paymentMethod) {
    const cart = updateCartDisplay();
    const addOnsTotal = updateAddOnsTotal();
    const promoCode = localStorage.getItem('appliedPromo');
    const promoDiscount = promoCode ? promoCodes[promoCode].discount : 0;
    
    const subtotal = cart.totalPrice + addOnsTotal;
    const promoAmount = subtotal * promoDiscount;
    const groupDiscount = cart.discountAmount;
    const grandTotal = subtotal - promoAmount - groupDiscount;
    
    // Simulate payment processing
    showToast(`Processing payment via ${paymentMethod}...`);
    
    setTimeout(() => {
        const bookingId = `LXS-${new Date().getFullYear()}-${Math.floor(Math.random() * 100000)}`;
        
        // Send notification
        sendNotification('bookingConfirmation', { bookingId, email: document.getElementById('email')?.value || 'guest@email.com' });
        sendNotification('paymentReceipt', { amount: grandTotal });
        
        // Show confirmation
        const modal = document.getElementById('confirmationModal');
        if (modal) {
            document.getElementById('confirmationNumber').textContent = bookingId;
            modal.classList.add('show');
        }
        
        // Clear cart
        bookingCart = [];
        localStorage.setItem('bookingCart', JSON.stringify(bookingCart));
        localStorage.removeItem('appliedPromo');
        
        showToast('Payment successful! Booking confirmed.');
    }, 2000);
}

// ====================================
// ONLINE CHECK-IN & DIGITAL KEY
// ====================================

function generateQRCode() {
    const bookingId = document.getElementById('confirmationNumber')?.textContent || 'LXS-DEMO-123';
    const qrContainer = document.getElementById('qrCodeContainer');
    if (qrContainer) {
        // Simulated QR code display
        qrContainer.innerHTML = `
            <div class="qr-code-display">
                <div class="qr-pattern">
                    <div class="qr-placeholder">
                        <i class="fas fa-qrcode"></i>
                    </div>
                </div>
                <p class="qr-instruction">Scan this QR code at the hotel reception or use it with our smart lock system</p>
                <div class="digital-key-info">
                    <span class="key-badge"><i class="fas fa-key"></i> Digital Key Active</span>
                    <p>Your room will be ready for digital check-in</p>
                </div>
            </div>
        `;
    }
}

function uploadID() {
    const fileInput = document.getElementById('idFile');
    const preview = document.getElementById('filePreview');
    
    if (fileInput && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (preview) {
                preview.innerHTML = `
                    <div class="upload-success">
                        <i class="fas fa-check-circle"></i>
                        <p>ID uploaded successfully!</p>
                    </div>
                `;
            }
            showToast('ID document uploaded successfully');
        };
        reader.readAsDataURL(fileInput.files[0]);
    }
}

function selectArrivalTime() {
    const timeSelect = document.getElementById('arrivalTime');
    const timeOptions = [
        '12:00 PM - Early Check-in',
        '2:00 PM - Standard Check-in',
        '4:00 PM - Late Check-in',
        '6:00 PM - Evening Check-in'
    ];
    
    if (timeSelect) {
        timeSelect.innerHTML = timeOptions.map(time => 
            `<option value="${time}">${time}</option>`
        ).join('');
    }
}

// ====================================
// FEATURED ROOMS (HOME)
// ====================================

const featuredRoomsGrid = document.getElementById('featuredRoomsGrid');
if (featuredRoomsGrid) {
    const featured = roomsData.slice(0, 3);
    
    featured.forEach(room => {
        const card = document.createElement('div');
        card.className = 'room-card';
        card.innerHTML = `
            <div class="room-card-image">
                <img src="${room.image}" alt="${room.name}" onerror="this.src='https://via.placeholder.com/400x300/1a3a52/ffffff?text=${room.name.replace(/ /g, '+')}'">
                ${renderAvailabilityBadge(room.id)}
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
                <div class="room-card-price" data-price="${room.price}" data-base-price="${room.price}">
                    ${formatCurrency(room.price, getCurrency())}<small>/night</small>
                </div>
                <div class="room-card-actions">
                    <a href="room-details.html?id=${room.id}" class="btn btn-primary" style="flex: 1;">View Details</a>
                    <button class="btn btn-secondary" onclick="addToCart(${room.id})">
                        <i class="fas fa-cart-plus"></i>
                    </button>
                </div>
            </div>
        `;
        featuredRoomsGrid.appendChild(card);
    });
}

// ====================================
// ROOMS PAGE
// ====================================

const roomsGrid = document.getElementById('roomsGrid');
if (roomsGrid) {
    function renderRooms(filter = {}) {
        roomsGrid.innerHTML = '';
        const filtered = roomsData.filter(room => {
            if (filter.maxPrice && room.price > filter.maxPrice) return false;
            if (filter.types?.length && !filter.types.includes(room.type)) return false;
            if (filter.amenities?.length && !filter.amenities.some(a => room.amenities.includes(a))) return false;
            if (filter.rating && room.rating < filter.rating) return false;
            if (filter.available && room.status !== 'available') return false;
            return true;
        });

        filtered.forEach(room => {
            const card = document.createElement('div');
            card.className = 'room-card';
            card.innerHTML = `
                <div class="room-card-image">
                    <img src="${room.image}" alt="${room.name}" onerror="this.src='https://via.placeholder.com/400x300/1a3a52/ffffff?text=${room.name.replace(/ /g, '+')}'">
                    ${renderAvailabilityBadge(room.id)}
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
                    <div class="room-card-price" data-price="${room.price}">
                        ${formatCurrency(room.price, getCurrency())}<small>/night</small>
                    </div>
                    <div class="room-card-actions">
                        <a href="room-details.html?id=${room.id}" class="btn btn-primary" style="flex: 1;">View Details</a>
                        <button class="btn btn-secondary" onclick="addToCart(${room.id})">
                            <i class="fas fa-cart-plus"></i>
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

    function applyFilters() {
        const maxPrice = parseInt(document.getElementById('priceRange')?.value) || 600;
        const types = Array.from(document.querySelectorAll('.room-type-filter:checked')).map(c => c.value);
        const amenities = Array.from(document.querySelectorAll('.amenity-filter:checked')).map(c => c.value);
        
        renderRooms({ maxPrice, types: types.length ? types : null, amenities: amenities.length ? amenities : null });
    }

    document.querySelectorAll('.room-type-filter, .amenity-filter').forEach(cb => {
        cb.addEventListener('change', applyFilters);
    });

    document.getElementById('resetFilters')?.addEventListener('click', () => {
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        document.getElementById('priceRange').value = 600;
        document.getElementById('priceDisplay').textContent = formatCurrency(600, getCurrency());
        renderRooms();
    });

    renderRooms();
}

// ====================================
// STAR RATING
// ====================================

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    let stars = '';
    for (let i = 0; i < fullStars; i++) stars += '<i class="fas fa-star"></i>';
    if (hasHalf) stars += '<i class="fas fa-star-half-alt"></i>';
    return `<span class="stars">${stars} <span class="rating-value">${rating}</span></span>`;
}

// ====================================
// WISHLIST
// ====================================

function toggleWishlist(btn, roomId) {
    btn.classList.toggle('active');
    const isAdded = btn.classList.contains('active');
    showToast(isAdded ? 'Added to wishlist!' : 'Removed from wishlist');
    btn.innerHTML = isAdded ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
}

// ====================================
// BOOKING FORM
// ====================================

const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const selectedMethod = document.querySelector('.payment-option.selected input')?.value || 'card';
        processPayment(selectedMethod);
    });
}

// ====================================
// CHECK-IN
// ====================================

const checkinForm = document.getElementById('checkinForm');
if (checkinForm) {
    checkinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Upload ID
        uploadID();
        
        // Generate QR Code
        generateQRCode();
        
        showToast('Check-in completed successfully!');
        setTimeout(() => window.location.href = 'dashboard.html', 2000);
    });
    
    // Initialize arrival time
    selectArrivalTime();
}

// ====================================
// MODAL & FORMS
// ====================================

document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.target.closest('.modal').classList.remove('show');
    });
});

document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('show');
    });
});

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

// ====================================
// NEWSLETTER & CONTACT
// ====================================

document.querySelectorAll('#newsletterForm').forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Thank you for subscribing!');
        form.reset();
    });
});

document.getElementById('contactForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Thank you for your message. We will respond shortly!');
    e.target.reset();
});

// ====================================
// RATING INPUT
// ====================================

document.querySelectorAll('.rating-input .star').forEach(star => {
    star.addEventListener('click', () => {
        const value = star.dataset.value;
        document.querySelectorAll('.rating-input .star').forEach((s, i) => {
            s.classList.toggle('active', i < value);
        });
    });
});

// ====================================
// LOYALTY POINTS
// ====================================

function updateLoyaltyPoints(points) {
    const pointsDisplay = document.getElementById('loyaltyPoints');
    if (pointsDisplay) pointsDisplay.textContent = points.toLocaleString();
}

function earnPoints(amount) {
    const points = Math.floor(amount * 10);
    const currentPoints = parseInt(localStorage.getItem('loyaltyPoints')) || 0;
    const newTotal = currentPoints + points;
    localStorage.setItem('loyaltyPoints', newTotal);
    updateLoyaltyPoints(newTotal);
    showToast(`You earned ${points} loyalty points!`);
}

// ====================================
// RECOMMENDATIONS
// ====================================

function loadRecommendations(currentRoomId) {
    const container = document.getElementById('recommendationsGrid');
    if (!container) return;
    
    const recommendations = roomsData.filter(r => r.id !== currentRoomId).slice(0, 3);
    
    container.innerHTML = recommendations.map(room => `
        <div class="room-card">
            <div class="room-card-image">
                <img src="${room.image}" alt="${room.name}">
            </div>
            <div class="room-card-body">
                <h3>${room.name}</h3>
                <div class="room-card-meta">
                    <span><i class="fas fa-star"></i> ${room.rating}</span>
                </div>
                <div class="room-card-price" data-price="${room.price}">
                    ${formatCurrency(room.price, getCurrency())}<small>/night</small>
                </div>
                <a href="room-details.html?id=${room.id}" class="btn btn-primary">View Details</a>
            </div>
        </div>
    `).join('');
}

// ====================================
// INITIALIZATION
// ====================================

document.addEventListener('DOMContentLoaded', () => {
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    
    document.querySelectorAll('input[type="date"]').forEach(input => {
        if (input.id.includes('CheckIn') || input.id === 'arrivalDate') {
            input.value = today;
            input.min = today;
        } else if (input.id.includes('CheckOut')) {
            input.value = tomorrow;
            input.min = tomorrow;
        }
    });
    
    // Initialize features
    updateOnlineStatus();
    const savedPoints = parseInt(localStorage.getItem('loyaltyPoints')) || 0;
    updateLoyaltyPoints(savedPoints);
    
    // Initialize payment options
    renderPaymentOptions();
    
    // Initialize add-ons
    renderAddOns();
    
    // Initialize notifications
    renderNotificationCenter();
    
    // Room details page
    const roomDetails = document.getElementById('detailsRoomName');
    if (roomDetails) {
        const urlParams = new URLSearchParams(window.location.search);
        const roomId = parseInt(urlParams.get('id')) || 1;
        loadRecommendations(roomId);
        
        // Dynamic pricing
        document.getElementById('inlineCheckIn')?.addEventListener('change', updateDynamicPricing);
        document.getElementById('inlineCheckOut')?.addEventListener('change', updateDynamicPricing);
    }
    
    // Cart display
    updateCartDisplay();
    renderCartItems();
    
    console.log('Hotel Booking System v2.0 - Advanced Features Loaded');
});
