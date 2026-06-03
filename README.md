# FE MIS - Fire Extinguisher Management System

A full-stack microservices application for managing fire extinguishers, inspections, and maintenance records.

## Architecture

This project uses a **Turborepo monorepo** with the following structure:

```
ne_practical/
├── apps/
│   └── frontend/          # React + TypeScript frontend
├── services/
│   ├── api-gateway/       # API Gateway (port 3000)
│   ├── auth-service/      # Authentication service (port 3001)
│   ├── extinguisher-service/  # Extinguisher management (port 3002)
│   ├── inspection-service/    # Inspection scheduling (port 3003)
│   ├── maintenance-service/   # Maintenance logging (port 3004)
│   └── report-service/        # Reporting & analytics (port 3005)
├── packages/
│   └── shared/           # Shared models, middleware, utilities
├── turbo.json            # Turborepo configuration
├── pnpm-workspace.yaml   # pnpm workspace configuration
└── package.json          # Root package.json
```

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- MongoDB (local or Docker)

## Installation

```bash
# Install dependencies
pnpm install
```

## Running the Application

### Development Mode

Run all services in development mode:

```bash
# Run all services (frontend + backend)
pnpm dev

# Run only backend services
cd services && pnpm dev

# Run only frontend
cd apps/frontend && pnpm dev
```

### Build for Production

```bash
# Build all packages
pnpm build
```

### Individual Services

```bash
# API Gateway
cd services/api-gateway && pnpm dev

# Auth Service
cd services/auth-service && pnpm dev

# Extinguisher Service
cd services/extinguisher-service && pnpm dev

# Inspection Service
cd services/inspection-service && pnpm dev

# Maintenance Service
cd services/maintenance-service && pnpm dev

# Report Service
cd services/report-service && pnpm dev

# Frontend
cd apps/frontend && pnpm dev
```

## Environment Variables

Each service requires its own `.env` file. Copy the `.env.example` files and configure:

### API Gateway
```bash
cd services/api-gateway
cp .env.example .env
```

### Auth Service
```bash
cd services/auth-service
cp .env.example .env
```

Configure:
- `MONGODB_URI=mongodb://localhost:27017/fe-mis`
- `JWT_SECRET=your-secret-key`
- `MAIL_USER=your-email@example.com`
- `MAIL_PASS=your-app-password`

### Other Services
```bash
cd services/[service-name]
cp .env.example .env
```

Configure:
- `MONGODB_URI=mongodb://localhost:27017/fe-mis`

## API Endpoints

All services are accessed through the API Gateway at `http://localhost:3000/api`

### Authentication (`/api/auth`)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile
- `POST /auth/change-password` - Change password
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `GET /auth/verify-email` - Verify email

### Extinguishers (`/api/extinguishers`)
- `GET /extinguishers` - Get all extinguishers
- `GET /extinguishers/:id` - Get extinguisher by ID
- `POST /extinguishers` - Create extinguisher (ADMIN only)
- `PUT /extinguishers/:id` - Update extinguisher (ADMIN only)
- `DELETE /extinguishers/:id` - Delete extinguisher (ADMIN only)

### Inspections (`/api/inspections`)
- `GET /inspections` - Get all inspections
- `GET /inspections/:id` - Get inspection by ID
- `POST /inspections` - Create inspection (ADMIN, INSPECTOR)
- `PUT /inspections/:id` - Update inspection (ADMIN, INSPECTOR)
- `DELETE /inspections/:id` - Delete inspection (ADMIN)
- `POST /inspections/:id/complete` - Complete inspection (INSPECTOR)

### Maintenance (`/api/maintenance`)
- `GET /maintenance` - Get all maintenance records
- `GET /maintenance/:id` - Get maintenance by ID
- `POST /maintenance` - Create maintenance record (ADMIN, INSPECTOR)
- `PUT /maintenance/:id` - Update maintenance record (ADMIN, INSPECTOR)
- `DELETE /maintenance/:id` - Delete maintenance record (ADMIN)

### Reports (`/api/reports`)
- `GET /reports/dashboard` - Get dashboard statistics
- `GET /reports/extinguishers` - Get extinguisher report
- `GET /reports/inspections` - Get inspection report
- `GET /reports/maintenance` - Get maintenance history
- `GET /reports/expired` - Get expired extinguishers
- `GET /reports/export/pdf` - Export report as PDF
- `GET /reports/export/csv` - Export report as CSV

## User Roles

- **ADMIN** - Full access to all features
- **INSPECTOR** - Can create and complete inspections and maintenance records
- **USER** - Read-only access

## Technology Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Tremor (charts)
- React Router
- Axios

### Backend
- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- JWT (authentication)
- Nodemailer (email)
- Turborepo (monorepo management)
- pnpm (package manager)

## Troubleshooting

### Build Errors

If you encounter TypeScript build errors related to the shared package:

```bash
# Clean build cache
rm -rf node_modules packages/*/dist services/*/dist .turbo
pnpm install
pnpm build
```

### MongoDB Connection

Ensure MongoDB is running:
```bash
# Local MongoDB
mongod --dbpath ./data

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Port Conflicts

If ports are already in use, modify the `.env` files to use different ports.

## Development Workflow

1. Make changes to a service
2. Run `pnpm build` to build affected packages
3. Run `pnpm dev` to start all services
4. Test changes via the frontend or API endpoints

## License

ISC
