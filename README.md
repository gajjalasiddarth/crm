# CRM Pro — Full-Featured MERN Stack CRM

A production-ready Customer Relationship Management system built with MongoDB, Express, React, and Node.js.

## Features

- **Authentication** — JWT-based login, register, password reset, role-based access
- **Contacts** — Full CRUD, search, filter, activity timeline
- **Leads** — Pipeline management, lead-to-deal conversion
- **Deals** — Drag-and-drop Kanban board, pipeline analytics
- **Tasks** — Task management with due dates, priorities, one-click complete
- **Emails** — Compose & send via SMTP (Nodemailer), email history
- **Reports** — Revenue charts, pipeline analytics, team performance
- **Users** — Admin panel for role management
- **Roles** — admin, manager, sales_rep, viewer

---

## Project Structure

```
crm/
├── backend/          # Node.js + Express API
└── frontend/         # React + Tailwind CSS
```

---

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and SMTP credentials
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

### 3. Environment Variables (backend/.env)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/crm_db
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@yourcrm.com
FROM_NAME=CRM Pro
CLIENT_URL=http://localhost:3000
```

> For Gmail SMTP: enable 2FA and generate an **App Password** from your Google account.

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET  | /api/auth/me | Get current user |
| PUT  | /api/auth/updateprofile | Update profile |
| PUT  | /api/auth/updatepassword | Change password |
| POST | /api/auth/forgotpassword | Request password reset |
| PUT  | /api/auth/resetpassword/:token | Reset password |

### Contacts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | /api/contacts | List (paginated, searchable) |
| POST | /api/contacts | Create |
| GET  | /api/contacts/:id | Get one |
| PUT  | /api/contacts/:id | Update |
| DELETE | /api/contacts/:id | Delete (manager+) |
| GET  | /api/contacts/:id/activities | Activity timeline |

### Leads
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | /api/leads | List |
| POST | /api/leads | Create |
| GET  | /api/leads/:id | Get one |
| PUT  | /api/leads/:id | Update |
| DELETE | /api/leads/:id | Delete (manager+) |
| POST | /api/leads/:id/convert | Convert to deal |

### Deals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | /api/deals | List |
| GET  | /api/deals/pipeline | Kanban pipeline data |
| POST | /api/deals | Create |
| PUT  | /api/deals/:id | Update / move stage |
| DELETE | /api/deals/:id | Delete (manager+) |

### Tasks, Emails, Reports — similar CRUD patterns

---

## Roles & Permissions

| Feature | viewer | sales_rep | manager | admin |
|---------|--------|-----------|---------|-------|
| View all records | — | Own only | All | All |
| Create records | — | Yes | Yes | Yes |
| Delete records | — | — | Yes | Yes |
| Team reports | — | — | Yes | Yes |
| User management | — | — | — | Yes |

---

## Tech Stack

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Bcrypt, Nodemailer, Helmet, express-rate-limit

**Frontend:** React 18, React Router v6, Tailwind CSS, Recharts, Heroicons, react-hot-toast, date-fns, Axios
