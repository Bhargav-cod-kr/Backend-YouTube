# 🚀 Backend API - Production Ready

A robust, modular, and production-level **Node.js + Express + MongoDB** backend application with features like authentication, file uploads via Cloudinary, and structured error handling.  
Built with scalability, security, and maintainability in mind.

---

## 🏗️ Project Structure

```
📦 src/
│
├── 📁 controllers/
│   ├── subscription.controller.js
│   ├── user.controller.js
│   ├── video.controller.js
│
├── 📁 db/
│   ├── index.js
│
├── 📁 middlewares/
│   ├── auth.middleware.js
│   ├── multer.middleware.js
│
├── 📁 models/
│   ├── subscription.model.js
│   ├── user.model.js
│   ├── video.model.js
│
├── 📁 routes/
│   ├── user.routes.js
│
├── 📁 utils/
│   ├── apiError.js
│   ├── apiResponse.js
│   ├── asyncHandler.js
│   ├── cloudinary.js
│
├── app.js
├── constant.js
├── index.js
│

├── .env
├── prettierrc
├── package.lock.json
├── package.json
└── README.md
```

---

## ⚙️ Tech Stack

- **Runtime:** Node.js  
- **Framework:** Express.js  
- **Database:** MongoDB (Mongoose ODM)  
- **File Uploads:** Cloudinary + Multer  
- **Authentication:** JWT (Access & Refresh Tokens)  
- **Error Handling:** Centralized API Error Middleware  
- **Code Style:** ESLint + Prettier (recommended)

---

## 🧩 Core Features

✅ **User Authentication** — Secure login/register with JWT-based access & refresh tokens  
✅ **Avatar Uploads** — Handled via Cloudinary for image storage  
✅ **Async Error Handling** — Wrapper for clean async controller logic  
✅ **Custom API Response Format** — Consistent JSON responses  
✅ **Modular Routing** — Each route & controller isolated for maintainability  
✅ **MongoDB Integration** — Clean schema definitions with timestamps  
✅ **Production-Ready Comments** — Concise and professional inline comments for maintainers  

---

## 🧠 Environment Variables

Create a `.env` file in the project root with the following variables:

```
PORT=8000
MONGODB_URI=
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=
REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 🚀 Getting Started

### 1️⃣ Clone Repository
```bash
git clone https://github.com/Bhargav-cod-kr/Youtube-Backend.git
cd Youtube-Backend
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Configure Environment
Add your `.env` file as described above.

### 4️⃣ Run Development Server
```bash
npm run dev
```

### 5️⃣ Build for Production
```bash
npm run build
```

### 6️⃣ Start Production Server
```bash
npm start
```

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/api/v1/users/register` | Register new user |
| POST | `/api/v1/users/login` | Login user |
| PATCH | `/api/v1/users/avatar` | Update avatar image |
| GET | `/api/v1/videos` | Fetch all videos |
| POST | `/api/v1/videos/upload` | Upload video |
| POST | `/api/v1/subscriptions` | Subscribe to a channel |

---

## 🧰 Recommended Tools

| Tool | Purpose |
|------|----------|
| [Postman](https://www.postman.com/) | API testing |
| [MongoDB Compass](https://www.mongodb.com/products/compass) | Visual DB management |
| [Cloudinary](https://cloudinary.com/) | Media storage |
| [VSCode](https://code.visualstudio.com/) | Code editor |

---

## 🛡️ Security Practices

- Store JWT secrets in `.env`
- Validate all user input
- Use HTTPS in production
- Sanitize database queries
- Rotate refresh tokens securely

---

## 🧑‍💻 Author

**Bhargav Yadav**  🌐 [GitHub](https://github.com/Bhargav-cod-kr)

---

⭐ *If you find this project helpful, please give it a star on GitHub!*
