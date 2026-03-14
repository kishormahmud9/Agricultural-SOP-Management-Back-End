# 🌾 Agricultural SOP Management System (Backend)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/framework-Express.js-blue)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/database-PostgreSQL-336791?logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/cache-Redis-DC382D?logo=redis)](https://redis.io/)

A robust, enterprise-grade backend solution designed to manage **Standard Operating Procedures (SOPs)** in agricultural environments. This system empowers farm owners, managers, and employees with streamlined workflows, real-time oversight, and automated task management.

---

## 🚀 Key Features

### 🔐 Multi-Role Authentication & Security
- **Role-Based Access Control (RBAC)**: System Owner, Farm Admin, Farm Manager, and Employee.
- **Secure Login**: JWT-based authentication with refresh token logic.
- **OAuth Integration**: Google Login support for seamless onboarding.
- **OTP Verification**: Email-based OTP for registration and password recovery.

### 🚜 Farm Management & SOPs
- **SOP Creation & Assignment**: Detailed Standard Operating Procedures management.
- **Oversight Dashboard**: Real-time monitoring of farm activities and SOP compliance.
- **Automated Scheduling**: Handling recurring agricultural tasks.

### 💳 Subscription & Billing
- **Payment Integration**: Secure transactions via **Stripe**.
- **Subscription Plans**: Manage different tiers of access for farm admins.
- **Billing History**: Automated invoice generation and payment tracking.

### 💬 Real-time Communication & Notifications
- **Live Updates**: Socket.io integration for instant notifications and dashboard sync.
- **Messaging System**: Internal messaging between farm roles.
- **Email Alerts**: Responsive EJS templates for system-wide communications.

### ⚙️ Infrastructure & Tech Stack
- **ORM**: Prisma for type-safe database interactions.
- **Performance**: Redis caching for optimized data retrieval.
- **Validation**: Schema-based request validation using **Zod**.
- **File System**: Multer-based multi-category file uploads (avatars, SOP documents).

---

## 🛠️ Tech Stack & Packages

| Category | Technology |
| :--- | :--- |
| **Core** | Node.js (ESM), Express.js |
| **Database** | PostgreSQL, Prisma ORM |
| **Caching** | Redis |
| **Real-time** | Socket.io |
| **Payments** | Stripe |
| **Auth** | Passport.js, JWT, Bcrypt |
| **Email** | Nodemailer, EJS |
| **Validation** | Zod |

---

## 📦 Project Structure

```bash
src/
├── app/
│   ├── config/         # App configuration (env, passport, etc.)
│   ├── modules/        # Feature-based business logic
│   │   ├── auth/       # Authentication (Login, Register, OAuth)
│   │   ├── farmAdmin/  # Farm Admin dashboards & settings
│   │   ├── employee/   # Employee tasks and profiles
│   │   ├── sop/        # SOP management (Standard Operating Procedures)
│   │   └── payment/    # Stripe integration & subscriptions
│   ├── middleware/     # Auth, validation, and error middlewares
│   ├── router/         # Centralized API routing
│   ├── socket/         # Real-time event handlers
│   └── utils/          # Helper functions & shared resources
├── server.js           # Server initialization
└── app.js              # Express application setup
```

---

## ⚙️ Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/kishormahmud9/Agricultural-SOP-Management-Back-End.git
   cd Agricultural-SOP-Management-Back-End
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/db_name"
   REDIS_URL="redis://localhost:6379"
   JWT_SECRET="your_secret_key"
   STRIPE_SECRET_KEY="your_stripe_key"
   # ... (see .env.example for full list)
   ```

4. **Database Migration**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the Server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contact & Support

Developed with ❤️ by **FireAI Agency**

- **Author**: **Kishor Mahmud / MD. Nowazesh Kobir Rifat**
- **Organization**: FireAI Agency
- **GitHub**: [@kishormahmud9](https://github.com/kishormahmud9) / [@NKRifat47](https://github.com/NKRifat47)

---
*Created for modern agriculture management.* ©️ 2026 FireAI Agency
