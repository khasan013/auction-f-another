# 🏆 AuctionHub — Production-Ready Auction Platform

A full-stack, real-time auction platform built with React, Node.js, Express, MongoDB, and Socket.io. Feature-complete with live bidding, payment processing, image uploads, admin panel, and scalable architecture.

---

## 📁 Project Structure

```
auction-platform/
├── backend/
│   ├── config/
│   │   ├── database.js          # MongoDB connection with pooling
│   │   ├── cloudinary.js        # Image upload config + multer
│   │   └── logger.js            # Winston logger
│   ├── controllers/
│   │   ├── authController.js    # Register, login, JWT, email verify
│   │   ├── auctionController.js # CRUD, watchlist, categories
│   │   ├── bidController.js     # Real-time bidding + auto-bid
│   │   ├── paymentController.js # Stripe intents, webhooks
│   │   ├── adminController.js   # Dashboard, user mgmt, moderation
│   │   └── userController.js    # Profile, notifications, watchlist
│   ├── middleware/
│   │   ├── auth.js              # JWT protect + role authorize
│   │   └── errorHandler.js      # Centralized error handling
│   ├── models/
│   │   ├── User.js              # Users with bcrypt, JWT methods
│   │   ├── Auction.js           # Full auction schema + indexes
│   │   ├── Bid.js               # Bids with auto-bid support
│   │   ├── Transaction.js       # Payment records + Stripe IDs
│   │   └── Notification.js      # In-app notifications
│   ├── routes/                  # Express routers (all RESTful)
│   ├── services/
│   │   ├── socketService.js     # Socket.io rooms + auth
│   │   ├── auctionScheduler.js  # Cron: activate, end, notify
│   │   ├── notificationService.js
│   │   └── emailService.js      # Nodemailer + HTML templates
│   ├── utils/
│   │   └── seeder.js            # Dev seed data
│   ├── server.js                # Express + Socket.io entry point
│   └── .env.example
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── auction/
│       │   │   ├── AuctionCard.js    # Card with live countdown
│       │   │   ├── BidPanel.js       # Real-time bidding UI
│       │   │   └── ImageUploader.js  # Drag-drop upload
│       │   └── common/
│       │       ├── Navbar.js         # Sticky nav with notifications
│       │       ├── Footer.js
│       │       └── LoadingScreen.js
│       ├── context/
│       │   └── AuthContext.js        # Global auth state
│       ├── hooks/
│       │   └── useCountdown.js       # Live countdown timer
│       ├── pages/
│       │   ├── Home.js               # Landing with featured auctions
│       │   ├── AuctionsPage.js       # Browse + filter + paginate
│       │   ├── AuctionDetail.js      # Full detail + live bidding
│       │   ├── CreateAuction.js      # Multi-step listing form
│       │   ├── Dashboard.js          # User dashboard (tabs)
│       │   ├── ProfilePage.js        # Account settings
│       │   ├── CheckoutPage.js       # Stripe payment flow
│       │   ├── LoginPage.js          # Auth pages (login/register)
│       │   └── admin/
│       │       ├── AdminDashboard.js # Charts, stats, overview
│       │       ├── AdminUsers.js     # Ban, role management
│       │       ├── AdminAuctions.js  # Feature, cancel auctions
│       │       └── AdminTransactions.js
│       ├── services/
│       │   ├── api.js                # Axios + all API helpers
│       │   └── socket.js             # Socket.io client
│       └── styles/
│           └── globals.css           # Design system + tokens
├── nginx/
│   └── nginx.conf                    # Reverse proxy + SSL
├── docker-compose.yml
└── DEPLOYMENT.md
```

---

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 20+
- MongoDB 7+ (local or Atlas)
- npm or yarn

### 1. Clone & Install

```bash
git clone https://github.com/your-org/auction-platform.git
cd auction-platform
npm run install:all
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values:

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
MONGO_URI=mongodb://localhost:27017/auction_platform

JWT_SECRET=your-super-secret-minimum-32-chars-change-this

# Cloudinary (free tier works fine for dev)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe (use test keys for dev)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Gmail app password works)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=you@gmail.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=noreply@auctionhub.com
FROM_NAME=AuctionHub
```

### 3. Seed the Database

```bash
cd backend
npm run seed
```

This creates:
- **Admin:** `admin@auctionhub.com` / `Admin1234!`
- **Sellers:** alice, bob, carol `@example.com` / `Test1234!`
- **Buyers:** dave, eva `@example.com` / `Test1234!`
- 6 realistic auctions with bids

### 4. Start Development Servers

```bash
# From project root — starts both backend + frontend concurrently
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/api/health

---

## 🌐 API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, returns JWT |
| POST | `/api/auth/logout` | 🔒 | Logout |
| GET | `/api/auth/me` | 🔒 | Get current user |
| POST | `/api/auth/forgot-password` | — | Send reset email |
| PUT | `/api/auth/reset-password/:token` | — | Reset with token |
| GET | `/api/auth/verify-email/:token` | — | Verify email |
| PUT | `/api/auth/update-password` | 🔒 | Change password |

### Auctions
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/auctions` | — | List auctions (filterable) |
| GET | `/api/auctions/:id` | — | Get single auction + bids |
| POST | `/api/auctions` | 🔒 | Create auction |
| PUT | `/api/auctions/:id` | 🔒 | Update auction |
| DELETE | `/api/auctions/:id` | 🔒 | Cancel auction |
| POST | `/api/auctions/:id/watch` | 🔒 | Toggle watchlist |
| GET | `/api/auctions/my/listings` | 🔒 | My listings |
| GET | `/api/auctions/categories/stats` | — | Category breakdown |

**Query params for GET /auctions:**
```
page, limit, category, status, search, sort,
minPrice, maxPrice, condition, isFeatured
```

### Bids
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/bids/:auctionId` | 🔒 | Place bid |
| GET | `/api/bids/:auctionId` | — | Get auction bids |
| GET | `/api/bids/user/my` | 🔒 | My bid history |

### Payments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payments/create-intent/:id` | 🔒 | Create Stripe PaymentIntent |
| POST | `/api/payments/confirm/:id` | 🔒 | Confirm after payment |
| POST | `/api/payments/webhook` | — | Stripe webhook |
| GET | `/api/payments/transactions` | 🔒 | My transactions |

### Admin (admin role required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Stats + charts data |
| GET | `/api/admin/users` | All users (searchable) |
| PUT | `/api/admin/users/:id/ban` | Ban user |
| PUT | `/api/admin/users/:id/unban` | Unban user |
| PUT | `/api/admin/users/:id/role` | Change user role |
| GET | `/api/admin/auctions` | All auctions |
| PUT | `/api/admin/auctions/:id/feature` | Toggle featured |
| PUT | `/api/admin/auctions/:id/cancel` | Cancel auction |
| GET | `/api/admin/transactions` | All transactions |

---

## 🔌 Real-Time Events (Socket.io)

### Client → Server

```javascript
// Join an auction room to receive live bid events
socket.emit('joinAuction', auctionId);

// Leave room
socket.emit('leaveAuction', auctionId);
```

### Server → Client

```javascript
// New bid placed on an auction you're watching
socket.on('newBid', ({ auctionId, bid, newCurrentPrice, totalBids, endTime }) => {});

// You've been outbid
socket.on('outbid', ({ auctionId, auctionTitle, newAmount }) => {});

// Auction ended
socket.on('auctionEnded', ({ auctionId, winner, finalPrice }) => {});

// Auction activated (was scheduled)
socket.on('auctionStarted', ({ auctionId, title }) => {});

// Ending in < 5 minutes (sent to watchers)
socket.on('auctionEndingSoon', ({ auctionId, title }) => {});

// New bid on your listing
socket.on('newBidOnYourAuction', ({ auctionId, amount }) => {});

// Payment succeeded
socket.on('paymentSuccess', ({ auctionId }) => {});
```

---

## 🗄️ Database Schema

### User
```
_id, name, email, password (hashed), role (user|admin)
avatar { url, publicId }, phone, address, bio
isVerified, isActive, isBanned, banReason
totalSales, totalEarnings, sellerRating, totalRatings
totalPurchases, totalSpent
watchlist [→ Auction], stripeCustomerId, stripeAccountId
lastLogin, emailVerificationToken, passwordResetToken
```

### Auction
```
_id, title, description, category, subcategory, condition
images [{ url, publicId, isPrimary }]
startingPrice, reservePrice, buyNowPrice, currentPrice
minimumBidIncrement, startTime, endTime
status (draft|scheduled|active|ended|sold|cancelled|relisted)
seller → User, winner → User, winningBid → Bid
totalBids, watchCount, viewCount
shipping { isFree, cost, methods, handlingTime, location, international }
paymentStatus, paymentIntentId
isFeatured, isApproved, adminNotes, reports []
autoExtend { enabled, minutes }, tags []
```

### Bid
```
_id, auction → Auction, bidder → User
amount, maxAutoBid (proxy bidding), isAutoBid
isWinning, isOutbid, status (active|outbid|won|cancelled)
ipAddress
```

### Transaction
```
_id, auction, buyer, seller, winningBid
amount, platformFee, sellerPayout, shippingCost, totalCharged
currency, stripePaymentIntentId, stripeChargeId, stripeTransferId
status (pending|processing|completed|failed|refunded|disputed)
shippingAddress { name, street, city, state, zipCode, country }
paidAt, refundedAt, refundReason
```

---

## 🐳 Production Deployment (Docker)

### 1. Server requirements
- Ubuntu 22.04 LTS (recommended)
- 2+ CPU cores, 4GB+ RAM
- 40GB+ SSD
- Docker 24+ and Docker Compose 2.20+

### 2. Configure production environment

```bash
cp .env.example .env.production
```

```env
# .env.production
NODE_ENV=production
PORT=5000
CLIENT_URL=https://yourdomain.com

MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=a-very-strong-password-here
MONGO_URI=mongodb://admin:password@mongo:27017/auction_platform?authSource=admin

REDIS_PASSWORD=another-strong-password

JWT_SECRET=a-minimum-64-character-random-secret-string-here

CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_EMAIL=apikey
SMTP_PASSWORD=SG.your_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com

API_URL=https://yourdomain.com
```

### 3. SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Certificates will be at:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem

mkdir -p ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/
sudo chown $USER:$USER ssl/*
```

Update `nginx/nginx.conf` — replace `yourdomain.com` with your actual domain.

### 4. Build and launch

```bash
# Load production env
export $(cat .env.production | xargs)

# Build and start all containers
docker-compose up -d --build

# Verify all containers running
docker-compose ps

# View logs
docker-compose logs -f backend

# Seed production data (one-time)
docker-compose exec backend node utils/seeder.js
```

### 5. Stripe Webhook Setup

In your Stripe Dashboard → Webhooks → Add endpoint:
- **URL:** `https://yourdomain.com/api/payments/webhook`
- **Events:** `payment_intent.succeeded`, `payment_intent.payment_failed`
- Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 6. Cloudinary Setup

1. Create free account at cloudinary.com
2. Go to Settings → API Keys
3. Copy Cloud Name, API Key, API Secret to `.env`

### 7. Ongoing Operations

```bash
# Update application
git pull
docker-compose up -d --build backend frontend

# Backup MongoDB
docker-compose exec mongo mongodump --out /data/backup --username admin --password yourpassword
docker cp auction_mongo:/data/backup ./backups/$(date +%Y%m%d)

# Renew SSL certificate
certbot renew --pre-hook "docker-compose stop frontend" --post-hook "docker-compose start frontend"

# Scale backend horizontally (add --scale to compose)
docker-compose up -d --scale backend=3
# (requires Redis for session sharing and a load balancer)

# Monitor logs
docker-compose logs --tail=100 -f
```

---

## ☁️ Cloud Deployment Options

### Option A: Render.com (Easiest)

1. Push to GitHub
2. Create a **Web Service** for the backend (Node.js)
3. Create a **Static Site** for the frontend (build: `npm run build`, publish: `build/`)
4. Use **Render's MongoDB** add-on or Atlas
5. Set environment variables in Render dashboard

### Option B: Railway

```bash
npm install -g @railway/cli
railway login
railway init
railway add mongodb redis
railway deploy
```

### Option C: AWS (Production-Grade)

```
Route 53 → CloudFront → ALB → ECS Fargate (backend)
                      ↓
                   S3 (frontend static)
MongoDB Atlas (M10+ cluster)
ElastiCache Redis
SES (email)
```

```bash
# Using AWS CDK or Terraform for IaC
# See /infrastructure folder (coming soon)
```

---

## 🔒 Security Checklist

- [x] Helmet.js — HTTP security headers
- [x] express-rate-limit — per-IP rate limiting (200 req/15min, 20 auth req/15min)
- [x] express-mongo-sanitize — NoSQL injection prevention
- [x] bcryptjs (cost factor 12) — password hashing
- [x] JWT with 30-day expiry, stored in HttpOnly cookies
- [x] CORS restricted to CLIENT_URL
- [x] File upload validation (type + size)
- [x] Stripe webhook signature verification
- [x] Admin routes protected by role middleware
- [x] Request body size limits (10MB JSON, 5MB file)
- [ ] Enable 2FA (TOTP) — add speakeasy package
- [ ] Add CAPTCHA on auth endpoints — add hcaptcha
- [ ] IP-based bidding anomaly detection

---

## ⚡ Performance Optimizations

### MongoDB Indexes (already applied)
```javascript
// Auction model
{ status: 1, endTime: 1 }      // Scheduler queries
{ seller: 1, status: 1 }       // Seller listings
{ category: 1, status: 1 }     // Category browsing
{ isFeatured: 1, status: 1 }   // Featured auctions
{ title: 'text', description: 'text', tags: 'text' }  // Full-text search

// Bid model  
{ auction: 1, amount: -1 }     // Top bids per auction
{ bidder: 1, createdAt: -1 }   // User bid history
```

### Frontend Optimizations
- Code-splitting with `React.lazy()` on all pages
- Image optimization via Cloudinary auto-format + quality
- Debounced search inputs
- Pagination (12 items per page)
- Sticky BidPanel with position:sticky (no re-renders)

### Scalability Notes
- Socket.io uses rooms (not broadcast to all) — scales well
- Scheduler uses MongoDB polling; upgrade to Bull+Redis queues for scale
- For 10K+ concurrent users: add Redis adapter for Socket.io clustering
  ```bash
  npm install @socket.io/redis-adapter
  ```

---

## 🧪 Test Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@auctionhub.com | Admin1234! |
| Seller | alice@example.com | Test1234! |
| Seller | bob@example.com | Test1234! |
| Seller | carol@example.com | Test1234! |
| Buyer | dave@example.com | Test1234! |
| Buyer | eva@example.com | Test1234! |

### Test Stripe Cards
| Card | Description |
|------|-------------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Card declined |
| 4000 0025 0000 3155 | 3D Secure |

---

## 📦 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 | UI framework |
| Routing | React Router v6 | Client-side routing |
| Styling | CSS Variables + custom | Design system |
| Real-time | Socket.io Client | Live bid updates |
| HTTP Client | Axios | API requests |
| Charts | Recharts | Admin analytics |
| Payments | Stripe.js + Elements | PCI-compliant checkout |
| Animation | CSS animations | Micro-interactions |
| Backend | Node.js + Express | REST API |
| Real-time | Socket.io | WebSocket server |
| Database | MongoDB + Mongoose | Primary data store |
| Auth | JWT + bcryptjs | Authentication |
| Images | Cloudinary + Multer | Upload + CDN |
| Email | Nodemailer | Transactional email |
| Payments | Stripe | Payment processing |
| Logging | Winston | Structured logs |
| Scheduling | setInterval (→ Bull) | Auction lifecycle |
| Reverse proxy | Nginx | SSL, load balance |
| Containers | Docker + Compose | Deployment |

---

## 🛣️ Roadmap

- [ ] Proxy bidding (auto-bid up to max)
- [ ] Seller ratings & reviews
- [ ] Two-factor authentication
- [ ] Email notification preferences
- [ ] Mobile app (React Native)
- [ ] Elasticsearch for advanced search
- [ ] Bull queues for background jobs
- [ ] Seller payouts via Stripe Connect
- [ ] Dispute resolution system
- [ ] Live auction (video stream + real-time chat)
- [ ] NFT/digital asset support

---

## 📄 License

MIT License — free for personal and commercial use.

---

*Built with ❤️ — AuctionHub*
