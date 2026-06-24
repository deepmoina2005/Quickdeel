# QuickDeal - Marketplace Platform

## 📋 Project Overview

**QuickDeal** is a full-stack marketplace application that enables users to buy and sell products locally. It provides a seamless experience for connecting buyers and sellers with features like real-time messaging, product listings, user reviews, and administrative controls.

### Project Type
- **Multi-Tier Architecture**: Client-Server with Admin Dashboard
- **Deployment Model**: Monorepo containing three main applications
- **Database**: MySQL with Prisma ORM

---

## 🏗️ Project Structure

```
QuickDeal/
├── admin/                    # Admin Dashboard (React + Vite)
├── server/                   # Backend API (Node.js + Express)
├── user/                     # User Application (React + Vite)
└── README.md
```

### Three Main Applications

#### 1. **Server** (Backend API)
Core REST API and real-time communication backend.

**Technology Stack:**
- Runtime: Node.js (ES Modules)
- Framework: Express.js 4.21
- Database: MySQL with Prisma ORM 5.22
- Authentication: JWT + bcryptjs
- Real-time: Socket.io 4.8
- Validation: Zod 3.24
- File Upload: Multer
- Security: Helmet, CORS
- Dev Tools: Nodemon

**Key Features:**
- User authentication and authorization
- RESTful API endpoints
- Real-time messaging via WebSocket
- File upload handling (avatars, categories, listings)
- Input validation and error handling
- Database migrations

#### 2. **Admin** (Admin Dashboard)
Administrative interface for platform management.

**Technology Stack:**
- Frontend Framework: React 18.3
- Build Tool: Vite 5.4
- Styling: Tailwind CSS 3.4, PostCSS
- Form Management: React Hook Form 7.53 + Zod Resolver
- HTTP Client: Axios 1.7
- Routing: React Router 6.28
- UI Components: Lucide React, Custom
- Charts: Recharts 2.13
- Notifications: React Hot Toast

**Key Features:**
- Dashboard with analytics
- User management
- Listing management & approval
- Report handling
- Category management
- Settings management

#### 3. **User** (User Application)
Main user-facing marketplace application.

**Technology Stack:**
- Frontend Framework: React 18.3
- Build Tool: Vite 5.4
- Styling: Tailwind CSS 3.4
- Form Management: React Hook Form 7.57 + Zod
- HTTP Client: Axios 1.12
- Routing: React Router 6.30
- UI Icons: Lucide React

**Key Features:**
- Browse and search listings
- Create and manage product listings
- Real-time messaging with sellers
- Make and receive offers
- Leave reviews for sellers
- Manage favorites
- Follow sellers

---

## 📊 Database Schema

### Core Models

#### **User**
Central user model with role-based access control.

```prisma
- id, name, email, password
- phone, avatar, about, contactEmail
- role (USER, ADMIN)
- isVerifiedSeller, isEliteSeller
- refreshToken, resetToken management
- Relations: listings, favorites, messages, chats, reviews, reports, notifications
```

#### **Listing**
Product listings for marketplace.

```prisma
- id, title, description, price
- condition (NEW, LIKE_NEW, GOOD, FAIR, POOR)
- status (PENDING, APPROVED, REJECTED, SOLD)
- location, country, state, city
- userId, categoryId
- Relations: images, favorites, reports, conversations, category, user
```

#### **Category**
Product categories.

```prisma
- id, name, image
- Relations: listings
```

#### **Conversation**
Chat conversations between buyers and sellers.

```prisma
- id, buyerId, sellerId, listingId
- Relations: messages, offers, buyer, seller, listing, hiddenFor
```

#### **Message**
Individual messages in conversations.

```prisma
- id, conversationId, senderId, message, type
- Support for text, images, and location sharing
- Relations: conversation, sender
```

#### **Offer**
Negotiation offers between parties.

```prisma
- id, conversationId, senderId, amount
- status tracking
- Relations: conversation, sender
```

#### **Review**
Seller reviews and ratings.

```prisma
- id, reviewerId, sellerId, rating, comment
- Relations: reviewer, seller
- Unique constraint: one review per reviewer-seller pair
```

#### **Favorite**
User's favorite listings.

```prisma
- id, userId, listingId
- Unique constraint: one favorite per user-listing pair
```

#### **Report**
User/Listing reports for moderation.

```prisma
- id, userId, listingId, reportedUserId, reason
- status (OPEN, REVIEWED, DISMISSED)
- Relations: user, listing, reportedUser
```

#### **Notification**
User notifications.

```prisma
- id, userId, title, message, isRead
```

#### **Follow**
Seller following system.

```prisma
- id, followerId, followingId
- Relations: follower, following
- Unique constraint: one follow per follower-following pair
```

---

## 🔌 API Endpoints Structure

### **Authentication** (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /refresh-token` - Refresh JWT token
- `POST /logout` - User logout
- `POST /forgot-password` - Initiate password reset
- `POST /reset-password` - Complete password reset

### **Users** (`/api/users`)
- `GET /` - Get all users (admin)
- `GET /:id` - Get user details
- `PUT /:id` - Update user profile
- `DELETE /:id` - Delete user account
- `POST /:id/follow` - Follow a seller
- `DELETE /:id/follow` - Unfollow a seller
- `GET /:id/followers` - Get user's followers
- `GET /:id/following` - Get user's following list

### **Categories** (`/api/categories`)
- `GET /` - Get all categories
- `POST /` - Create category (admin)
- `PUT /:id` - Update category (admin)
- `DELETE /:id` - Delete category (admin)

### **Listings** (`/api/listings`)
- `GET /` - Get all listings with filters
- `POST /` - Create new listing
- `GET /:id` - Get listing details
- `PUT /:id` - Update listing
- `DELETE /:id` - Delete listing
- `GET /:id/images` - Get listing images
- `POST /:id/favorite` - Add to favorites
- `DELETE /:id/favorite` - Remove from favorites

### **Marketplace** (`/api/marketplace`)
- `GET /search` - Search listings
- `GET /trending` - Get trending listings
- `GET /categories/:categoryId` - Get listings by category
- `GET /location/:location` - Get listings by location
- `GET /filter` - Advanced filtering

### **Chat** (`/api/chat`)
- `GET /conversations` - Get user's conversations
- `POST /conversations` - Start new conversation
- `GET /conversations/:id` - Get conversation details
- `GET /conversations/:id/messages` - Get messages
- `POST /conversations/:id/messages` - Send message
- `DELETE /conversations/:id` - Hide conversation

### **Reviews** (`/api/reviews`)
- `GET /seller/:sellerId` - Get seller reviews
- `POST /` - Create review
- `GET /:id` - Get review details
- `PUT /:id` - Update review
- `DELETE /:id` - Delete review

### **Reports** (`/api/reports`)
- `POST /` - Create report
- `GET /` - Get reports (admin)
- `PUT /:id` - Update report status (admin)
- `DELETE /:id` - Delete report

### **Notifications** (`/api/notifications`)
- `GET /` - Get user notifications
- `PUT /:id/read` - Mark as read
- `DELETE /:id` - Delete notification

### **Uploads** (`/api/uploads`)
- `POST /avatar` - Upload user avatar
- `POST /category` - Upload category image
- `POST /listing` - Upload listing images

### **Admin** (`/api/admin`)
- `GET /dashboard` - Dashboard statistics
- `GET /users` - Get all users
- `GET /listings` - Get all listings
- `PUT /listings/:id/approve` - Approve listing
- `PUT /listings/:id/reject` - Reject listing
- `GET /reports` - Get all reports
- `PUT /reports/:id` - Update report status

---

## ⚙️ Middleware & Utilities

### **Middleware**
- `auth.middleware.js` - JWT token verification
- `error.middleware.js` - Global error handling
- `upload.middleware.js` - File upload handling
- `validate.middleware.js` - Request validation

### **Utilities**
- `asyncHandler.js` - Async route wrapper
- `apiError.js` - Custom error class
- `pagination.js` - Pagination helper
- `storage.js` - LocalStorage utilities
- `theme.js` - Theme management (frontend)

### **Validations** (Zod schemas)
- `auth.validation.js` - Auth request validation
- `user.validation.js` - User data validation
- `listing.validation.js` - Listing validation
- `category.validation.js` - Category validation
- `review.validation.js` - Review validation
- `report.validation.js` - Report validation
- `chat.validation.js` - Chat validation
- `common.validation.js` - Shared validators

---

## 🚀 Setup & Installation

### Prerequisites
- **Node.js** 16.x or higher
- **npm** or **yarn** package manager
- **MySQL** 8.0 or higher
- **Git** version control

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd QuickDeal
```

### Step 2: Server Setup

```bash
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your configuration:
# DATABASE_URL=mysql://user:password@localhost:3306/quickdeal
# JWT_SECRET=your_secret_key
# JWT_EXPIRE=7d
# PORT=5000

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (optional)
npm run db:seed

# Start development server
npm run dev
```

### Step 3: Admin Setup

```bash
cd ../admin

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your API URL:
# VITE_API_URL=http://localhost:5000/api

# Start development server
npm run dev
```

### Step 4: User App Setup

```bash
cd ../user

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your API URL:
# VITE_API_URL=http://localhost:5000/api

# Start development server
npm run dev
```

---

## 📦 Running the Project

### Development Mode

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Admin Dashboard:**
```bash
cd admin
npm run dev
# Admin runs on http://localhost:5173
```

**Terminal 3 - User App:**
```bash
cd user
npm run dev
# User app runs on http://localhost:5174
```

### Production Build

**Build all applications:**
```bash
# Server (no build needed, runs directly)

# Admin
cd admin
npm run build
# Output: dist/

# User
cd user
npm run build
# Output: dist/
```

### Database Management

```bash
# View database in Prisma Studio
npm run prisma:studio

# Create new migration
npm run prisma:migrate

# Deploy migrations
npm run prisma:deploy

# Reset database
npx prisma migrate reset
```

---

## 🔐 Authentication & Security

### Authentication Flow
1. User registers with email and password
2. Password hashed with bcryptjs (salt rounds: 10)
3. JWT token generated for session
4. Refresh token for extended sessions
5. Token verified in protected routes

### Security Features
- **Helmet.js** - HTTP headers security
- **CORS** - Cross-origin resource sharing
- **Password Hashing** - bcryptjs with salting
- **JWT** - Token-based authentication
- **Input Validation** - Zod schema validation
- **Error Handling** - Centralized error middleware

### Protected Routes
- User profile operations
- Listing creation/updates
- Message sending
- Review submissions

---

## 🎨 Frontend Architecture

### Admin Dashboard Structure
```
admin/src/
├── components/
│   ├── common/       - Reusable components
│   ├── dashboard/    - Dashboard widgets
│   ├── forms/        - Form components
│   ├── layout/       - Layout components
│   ├── modals/       - Modal dialogs
│   └── tables/       - Data tables
├── pages/
│   ├── auth/         - Login pages
│   ├── dashboard/    - Dashboard pages
│   ├── users/        - User management
│   ├── listings/     - Listing management
│   ├── categories/   - Category management
│   ├── reports/      - Report handling
│   └── settings/     - Settings pages
├── context/
│   └── AuthContext.jsx - Auth state
├── hooks/
│   └── useAdminData.js - Data fetching
├── routes/
│   ├── AppRoutes.jsx
│   └── ProtectedRoute.jsx
├── services/
│   ├── admin.service.js
│   └── api.js
└── validations/
    ├── auth.schema.js
    └── forms.schema.js
```

### User App Structure
```
user/src/
├── components/    - Reusable components
├── pages/         - Page components
├── routes/        - Routing setup
├── context/       - State management
├── hooks/         - Custom hooks
├── services/      - API services
├── utils/         - Utility functions
└── validations/   - Form validation schemas
```

---

## 📱 Key Features

### Buyer Features
✅ Browse marketplace listings
✅ Search and filter products
✅ View product details with images
✅ Add items to favorites
✅ Real-time messaging with sellers
✅ Make offers on products
✅ Leave reviews for sellers
✅ Follow favorite sellers
✅ Manage profile and addresses
✅ View notifications
✅ Report listings/users

### Seller Features
✅ Create and manage listings
✅ Upload product images
✅ Set pricing and conditions
✅ Real-time chat with buyers
✅ Receive and respond to offers
✅ Track sales and ratings
✅ Manage seller profile
✅ View reviews and ratings
✅ Mark items as sold

### Admin Features
✅ Dashboard with analytics
✅ User management (create, edit, delete)
✅ Listing approval workflow
✅ Category management
✅ Handle user reports
✅ System settings
✅ Seller verification
✅ Platform statistics

---

## 🗄️ Database Models Relationships

```
User ←→ Listing (One-to-Many)
User ←→ Favorite (One-to-Many)
User ←→ Conversation (Buyer/Seller)
User ←→ Message (Sender)
User ←→ Review (Reviewer/Seller)
User ←→ Report (Reporter/Reported)
User ←→ Follow (Follower/Following)
User ←→ Notification (One-to-Many)

Category ←→ Listing (One-to-Many)

Listing ←→ ListingImage (One-to-Many)
Listing ←→ Favorite (One-to-Many)
Listing ←→ Conversation (One-to-Many)
Listing ←→ Report (One-to-Many)

Conversation ←→ Message (One-to-Many)
Conversation ←→ Offer (One-to-Many)
Conversation ←→ ConversationHidden (One-to-Many)
```

---

## 📋 Enums

### Role
- `USER` - Regular user
- `ADMIN` - Administrator

### ListingCondition
- `NEW` - Brand new
- `LIKE_NEW` - Barely used
- `GOOD` - Well maintained
- `FAIR` - Some wear
- `POOR` - Heavy wear/damage

### ListingStatus
- `PENDING` - Awaiting approval
- `APPROVED` - Live on marketplace
- `REJECTED` - Admin rejected
- `SOLD` - Item sold

### ReportStatus
- `OPEN` - New report
- `REVIEWED` - Under review
- `DISMISSED` - Report closed

---

## 🧪 Validation & Error Handling

### Validation Layer
- Request validation using Zod schemas
- Server-side validation for all inputs
- Custom validation middleware
- Type-safe validation on both client and server

### Error Handling
- Centralized error middleware
- Custom API error class
- HTTP status codes
- Error messages and codes
- Stack traces (development only)

---

## 📈 Performance Considerations

### Database Optimization
- Indexed frequently queried fields
- Efficient relationship management
- Pagination for large datasets
- Query optimization with Prisma

### Frontend Optimization
- Code splitting with Vite
- Component lazy loading
- Image optimization
- Caching strategies

### Backend Optimization
- Static file serving
- Compression with Helmet
- Rate limiting ready
- Connection pooling

---

## 🔄 Real-time Features

### Socket.io Integration
- Live messaging
- Conversation updates
- Typing indicators
- Online status
- Notification delivery

---

## 📚 API Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

---

## 🛠️ Development Tools

### Available Scripts

**Server:**
```bash
npm run dev              # Start development server
npm start               # Start production server
npm run prisma:generate # Generate Prisma client
npm run prisma:migrate  # Create and run migrations
npm run prisma:deploy   # Deploy migrations to production
npm run prisma:studio   # Open Prisma Studio
npm run db:seed         # Seed database with initial data
```

**Admin/User:**
```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## 📝 Configuration Files

### Server Config
- `src/config/env.js` - Environment variables
- `src/config/mysql.js` - MySQL connection
- `src/config/prisma.js` - Prisma configuration
- `.env` - Environment variables file

### Frontend Config
- `vite.config.js` - Vite configuration
- `tailwind.config.js` - Tailwind CSS config
- `postcss.config.js` - PostCSS config
- `.env` - Environment variables

---

## 🚢 Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Database seeded (if needed)
- [ ] Frontend builds successfully
- [ ] Admin dashboard builds successfully
- [ ] API health check passing
- [ ] Error logging configured
- [ ] CORS properly configured
- [ ] Uploaded file paths set correctly
- [ ] JWT secrets configured
- [ ] Database backups configured

---

## 📞 Support & Troubleshooting

### Common Issues

**Database Connection Error**
- Verify DATABASE_URL in .env
- Check MySQL service is running
- Ensure database exists

**Port Already in Use**
- Change PORT in .env
- Kill process using the port: `lsof -i :5000`

**Module Not Found**
- Run `npm install` again
- Clear node_modules and reinstall

**Prisma Client Issues**
- Run `npm run prisma:generate`
- Restart development server

---

## 📄 License

This project is proprietary and confidential.

---

## 👨‍💼 Project Team

- **Developer**: Manish
- **Date Created**: 2024
- **Version**: 1.0.0
- **Status**: Active Development

---

## 📞 Contact & Support

For issues or questions regarding this project, please contact the development team.

---

## 🎯 Future Enhancements

- [ ] Payment integration (Stripe/PayPal)
- [ ] Advanced search with AI recommendations
- [ ] Mobile app (React Native/Flutter)
- [ ] Video messaging
- [ ] Escrow service
- [ ] Seller subscription plans
- [ ] Advanced analytics dashboard
- [ ] Dispute resolution system
- [ ] Verification system for users
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Push notifications
- [ ] Two-factor authentication
- [ ] Social media integration
- [ ] Multi-language support

---

**Last Updated**: June 2024
**Version**: 1.0.0
**Status**: Production Ready
#   Q u i c k d e e l  
 #   Q u i c k d e e l  
 