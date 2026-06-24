# QuickDeal

QuickDeal is an OLX-style marketplace with one account type for buying and selling. Seller trust is modeled with `isVerifiedSeller` and `isEliteSeller` user attributes, while authorization stays role-based with `USER` and `ADMIN`.

## Structure

- `client/` React + Vite + Tailwind CSS + React Router
- `server/` Node.js + Express + Prisma + MySQL + Socket.IO

## Backend Setup

```bash
cd server
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Set `DATABASE_URL` to a MySQL database, and configure Cloudinary values before using uploads.

## Frontend Setup

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

## Main API Areas

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`
- `POST /api/auth/refresh`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`
- `GET /api/listings` with keyword/category/price/location/sort pagination filters
- `POST /api/listings` multipart listing creation with multiple images
- `POST /api/listings/:id/favorite`, `DELETE /api/listings/:id/favorite`
- `GET /api/chat/conversations`, `POST /api/chat/conversations/:id/messages`
- `POST /api/reviews`, `POST /api/reports`
- `GET /api/admin/dashboard`, `/users`, `/listings`, `/reports`

## Notes

- New listings publish immediately; admins can manage listings after they are live.
- Forgot password currently generates and stores a reset token. Add an email provider before production launch.
- Socket.IO authenticates with the same access token and joins each user to a private `user:{id}` room.
