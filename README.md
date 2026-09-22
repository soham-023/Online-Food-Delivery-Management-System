# 🍔 AnnSeva — Online Food Delivery Management System

A **production-grade** online food delivery platform built with **Vanilla HTML/CSS/JavaScript** frontend and **Node.js/Express** backend, featuring **Razorpay payments**, **real-time order tracking**, and **enterprise-level security**.

---

## ✨ Features (20 Total)

### 👤 Customer Features
| # | Feature | Description |
|:--|:--|:--|
| 1 | 🔐 **User Authentication** | Signup/Login with JWT (Cookie + Bearer token), role-based access (Customer/Admin/Restaurant) |
| 2 | 👤 **Profile Management** | Edit name, email, phone; upload avatar; manage multiple delivery addresses with default selection |
| 3 | 🍽️ **Browse Restaurants** | View all restaurants with ratings, cuisine tags, delivery time, and minimum order amount |
| 4 | 🔍 **Search & Filter** | Global search across food/restaurants; filter by price range, category, rating, veg/non-veg; sort by rating/price/name |
| 5 | 📄 **Food Details** | View image, description, price, reviews with star ratings |
| 6 | 🛒 **Add to Cart** | Add/remove items, update quantity; single-restaurant enforcement |
| 7 | 💰 **Cart Summary** | Items total + 5% GST + delivery charges — automatic price calculation |
| 8 | 📦 **Place Order** | Select delivery address, choose payment method, apply coupon code |
| 9 | 💳 **Razorpay Payment** | Secure online payment with HMAC-SHA256 signature verification + Cash on Delivery |
| 10 | 🚚 **Live Order Tracking** | Real-time status updates via Socket.io + Leaflet.js map with simulated delivery movement |
| 11 | 📜 **Order History** | View past orders with status filters, pagination, and one-click reorder |
| 12 | ⭐ **Ratings & Reviews** | Rate food & restaurants (1-5 stars); duplicate review prevention; auto-updates average ratings |
| 13 | ❤️ **Wishlist/Favorites** | Save favorite food items and restaurants with toggle functionality |
| 14 | 🔔 **Notifications** | In-app notifications with unread count + email alerts for order updates |
| 15 | 🎟️ **Coupon System** | Apply promo codes with percentage/flat discounts, min order requirement, max cap, usage limits |

### 🔧 Admin/Restaurant Features
| # | Feature | Description |
|:--|:--|:--|
| 16 | 🏪 **Restaurant Management** | Full CRUD with image upload (Cloudinary CDN or local fallback) |
| 17 | 🍕 **Menu Management** | Add/Edit/Delete food items across 12 categories with image upload |
| 18 | 📦 **Order Management** | Accept/reject orders, update status with real-time Socket.io broadcast + email notification |
| 19 | 📊 **Admin Dashboard** | View total users, orders, revenue; Chart.js monthly revenue graph; today's stats; orders by status |
| 20 | 👥 **User Management** | View users with search/filter, block/unblock accounts (admin protection) |

---

## 🛡️ Security & Best Practices

| Feature | Implementation |
|:--|:--|
| **Password Security** | bcryptjs with salt rounds of 12; passwords never returned in API responses (`select: false`) |
| **JWT Authentication** | Dual-mode: Cookie (httpOnly) + Authorization Bearer header; configurable expiry (default 7d) |
| **Role-Based Access Control** | Variadic `roleGuard('admin', 'restaurant')` middleware; 3 roles: customer, admin, restaurant |
| **Input Validation** | `express-validator` rules on all mutation endpoints (auth, orders, cart, payments, reviews, coupons) |
| **Rate Limiting** | `express-rate-limit` — 100 req/15min for API, 10 req/15min for auth (brute force protection) |
| **Error Handling** | Global `errorHandler` catches Sequelize errors, ValidationError, duplicate key, JWT errors; stack traces only in development |
| **Blocked User Check** | Checked at both login and on every authenticated request |
| **Payment Verification** | Razorpay HMAC-SHA256 signature verification; separate webhook secret support |
| **Async Error Handling** | `asyncHandler` wrapper on all controllers — no try/catch boilerplate |

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|:--|:--|:--|
| **Runtime** | Node.js | v18+ |
| **Framework** | Express.js | 4.18.2 |
| **Database** | PostgreSQL (Sequelize ORM) | 6.x |
| **Authentication** | JWT + bcryptjs | 9.0.2 / 2.4.3 |
| **Payments** | Razorpay SDK | 2.9.2 |
| **Real-time** | Socket.io | 4.7.2 |
| **File Upload** | Multer + Cloudinary | 1.4.5 / 1.41.0 |
| **Validation** | express-validator | latest |
| **Rate Limiting** | express-rate-limit | latest |
| **Email** | Nodemailer | 6.9.7 |
| **Maps** | Leaflet.js + OpenStreetMap | CDN |
| **Charts** | Chart.js | CDN |
| **Fonts** | Google Fonts (Inter, Outfit) | CDN |
| **Dev Tool** | Nodemon | 3.0.2 |

---

## 📁 Project Structure

```
├── README.md
│
├── backend/
│   ├── server.js                    # Express + Socket.io entry point (rate limiting configured)
│   ├── seeder.js                    # Seeds 5 users, 6 restaurants, 33 menu items, 4 coupons
│   ├── package.json
│   ├── .env                         # Environment variables
│   │
│   ├── config/
│   │   ├── db.js                    # PostgreSQL connection
│   │   ├── razorpay.js              # Razorpay SDK instance
│   │   └── cloudinary.js            # Cloudinary v2 configuration
│   │
│   ├── models/                      # 9 Sequelize models
│   │   ├── User.js                  # name, email, password (hashed), role, addresses[], isBlocked
│   │   ├── Restaurant.js            # name, cuisine[], owner, rating, deliveryTime, openingHours
│   │   ├── MenuItem.js              # name, price, category (12 types), isVeg, isAvailable
│   │   ├── Order.js                 # items[], prices, payment*, status, statusHistory[], deliveryLocation
│   │   ├── Cart.js                  # user (unique), items[], auto-calculated totalPrice
│   │   ├── Review.js                # rating (1-5), comment; compound unique indexes
│   │   ├── Coupon.js                # code, discountType (percentage/flat), usageLimit
│   │   ├── Notification.js          # title, message, type, isRead, link
│   │   └── Wishlist.js              # items[] + restaurants[]
│   │
│   ├── controllers/                 # 12 controllers (all using asyncHandler)
│   │   ├── authController.js        # signup, login, getMe, logout
│   │   ├── orderController.js       # placeOrder, getMyOrders, updateStatus, reorder (with coupon rollback)
│   │   ├── paymentController.js     # createRazorpayOrder, verifyPayment, webhook (secure)
│   │   ├── restaurantController.js  # CRUD with Cloudinary image upload
│   │   ├── menuController.js        # CRUD + global search with multi-filter
│   │   ├── cartController.js        # add/update/remove/clear (single-restaurant enforcement)
│   │   ├── adminController.js       # dashboard stats via Sequelize queries
│   │   ├── userController.js        # profile, password, addresses, avatar upload
│   │   ├── reviewController.js      # create (auto-updates avg rating), list (paginated), delete
│   │   ├── couponController.js      # apply (with validation), CRUD
│   │   ├── wishlistController.js    # toggle items/restaurants
│   │   └── notificationController.js # list, markAsRead, markAllAsRead
│   │
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification (header + cookie), blocked user check
│   │   ├── roleGuard.js             # Variadic role-based access control
│   │   ├── errorHandler.js          # Global error handler (Sequelize, JWT, validation errors)
│   │   ├── upload.js                # Multer + Cloudinary (auto-detect) + getImageUrl helper
│   │   └── validate.js              # express-validator rules for all endpoints
│   │
│   ├── utils/
│   │   ├── asyncHandler.js          # Wraps async functions to catch errors automatically
│   │   ├── apiError.js              # Custom error class with statusCode
│   │   ├── generateToken.js         # JWT signing with configurable expiry
│   │   └── sendEmail.js             # Nodemailer + HTML email templates (dev fallback to console)
│   │
│   ├── routes/                      # 12 route files with validation middleware
│   ├── socket/
│   │   └── socketHandler.js         # JWT auth, order rooms, location updates, status broadcasts
│   └── uploads/                     # Local image storage (Cloudinary fallback)
│
├── frontend/
│   ├── css/
│   │   └── style.css                # 1,500+ line premium design system (dark glassmorphism theme)
│   ├── js/
│   │   └── app.js                   # Core: API helper, auth, toasts, navbar, footer, utilities
│   │
│   ├── index.html                   # Homepage — hero, categories, top restaurants, popular dishes, promos
│   ├── login.html                   # Login with JWT
│   ├── signup.html                  # Registration with role selection
│   ├── restaurants.html             # Restaurant listing with search/filter/sort
│   ├── restaurant.html              # Restaurant detail + menu by category
│   ├── food.html                    # Food item detail + reviews
│   ├── cart.html                    # Shopping cart with quantity controls
│   ├── checkout.html                # Address selection, coupon, Razorpay payment
│   ├── order-tracking.html          # Live tracking with Leaflet.js map + Socket.io
│   ├── orders.html                  # Order history with filters + reorder
│   ├── profile.html                 # Profile editing, password, addresses
│   ├── wishlist.html                # Saved items and restaurants
│   ├── admin.html                   # Dashboard with stats + Chart.js revenue graph
│   ├── admin-restaurants.html       # Restaurant CRUD
│   ├── admin-menu.html              # Menu item CRUD
│   ├── admin-orders.html            # Order status management
│   └── admin-users.html             # User blocking/unblocking
```

---

## 🔌 API Endpoints (40+)

### Authentication
| Method | Endpoint | Auth | Description |
|:--|:--|:--|:--|
| POST | `/api/auth/signup` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login (returns JWT) |
| GET | `/api/auth/me` | ✅ | Get current user profile |
| POST | `/api/auth/logout` | ✅ | Logout (clears cookie) |

### User Management
| Method | Endpoint | Auth | Description |
|:--|:--|:--|:--|
| PUT | `/api/users/profile` | ✅ | Update name, email, phone |
| PUT | `/api/users/password` | ✅ | Change password |
| PUT | `/api/users/avatar` | ✅ | Upload/update profile picture |
| POST | `/api/users/address` | ✅ | Add delivery address |
| PUT | `/api/users/address/:id` | ✅ | Update address |
| DELETE | `/api/users/address/:id` | ✅ | Delete address |

### Restaurants
| Method | Endpoint | Auth | Description |
|:--|:--|:--|:--|
| GET | `/api/restaurants` | ❌ | List all (search, filter, sort, paginate) |
| GET | `/api/restaurants/:id` | ❌ | Get single restaurant |
| POST | `/api/restaurants` | 🔒 | Create (admin/restaurant + image upload) |
| PUT | `/api/restaurants/:id` | 🔒 | Update (admin/restaurant + image upload) |
| DELETE | `/api/restaurants/:id` | 🔒 | Delete (admin only) |

### Menu Items
| Method | Endpoint | Auth | Description |
|:--|:--|:--|:--|
| GET | `/api/menu/search` | ❌ | Global search with multi-filter |
| GET | `/api/menu/restaurant/:id` | ❌ | Get menu for a restaurant |
| GET | `/api/menu/:id` | ❌ | Get single item |
| POST | `/api/menu` | 🔒 | Create (admin/restaurant) |
| PUT | `/api/menu/:id` | 🔒 | Update (admin/restaurant) |
| DELETE | `/api/menu/:id` | 🔒 | Delete (admin/restaurant) |

### Cart
| Method | Endpoint | Auth | Description |
|:--|:--|:--|:--|
| GET | `/api/cart` | ✅ | Get user's cart |
| POST | `/api/cart` | ✅ | Add item (validated) |
| PUT | `/api/cart/:itemId` | ✅ | Update quantity |
| DELETE | `/api/cart/:itemId` | ✅ | Remove item |
| DELETE | `/api/cart` | ✅ | Clear cart |

### Orders
| Method | Endpoint | Auth | Description |
|:--|:--|:--|:--|
| POST | `/api/orders` | ✅ | Place order (validated) |
| GET | `/api/orders` | ✅ | Get my orders (paginated) |
| GET | `/api/orders/:id` | ✅ | Get single order (ownership check) |
| GET | `/api/orders/admin/all` | 🔒 | All orders (restaurant-scoped for restaurant role) |
| PUT | `/api/orders/:id/status` | 🔒 | Update status (validated) |
| POST | `/api/orders/:id/reorder` | ✅ | Copy order items to cart |

### Payments
| Method | Endpoint | Auth | Description |
|:--|:--|:--|:--|
| POST | `/api/payment/create-order` | ✅ | Create Razorpay order (validated) |
| POST | `/api/payment/verify` | ✅ | Verify payment signature (validated) |
| POST | `/api/payment/webhook` | ❌ | Razorpay webhook (signature verified) |

### Reviews
| Method | Endpoint | Auth | Description |
|:--|:--|:--|:--|
| POST | `/api/reviews` | ✅ | Create review (validated, 1-5 stars) |
| GET | `/api/reviews/restaurant/:id` | ❌ | Get restaurant reviews (paginated) |
| GET | `/api/reviews/food/:id` | ❌ | Get food reviews (paginated) |
| DELETE | `/api/reviews/:id` | ✅ | Delete review (ownership check) |

### Wishlist / Coupons / Notifications / Admin
| Method | Endpoint | Auth | Description |
|:--|:--|:--|:--|
| GET | `/api/wishlist` | ✅ | Get wishlist |
| POST | `/api/wishlist/item/:id` | ✅ | Toggle food item |
| POST | `/api/wishlist/restaurant/:id` | ✅ | Toggle restaurant |
| GET | `/api/coupons` | ❌ | List active coupons |
| POST | `/api/coupons/apply` | ✅ | Apply coupon (validated) |
| POST/PUT/DELETE | `/api/coupons[/:id]` | 🔒 | CRUD (admin only) |
| GET | `/api/notifications` | ✅ | Get notifications + unread count |
| PUT | `/api/notifications/:id/read` | ✅ | Mark as read |
| PUT | `/api/notifications/read-all` | ✅ | Mark all as read |
| GET | `/api/admin/dashboard` | 🔒 | Dashboard stats (aggregation) |
| GET | `/api/admin/users` | 🔒 | List users (search, filter) |
| PUT | `/api/admin/users/:id/block` | 🔒 | Block/Unblock user |

> **Legend:** ❌ = Public, ✅ = Authenticated, 🔒 = Role-restricted (admin/restaurant)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **PostgreSQL** (local or managed)

### Installation

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Configure environment
# Edit backend/.env with your PostgreSQL credentials, Razorpay keys, etc.

# 3. Seed the database with sample data
npm run seed

# 4. Start the server (serves API + frontend)
npm run dev
```

### Open in Browser
Visit **http://localhost:4000**

### Demo Accounts (after seeding)

| Role | Email | Password |
|:--|:--|:--|
| 👤 Customer | soham@gmail.com | user123 |
| 🔧 Admin | admin@annseva.com | admin123 |
| 🏪 Restaurant | restaurant@annseva.com | rest123 |

---

## ⚙️ Environment Variables

```env
PORT=4000
NODE_ENV=development

# PostgreSQL
DATABASE_URL=postgres://postgres:postgres@localhost:5432/annseva

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Razorpay
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXX
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Cloudinary (optional — falls back to local /uploads/ if not configured)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (optional — falls back to console logging in development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend URL
CLIENT_URL=http://localhost:3000
```

---

## 🧪 Seed Data Overview

| Entity | Count | Details |
|:--|:--|:--|
| Users | 5 | 1 admin, 1 restaurant owner, 3 customers |
| Restaurants | 6 | Spice Garden, Pizza Paradise, Dragon Wok, Burger Barn, South Spice, Sweet Tooth Bakery |
| Menu Items | 33 | Across 12 categories with real Unsplash images |
| Coupons | 4 | WELCOME50, FOODIE20, FLAT100, FREEDELIVERY |

---

## 👨‍💻 Author

**Soham Chintawar**

## 📄 License

ISC
