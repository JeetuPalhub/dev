# 📺 DevTube — Video Platform Backend

> A production-grade YouTube-like backend built with Node.js, Express, MongoDB, and Cloudinary — featuring JWT auth, video uploads, subscriptions, watch history, and aggregation pipelines.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)

---

## ✨ Features

- 🔐 **JWT Auth** — access + refresh token rotation via HttpOnly cookies
- 🖼️ **File uploads** — avatar & cover image via Multer → Cloudinary
- 📺 **Video model** — title, description, thumbnail, views, owner
- 📋 **Subscription model** — subscribe/unsubscribe channels
- 👁️ **Watch history** — tracked per user with MongoDB aggregation
- 🔍 **Channel profile** — subscriber count, subscription status via `$lookup`
- 🔄 **Token refresh** — silent re-auth using refresh tokens

---

## 🔌 API Endpoints

### Auth & User

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/users/register` | Public | Register with avatar upload |
| POST | `/api/v1/users/login` | Public | Login, get tokens |
| POST | `/api/v1/users/refresh-token` | Public | Refresh access token |
| POST | `/api/v1/users/logout` | 🔒 | Logout |
| GET | `/api/v1/users/current-user` | 🔒 | Get current user |
| PATCH | `/api/v1/users/update-account` | 🔒 | Update name/email |
| PATCH | `/api/v1/users/avatar` | 🔒 | Update avatar |
| POST | `/api/v1/users/change-password` | 🔒 | Change password |
| GET | `/api/v1/users/c/:username` | 🔒 | Get channel profile |
| GET | `/api/v1/users/history` | 🔒 | Get watch history |
| GET | `/api/v1/healthcheck` | Public | Health check |

### Videos — `/api/v1/videos`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Public | List videos (search, sort, paginate) |
| POST | `/` | 🔒 | Publish video (`videoFile` + `thumbnail` upload) |
| GET | `/:videoId` | Public | Get a video (increments views) |
| PATCH | `/:videoId` | 🔒 | Update title/description/thumbnail |
| DELETE | `/:videoId` | 🔒 | Delete a video |
| PATCH | `/toggle/publish/:videoId` | 🔒 | Toggle publish status |

### Subscriptions — `/api/v1/subscriptions`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/c/:channelId` | 🔒 | Toggle subscribe/unsubscribe |
| GET | `/c/:channelId` | 🔒 | List a channel's subscribers |
| GET | `/u/:subscriberId` | 🔒 | List channels a user subscribes to |

### Comments — `/api/v1/comments`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/:videoId` | Public | List comments on a video (paginated) |
| POST | `/:videoId` | 🔒 | Add a comment |
| PATCH | `/c/:commentId` | 🔒 | Edit own comment |
| DELETE | `/c/:commentId` | 🔒 | Delete own comment |

### Likes — `/api/v1/likes`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/toggle/v/:videoId` | 🔒 | Like/unlike a video |
| POST | `/toggle/c/:commentId` | 🔒 | Like/unlike a comment |
| GET | `/videos` | 🔒 | List videos you liked |

### Playlists — `/api/v1/playlists`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | 🔒 | Create a playlist |
| GET | `/user/:userId` | 🔒 | List a user's playlists |
| GET | `/:playlistId` | 🔒 | Get a playlist with videos |
| PATCH | `/add/:videoId/:playlistId` | 🔒 | Add a video |
| PATCH | `/remove/:videoId/:playlistId` | 🔒 | Remove a video |
| DELETE | `/:playlistId` | 🔒 | Delete a playlist |

---

## 🗂️ Project Structure

```
Devtube/
├── src/
│   ├── app.js                    # Express setup + routes
│   ├── index.js                  # DB connect + server start
│   ├── constants.js
│   ├── controllers/
│   │   ├── user.controller.js    # All user business logic
│   │   └── auth.middleware.js    # JWT verifyJWT middleware
│   ├── models/
│   │   ├── user.model.js
│   │   ├── video.model.js
│   │   └── subscription.model.js
│   ├── routes/
│   │   └── user.routes.js
│   ├── middlewares/
│   │   └── multer.middleware.js
│   └── utils/
│       ├── ApiError.js
│       ├── ApiResponse.js
│       ├── asyncHandler.js
│       └── cloudinary.js
├── public/temp/                  # Temp upload dir
└── .env.example
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18+`
- MongoDB (local or Atlas)
- [Cloudinary](https://cloudinary.com) account (free tier works)

### Setup

```bash
git clone https://github.com/jeetupal31/Devtube.git
cd Devtube
npm install
cp .env.example .env
# Fill in MongoDB URI, JWT secrets, and Cloudinary credentials
mkdir -p public/temp
npm run dev
```

API runs at `http://localhost:8000`

---

## ⚙️ Environment Variables

```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/devtube
CORS_ORIGIN=http://localhost:3000

ACCESS_TOKEN_SECRET=your_secret
ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET=your_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js (ESM) |
| Framework | Express.js v5 |
| Database | MongoDB + Mongoose |
| Auth | JWT (access + refresh) |
| File Storage | Multer + Cloudinary |
| Aggregation | MongoDB Aggregation Pipeline |

---

## 👨‍💻 Author

**Jeetu Pal**
[![GitHub](https://img.shields.io/badge/GitHub-jeetupal31-181717?style=flat&logo=github)](https://github.com/jeetupal31)

---

## 📄 License

MIT
