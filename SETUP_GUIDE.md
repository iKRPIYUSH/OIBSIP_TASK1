# Quick Setup Guide

## Step-by-Step Setup Instructions

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env file with your MongoDB connection string
# For local MongoDB:
MONGO_URI=mongodb://localhost:27017/analytics_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000

# Seed the database (creates 120+ events)
npm run seed

# Start the backend server
npm run dev
```

**Expected Output:**
```
Connecting to MongoDB...
✅ Connected to MongoDB
✅ Server running on http://localhost:5000
📊 Analytics API: http://localhost:5000/api/analytics
```

### 2. Frontend Setup (New Terminal)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the frontend development server
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 3. Access the Application

1. Open your browser and go to `http://localhost:3000`
2. You'll see a login screen with two users:
   - **User A (Organization A)** - ORG_A
   - **User B (Organization B)** - ORG_B
3. Click on either user to login
4. View the analytics dashboard with 7-day activity trend

### 4. Test Multi-Tenant Isolation

1. Login as **User A** → See ORG_A data
2. Logout
3. Login as **User B** → See ORG_B data (different!)
4. Try changing filters → Data updates without page reload

## Troubleshooting

### MongoDB Not Running

**Error:** `MongooseError: connect ECONNREFUSED`

**Solution:**
- Start MongoDB: `mongod` (or start MongoDB service)
- Or use MongoDB Atlas and update `MONGO_URI` in `.env`

### Port Already in Use

**Error:** `EADDRINUSE: address already in use`

**Solution:**
- Change `PORT` in backend `.env` file
- Update frontend `vite.config.js` proxy target if needed

### CORS Errors

**Error:** `CORS policy: No 'Access-Control-Origin' header`

**Solution:**
- Ensure backend is running
- Check that frontend proxy is configured correctly in `vite.config.js`

### No Data Showing

**Solution:**
- Run seed script: `cd backend && npm run seed`
- Check browser console for errors
- Verify JWT token is being sent in requests

## Verification Checklist

- [ ] MongoDB is running
- [ ] Backend server starts without errors
- [ ] Frontend server starts without errors
- [ ] Database seeded successfully
- [ ] Can login as User A
- [ ] Can login as User B
- [ ] Charts display data
- [ ] Filters work correctly
- [ ] Different users see different data

## Next Steps

Once everything is running:

1. Explore the codebase structure
2. Read the main `README.md` for architecture details
3. Test security by trying to manipulate requests (you'll see it's secure!)
4. Customize event types, styling, or add features

---

**Need Help?** Check the main `README.md` for detailed documentation.
