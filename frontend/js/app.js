// ===== ANNSEVA — API HELPER =====
const API_BASE = '/api';

const api = {
  token: localStorage.getItem('token') || '',

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  },

  clearToken() {
    this.token = '';
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch { return null; }
  },

  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  isLoggedIn() {
    return !!this.token;
  },

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = { ...options.headers };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Don't set Content-Type for FormData (multipart)
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      if (options.body && typeof options.body === 'object') {
        options.body = JSON.stringify(options.body);
      }
    }

    try {
      const response = await fetch(url, { ...options, headers, credentials: 'include' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      if (error.message === 'Not authorized, token invalid' || error.message === 'Token expired') {
        this.clearToken();
        window.location.href = '/login.html';
      }
      throw error;
    }
  },

  get(endpoint) { return this.request(endpoint); },
  post(endpoint, body) { return this.request(endpoint, { method: 'POST', body }); },
  put(endpoint, body) { return this.request(endpoint, { method: 'PUT', body }); },
  delete(endpoint) { return this.request(endpoint, { method: 'DELETE' }); },

  upload(endpoint, formData, method = 'POST') {
    return this.request(endpoint, { method, body: formData });
  },
};

// ===== AUTH HELPERS =====
const auth = {
  async login(email, password) {
    const data = await api.post('/auth/login', { email, password });
    api.setToken(data.token);
    api.setUser(data.user);
    return data;
  },

  async signup(name, email, password, role = 'customer') {
    const data = await api.post('/auth/signup', { name, email, password, role });
    api.setToken(data.token);
    api.setUser(data.user);
    return data;
  },

  async logout() {
    try { await api.post('/auth/logout'); } catch { }
    api.clearToken();
    window.location.href = '/index.html';
  },

  async getProfile() {
    const data = await api.get('/auth/me');
    api.setUser(data.user);
    return data.user;
  },

  requireAuth() {
    if (!api.isLoggedIn()) {
      window.location.href = '/login.html';
      return false;
    }
    return true;
  },

  requireRole(role) {
    const user = api.getUser();
    if (!user || user.role !== role) {
      showToast('Access denied', 'error');
      window.location.href = '/index.html';
      return false;
    }
    return true;
  },
};

// ===== TOAST SYSTEM =====
function showToast(message, type = 'info', duration = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <span class="toast-message">${message}</span>
    <span class="toast-close" onclick="this.parentElement.remove()">✕</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ===== NAVBAR =====
function renderNavbar() {
  const user = api.getUser();
  const isAdmin = user && (user.role === 'admin' || user.role === 'restaurant');
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  const nav = document.createElement('nav');
  nav.className = 'navbar';
  nav.id = 'main-navbar';
  nav.innerHTML = `
    <div class="container">
      <a href="/index.html" class="nav-brand">
        <span class="nav-brand-icon">🍛</span>
        Ann<span>Seva</span>
      </a>
      
      <div class="nav-links" id="nav-links">
        <a href="/index.html" class="nav-link ${currentPage === 'index.html' ? 'active' : ''}">🏠 Home</a>
        <a href="/restaurants.html" class="nav-link ${currentPage === 'restaurants.html' ? 'active' : ''}">🍽️ Restaurants</a>
        ${user ? `
          <a href="/orders.html" class="nav-link ${currentPage === 'orders.html' ? 'active' : ''}">📦 Orders</a>
          <a href="/wishlist.html" class="nav-link ${currentPage === 'wishlist.html' ? 'active' : ''}">❤️ Wishlist</a>
          <a href="/cart.html" class="nav-link ${currentPage === 'cart.html' ? 'active' : ''}" id="nav-cart">
            🛒 Cart
            <span class="badge hidden" id="cart-badge">0</span>
          </a>
          ${isAdmin ? `<a href="/admin.html" class="nav-link ${currentPage === 'admin.html' ? 'active' : ''}">📊 Dashboard</a>` : ''}
        ` : ''}
      </div>

      <div class="nav-user">
        ${user ? `
          <div style="position: relative;">
            <button class="nav-link" id="notif-btn" onclick="toggleNotifications()">
              🔔
              <span class="badge hidden" id="notif-badge">0</span>
            </button>
            <div class="notification-dropdown" id="notif-dropdown"></div>
          </div>
          <a href="/profile.html" class="nav-avatar" title="${user.name}">${user.name.charAt(0).toUpperCase()}</a>
          <button class="btn btn-sm btn-secondary" onclick="auth.logout()">Logout</button>
        ` : `
          <a href="/login.html" class="btn btn-sm btn-secondary">Login</a>
          <a href="/signup.html" class="btn btn-sm btn-primary">Sign Up</a>
        `}
        <div class="nav-toggle" onclick="toggleMobileMenu()">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  `;

  document.body.prepend(nav);
  updateCartBadge();

  // Scroll effect
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });
}

function toggleMobileMenu() {
  document.getElementById('nav-links')?.classList.toggle('open');
}

// ===== CART BADGE =====
async function updateCartBadge() {
  if (!api.isLoggedIn()) return;
  try {
    const data = await api.get('/cart');
    const count = data.data.items ? data.data.items.length : 0;
    const badge = document.getElementById('cart-badge');
    if (badge) {
      badge.textContent = count;
      badge.classList.toggle('hidden', count === 0);
    }
  } catch { }
}

// ===== NOTIFICATIONS =====
async function loadNotifications() {
  if (!api.isLoggedIn()) return;
  try {
    const data = await api.get('/notifications');
    const badge = document.getElementById('notif-badge');
    if (badge) {
      badge.textContent = data.unreadCount;
      badge.classList.toggle('hidden', data.unreadCount === 0);
    }

    const dropdown = document.getElementById('notif-dropdown');
    if (dropdown) {
      if (data.data.length === 0) {
        dropdown.innerHTML = '<div class="empty-state" style="padding: 30px;"><p>No notifications</p></div>';
      } else {
        dropdown.innerHTML = data.data.slice(0, 10).map(n => `
          <div class="notification-item ${n.isRead ? '' : 'unread'}" onclick="markNotifRead('${n._id}', '${n.link}')">
            <div class="notif-icon" style="background: ${n.type === 'order' ? 'rgba(255,107,53,0.15)' : 'rgba(124,92,252,0.15)'}">
              ${n.type === 'order' ? '📦' : n.type === 'payment' ? '💳' : '🔔'}
            </div>
            <div class="notif-text">
              <div class="notif-title">${n.title}</div>
              <div class="notif-msg">${n.message}</div>
              <div class="notif-time">${timeAgo(n.createdAt)}</div>
            </div>
          </div>
        `).join('');
      }
    }
  } catch { }
}

function toggleNotifications() {
  const dd = document.getElementById('notif-dropdown');
  dd?.classList.toggle('open');
}

async function markNotifRead(id, link) {
  try { await api.put(`/notifications/${id}/read`); } catch { }
  if (link) window.location.href = link;
}

// ===== FOOTER =====
function renderFooter() {
  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="footer-brand">🍛 Ann<span>Seva</span></div>
          <p class="footer-desc">Your favorite food, delivered fast. Experience the best restaurants in your city with real-time tracking and secure payments.</p>
        </div>
        <div>
          <h4 class="footer-title">Quick Links</h4>
          <ul class="footer-links">
            <li><a href="/index.html">Home</a></li>
            <li><a href="/restaurants.html">Restaurants</a></li>
            <li><a href="/orders.html">My Orders</a></li>
            <li><a href="/profile.html">Profile</a></li>
          </ul>
        </div>
        <div>
          <h4 class="footer-title">Support</h4>
          <ul class="footer-links">
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">FAQs</a></li>
            <li><a href="#">Terms of Service</a></li>
          </ul>
        </div>
        <div>
          <h4 class="footer-title">Contact</h4>
          <ul class="footer-links">
            <li>📧 support@annseva.com</li>
            <li>📞 +91 98765 43210</li>
            <li>📍 Pune, Maharashtra</li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© ${new Date().getFullYear()} AnnSeva. Made with Me</p>
      </div>
    </div>
  `;
  document.body.appendChild(footer);
}

// ===== UTILITIES =====
function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatPrice(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

function getStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

function getStatusColor(status) {
  const colors = {
    placed: 'status-placed', confirmed: 'status-confirmed',
    preparing: 'status-preparing', out_for_delivery: 'status-out_for_delivery',
    delivered: 'status-delivered', cancelled: 'status-cancelled',
    paid: 'status-paid', pending: 'status-pending', failed: 'status-failed',
  };
  return colors[status] || 'status-pending';
}

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Close notifications dropdown on outside click
document.addEventListener('click', (e) => {
  const dd = document.getElementById('notif-dropdown');
  const btn = document.getElementById('notif-btn');
  if (dd && !dd.contains(e.target) && !btn?.contains(e.target)) {
    dd.classList.remove('open');
  }
});

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  renderFooter();
  loadNotifications();
});
