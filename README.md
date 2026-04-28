# Smart Restaurant — Queue & Table Management System (v2)

> Rearchitected version of the restaurant management platform — same core features, upgraded with Firebase authentication, role-based access control, and a dedicated manager route layer.

This is the v2 rewrite of [smart-restaurant-v1](https://github.com/akira2705/smart-restaurant-v1).

---

## What changed in v2

| Feature | v1 | v2 |
|---|---|---|
| Auth | Session-based | Firebase Auth |
| Role Guard | None | Manager vs Staff roles |
| Manager routes | Shared | Dedicated `/api/manager` layer |
| Frontend login | None | Login page with Firebase |
| Table orders | No | New `table-orders` view |
| Middleware | Error only | Auth + Role + Error |

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 20 + Angular Material |
| Backend | Express 5 + TypeScript |
| Database | MySQL (via mysql2) |
| Auth | Firebase Admin SDK |
| Dev tooling | Nodemon, ts-node |

## Project Structure

```
smart-restaurant-v2/
├── BACKEND/
│   ├── src/
│   │   ├── controllers/     # queue, reservation, table, user
│   │   ├── routes/          # user, table, queue, reservation, manager
│   │   ├── middlewares/     # firebaseAuth, role, error
│   │   ├── services/        # db.service.ts (MySQL)
│   │   └── app.ts
│   └── database.sql
└── FRONTEND/
    └── src/app/
        ├── guards/          # auth.guard.ts, manager.guard.ts
        ├── login/           # Firebase login page
        ├── pages/           # dashboard, queue, tables, reservation, manager, table-orders
        └── services/        # api, auth interceptor, queue, table, user, reservation, manager
```

## Getting Started

### Prerequisites

- Node.js >= 18
- MySQL running locally or via Docker
- Firebase project (for auth)

### Backend Setup

```bash
cd BACKEND

npm install

# Set up MySQL schema
mysql -u root -p < database.sql

# Create .env
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=restaurant_db
PORT=3000

# Add your Firebase service account
# Place firebase-service-account.json in BACKEND/

npm run dev
```

Backend runs at `http://localhost:3000`

### Frontend Setup

```bash
cd FRONTEND

npm install

# Configure Firebase in src/app/firebase.ts with your project credentials

ng serve
```

Frontend runs at `http://localhost:4200`

## API Endpoints

| Method | Route | Description |
|---|---|---|
| GET/POST | `/api/users` | User management |
| GET/POST/PATCH | `/api/tables` | Table status |
| GET/POST/DELETE | `/api/queue` | Queue operations |
| GET/POST/DELETE | `/api/reservations` | Reservations |
| GET/POST | `/api/manager` | Manager-only operations |

---

Made by Team 38 — Kumaraguru College of Technology
