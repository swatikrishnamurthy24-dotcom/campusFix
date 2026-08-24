# CampusFix Phase 7 - Quick Start Guide

Get the backend and frontend running in 10 minutes.

## Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

---

## Step 1: Setup Backend (5 minutes)

### 1.1 Install Dependencies
```bash
cd backend
npm install
```

### 1.2 Create Environment File
```bash
cp .env.example .env
```

### 1.3 Update `.env` File
Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/campusfix
JWT_SECRET=your_super_secret_key_min_32_chars_change_in_prod
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
API_VERSION=v1
```

### 1.4 Start MongoDB
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 1.5 Start Backend
```bash
npm run dev
```

You should see:
```
🚀 CampusFix Backend Server
📍 Running on http://localhost:5000
📡 API Prefix: /api/v1
```

---

## Step 2: Seed Database (1 minute)

In a new terminal:
```bash
cd backend
npm run seed
```

You'll get development accounts:
```
Admin: admin@campusfix.local / password123
Staff 1: john.smith@campusfix.local / password123
Student: swati@campusfix.local / password123
```

---

## Step 3: Setup Frontend (2 minutes)

### 3.1 Create Environment File
```bash
cd frontend
cp .env.example .env
```

### 3.2 Install Dependencies (if needed)
```bash
npm install
```

### 3.3 Start Frontend
```bash
npm run dev
```

You should see:
```
Local:   http://localhost:5173/
```

---

## Step 4: Test the Integration (2 minutes)

### 4.1 Open Browser
Go to http://localhost:5173

### 4.2 Login with Test Credentials
```
Email: admin@campusfix.local
Password: password123
```

### 4.3 Test Features
- ✅ Login with backend auth
- ✅ Create an issue (students)
- ✅ View issues from database
- ✅ Vote on issues
- ✅ Add comments
- ✅ View notifications

---

## Testing API Directly

### Using cURL

#### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@campusfix.local","password":"password123"}'
```

Response:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Get Issues (with token)
```bash
TOKEN="your_token_here"
curl -X GET http://localhost:5000/api/v1/issues \
  -H "Authorization: Bearer $TOKEN"
```

#### Create Issue
```bash
TOKEN="your_token_here"
curl -X POST http://localhost:5000/api/v1/issues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title":"Broken tap",
    "description":"Water tap in lab is leaking",
    "category":"Plumbing",
    "building":"Academic Block",
    "priority":"High"
  }'
```

---

## Project Structure After Phase 7

```
campusfix/
├── backend/                      (NEW)
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── server.js
│   ├── .env                      (Create from .env.example)
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── frontend/                     (EXISTING)
│   ├── src/
│   │   ├── services/
│   │   │   ├── api.js            (NEW - API client)
│   │   │   ├── authService.js    (NEW - Auth service)
│   │   │   ├── issueService.js   (NEW - Issue service)
│   │   │   └── [other services]
│   │   ├── pages/
│   │   ├── components/
│   │   └── [other existing files]
│   ├── .env                      (Create from .env.example)
│   ├── .env.example
│   └── package.json
│
├── PHASE_7_IMPLEMENTATION.md     (Full documentation)
├── QUICKSTART.md                 (This file)
└── README.md
```

---

## Troubleshooting

### Backend won't start
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Start MongoDB
```bash
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
net start MongoDB                      # Windows
```

### CORS error in frontend
```
Error: Access to XMLHttpRequest blocked by CORS policy
```
**Solution:** Check `.env` files match:
- Backend: `CLIENT_URL=http://localhost:5173`
- Frontend: `VITE_API_URL=http://localhost:5000/api/v1`

### API returns 401 (Unauthorized)
**Solution:** Make sure to login first and token is in localStorage

### Port 5000 already in use
**Solution:** Change `PORT` in `backend/.env` or kill process using that port

---

## What Was Preserved from Phase 6

✅ All Student Portal UI
✅ All Staff Portal UI
✅ All Admin Portal UI
✅ All existing routes
✅ All existing components
✅ Tailwind styling
✅ shadcn/ui components
✅ React Router navigation

## What Changed in Phase 7

✅ Authentication: mock → backend JWT
✅ Issue storage: mock state → MongoDB
✅ Vote tracking: simple counters → Vote model (no duplicates)
✅ Comments: mock array → database
✅ Notifications: mock → database
✅ User management: mock → backend

---

## Next Steps

### Before Production
1. Change `JWT_SECRET` in `.env`
2. Update `MONGODB_URI` to MongoDB Atlas
3. Update `CLIENT_URL` to production domain
4. Set `NODE_ENV=production`
5. Enable SSL/HTTPS
6. Configure backup strategy

### Phase 8 Features
- Email notifications
- Real-time updates (WebSocket)
- File uploads for issues
- Advanced search/filtering
- Analytics dashboard

---

## Documentation

Full details in:
- **Backend:** `backend/README.md`
- **Phase 7 Report:** `PHASE_7_IMPLEMENTATION.md`

---

## Support

For issues:
1. Check backend console for errors
2. Check browser console for frontend errors
3. Verify `.env` files are correct
4. Check MongoDB is running
5. Review API responses in Network tab (DevTools)

---

**Ready to go!** 🚀

Start with Step 1 above and you'll have CampusFix fully functional in ~10 minutes.
