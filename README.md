# Demo Vitrine

Full-stack showcase site template — landing page, contact form, and admin panel.

**Live demo:** [demo.mandev.fr](https://demo.mandev.fr)

---

## Stack

**Frontend**
- React 18 + Vite
- React Router v6

**Backend**
- Node.js + Express
- Prisma ORM + PostgreSQL
- JWT authentication (httpOnly cookies)
- Argon2 password hashing

---

## Features

- Responsive landing page
- Contact form
- Admin panel — manage content and messages
- JWT-protected routes with httpOnly cookies

---

## Project Structure

```
demo-vitrine/
├── backend/
│   ├── prisma/         # Schema + migrations + seed
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── routes/
│   └── server.js
└── frontend/
    └── src/
        ├── components/
        └── pages/
            ├── LandingPage/
            ├── ConnexionScreen/
            └── AdminScreen/
```

---

## Local Setup

```bash
# Backend
cd backend
npm install
cp .env.example .env   # fill in your values
npx prisma migrate dev
npx prisma db seed
npm run dev            # :3002

# Frontend
cd frontend
npm install
npm run dev            # :5173
```

---

## Security

- Passwords hashed with Argon2
- JWT stored in httpOnly cookies (not localStorage)
- Environment variables for all secrets
