# FlotteQ - Fleet Management System

Multi-tenant fleet management platform with separate admin and tenant interfaces.

## 🏗️ Architecture

```
Flotteq-v2/
├── backend/            # NestJS API with TypeORM + PostgreSQL
├── frontend-tenant/    # React app for tenants (fleet managers)
├── frontend-internal/  # React app for internal admin
└── shared-types/       # Shared TypeScript types
```

## 🚀 Tech Stack

### Backend
- **Framework**: NestJS
- **ORM**: TypeORM
- **Database**: PostgreSQL
- **Authentication**: JWT dual tokens (access + refresh)
- **Security**: bcrypt (rounds=12), Rate limiting, Helmet, CORS

### Frontend
- **Framework**: React + TypeScript
- **Build**: Vite
- **UI**: Tailwind CSS + shadcn/ui

## 🔐 Features

- **Multi-tenant architecture** with tenant isolation
- **Secure authentication** with bcrypt + JWT
- **Dual token system** (access 15m, refresh 7d)
- **Rate limiting** on sensitive endpoints
- **TypeORM migrations** for production deployments
- **Docker** ready with docker-compose

## 📋 Prerequisites

- Node.js >= 18
- PostgreSQL >= 15
- Docker (optional)

## 🛠️ Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/Wissem95/flotteq-v2.git
cd Flotteq-v2
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env from example
cp .env.example .env

# Edit .env with your database credentials and JWT secrets
# Generate secrets with: openssl rand -base64 32

# Start development server
npm run start:dev
```

### 3. Frontend Tenant Setup
```bash
cd frontend-tenant
npm install
npm run dev
```

### 4. Frontend Internal Setup
```bash
cd frontend-internal
npm install
npm run dev
```

### Using Docker
```bash
# Start all services
docker-compose up -d

# Backend will be available at http://localhost:3000
# PostgreSQL at localhost:5432
```

## 📝 Environment Variables

### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=flotteq_dev

# JWT (generate with: openssl rand -base64 32)
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# App
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```

## 🔧 Available Scripts

### Backend
```bash
npm run start:dev     # Development with hot reload
npm run build         # Build for production
npm run start:prod    # Start production server
npm run migration:generate  # Generate migration
npm run migration:run      # Run migrations
```

## 📡 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user

### Rate Limits
- Register: 3 requests/minute
- Login: 5 requests/minute
- Global: 100 requests/minute

## 🗄️ Database Schema

The app uses TypeORM with `synchronize: true` in development and migrations in production.

### Main Entities
- **User**: Authentication and user data
  - UUID primary key
  - bcrypt hashed passwords (rounds=12)
  - Refresh tokens (bcrypt hashed, rounds=10)
  - Multi-tenant support via tenantId

## 🔒 Security Features

- ✅ Passwords hashed with bcrypt (rounds=12)
- ✅ Refresh tokens hashed with bcrypt (rounds=10)
- ✅ JWT dual-token system (short-lived access, long-lived refresh)
- ✅ Rate limiting on sensitive endpoints
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Multi-tenant isolation

## 📦 Production Deployment

1. Set environment variables (especially JWT secrets)
2. Build backend: `npm run build`
3. Run migrations: `npm run migration:run`
4. Start: `npm run start:prod`

Or use Docker:
```bash
docker-compose up -d
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is private and proprietary.
