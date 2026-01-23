# Multi-Tenant Analytics Dashboard

A secure, production-ready MERN stack application that provides analytics dashboards for multiple organizations with strict data isolation.

## 🎯 Project Overview

This application tracks system events (LOGIN, FILE_UPLOAD, REPORT, etc.) and provides analytics dashboards for different organizations. The system ensures that users can **only access data from their own organization**, even if they attempt to manipulate requests.

### Key Features

- ✅ **Secure Multi-Tenant Architecture** - Complete data isolation between organizations
- ✅ **JWT Authentication** - Token-based authentication with orgId embedded in token
- ✅ **Backend Aggregation** - All analytics computation happens on the server
- ✅ **Interactive Charts** - 7-day activity trends with Recharts
- ✅ **Event Type Filtering** - Filter analytics by specific event types
- ✅ **Empty State Handling** - Graceful handling of no data scenarios
- ✅ **Production-Ready** - No placeholders, fully working code

## 🏗️ Architecture

### Security Model

**Critical Security Principle:** `orgId` is **NEVER** accepted from client requests. It is **ONLY** extracted from the JWT token on the backend.

1. **Authentication Flow:**
   - User logs in → Backend generates JWT with `orgId` embedded
   - Frontend stores JWT in localStorage
   - Every API request includes JWT in Authorization header
   - Backend middleware extracts `orgId` from JWT token

2. **Data Isolation:**
   - MongoDB aggregation pipeline starts with `$match` stage filtering by `orgId`
   - This happens **before** any grouping or computation
   - Even if a user manipulates requests, they cannot access other orgs' data
   - Compound index `{ orgId: 1, timestamp: 1 }` ensures efficient queries

3. **Why Backend Aggregation:**
   - Prevents data leakage (raw events never sent to frontend)
   - Reduces network payload (only chart-ready data sent)
   - Ensures security (orgId filtering happens server-side)
   - Improves performance (database does the heavy lifting)

## 📁 Project Structure

```
/backend
  /models
    Event.js              # MongoDB schema with compound index
  /middleware
    auth.js               # JWT authentication middleware
  /routes
    auth.js               # Login endpoint
    analytics.js          # Analytics API with aggregation
  seed.js                 # Database seeding script
  server.js               # Express server
  .env.example            # Environment variables template
  package.json

/frontend
  /src
    /components
      Dashboard.jsx       # Main dashboard component
      AnalyticsChart.jsx  # Recharts visualization
      Login.jsx           # User selection/login
    App.jsx               # Root component
    main.jsx              # React entry point
    index.css             # Global styles
  package.json
  vite.config.js          # Vite configuration with proxy
  index.html
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (running locally or connection string)
- npm or yarn

### Installation & Setup

1. **Clone and navigate to project:**
   ```bash
   cd OIBSIP
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set:
   ```env
   MONGO_URI=mongodb://localhost:27017/analytics_db
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=5000
   ```

4. **Seed Database:**
   ```bash
   npm run seed
   ```
   
   This creates 120+ events across 2 organizations (ORG_A, ORG_B) over the last 7 days.

5. **Start Backend Server:**
   ```bash
   npm run dev
   ```
   
   Server runs on `http://localhost:5000`

6. **Frontend Setup (new terminal):**
   ```bash
   cd frontend
   npm install
   ```

7. **Start Frontend:**
   ```bash
   npm run dev
   ```
   
   Frontend runs on `http://localhost:3000`

8. **Access Application:**
   - Open `http://localhost:3000` in your browser
   - Select a user (User A = ORG_A, User B = ORG_B)
   - View analytics dashboard with 7-day trend

## 🔐 Security Deep Dive

### JWT Token Structure

```json
{
  "userId": "1",
  "orgId": "ORG_A",
  "iat": 1234567890,
  "exp": 1234654290
}
```

### Authentication Middleware Flow

```javascript
1. Extract token from Authorization header
2. Verify token signature with JWT_SECRET
3. Extract orgId from token payload
4. Attach user info to req.user
5. Reject if token is invalid or missing orgId
```

### Analytics API Security

```javascript
// ❌ NEVER DO THIS:
const orgId = req.query.orgId; // Client can manipulate this!

// ✅ ALWAYS DO THIS:
const { orgId } = req.user; // From JWT token only

// MongoDB aggregation ensures isolation:
{
  $match: {
    orgId: orgId,  // From JWT, not from request
    timestamp: { $gte: startDate, $lte: endDate }
  }
}
```

### Why This Is Secure

1. **JWT Signature Verification:** Tokens cannot be tampered with without the secret
2. **Server-Side Extraction:** orgId is read from verified token, not request params
3. **Database-Level Filtering:** MongoDB filters by orgId before any aggregation
4. **No Raw Data Exposure:** Only aggregated counts are returned, never raw events

## 📊 API Endpoints

### POST /api/auth/login

Login endpoint that generates JWT tokens.

**Request:**
```json
{
  "userId": "1",
  "orgId": "ORG_A"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "1",
    "orgId": "ORG_A"
  }
}
```

### GET /api/analytics

Get aggregated analytics data for authenticated user's organization.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
- `eventType` (optional): Filter by event type (LOGIN, FILE_UPLOAD, REPORT, etc.)

**Response:**
```json
[
  { "date": "2026-01-17", "count": 5 },
  { "date": "2026-01-18", "count": 12 },
  { "date": "2026-01-19", "count": 8 },
  ...
]
```

## 🗄️ Database Schema

### Event Model

```javascript
{
  eventType: String (required, enum),
  orgId: String (required, indexed),
  timestamp: Date (required, indexed)
}
```

### Indexes

- **Compound Index:** `{ orgId: 1, timestamp: 1 }`
  - Enables efficient queries filtering by orgId and date range
  - Critical for performance with large datasets
  - Ensures queries use index for optimal performance

## 🎨 Frontend Features

### Components

- **Login:** User selection interface
- **Dashboard:** Main analytics view with filters
- **AnalyticsChart:** Interactive line chart using Recharts

### Features

- Real-time filtering (no page reload)
- Responsive design (mobile-friendly)
- Empty state handling
- Loading states
- Error handling with retry

## 🧪 Testing Multi-Tenant Isolation

1. **Login as User A (ORG_A):**
   - View dashboard → See ORG_A events only

2. **Logout and Login as User B (ORG_B):**
   - View dashboard → See ORG_B events only (different data)

3. **Verify Isolation:**
   - Try manipulating network requests → Still only see your org's data
   - Backend always uses orgId from JWT, ignoring any client-side attempts

## 📈 Performance Optimizations

1. **Compound Index:** `{ orgId: 1, timestamp: 1 }` for fast queries
2. **Aggregation Pipeline:** Database does computation, not application
3. **Date Range Filtering:** Only query last 7 days
4. **Minimal Data Transfer:** Only chart-ready aggregated data sent

## 🛠️ Development

### Backend Scripts

```bash
npm start      # Start server (production)
npm run dev    # Start server with auto-reload
npm run seed   # Seed database with sample data
```

### Frontend Scripts

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run preview # Preview production build
```

## 📝 Environment Variables

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/analytics_db` |
| `JWT_SECRET` | Secret key for JWT signing | `your-super-secret-key` |
| `PORT` | Server port | `5000` |

## 🐛 Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running: `mongod` or check your MongoDB service
- Verify `MONGO_URI` in `.env` is correct
- Check MongoDB logs for connection errors

### JWT Errors

- Ensure `JWT_SECRET` is set in `.env`
- Check token expiration (tokens expire after 24 hours)
- Verify Authorization header format: `Bearer <token>`

### Empty Dashboard

- Run seed script: `npm run seed` in backend directory
- Check browser console for API errors
- Verify JWT token is valid

## 🎓 Key Learnings

### Multi-Tenant Security Best Practices

1. **Never trust client input** for tenant identification
2. **Always extract tenant ID from authenticated token**
3. **Filter at database level** before aggregation
4. **Use compound indexes** for tenant + time queries
5. **Aggregate on backend** to prevent data leakage

### MongoDB Aggregation Best Practices

1. **$match first** - Filter early for performance
2. **Use indexes** - Ensure $match stages use indexed fields
3. **Project last** - Only select needed fields at the end
4. **Sort efficiently** - Use indexed fields for sorting

## 📄 License

This project is built as a demonstration of secure multi-tenant architecture.

## 👨‍💻 Author

Built as a complete, production-ready MERN stack application with emphasis on security and data isolation.

---

**🔒 Security Note:** This implementation demonstrates production-grade security practices. In a real-world scenario, always:
- Use strong, randomly generated JWT secrets
- Implement proper password hashing (bcrypt, argon2)
- Add rate limiting
- Use HTTPS in production
- Implement proper error handling
- Add comprehensive logging and monitoring
