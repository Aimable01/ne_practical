# FE MIS Microservices

This is the microservices architecture for the Fire Extinguisher Management System (FE MIS). The monolithic backend has been converted into independent, deployable microservices.

## Architecture Overview

The system consists of the following services:

- **API Gateway** (Port 3000) - Routes requests to appropriate services
- **Auth Service** (Port 3001) - Handles authentication, user management
- **Extinguisher Service** (Port 3002) - Manages fire extinguisher CRUD operations
- **Inspection Service** (Port 3003) - Handles inspection scheduling and management
- **Maintenance Service** (Port 3004) - Manages maintenance logging
- **Report Service** (Port 3005) - Provides reporting and analytics
- **Shared Package** - Common models, middleware, and utilities

## Prerequisites

- Node.js 20+
- pnpm package manager
- MongoDB 8.0+
- Docker (optional, for containerized deployment)

## Directory Structure

```
services/
├── shared/                 # Shared models, middleware, utils
├── api-gateway/           # API Gateway service
├── auth-service/          # Authentication service
├── extinguisher-service/  # Extinguisher management service
├── inspection-service/    # Inspection management service
├── maintenance-service/   # Maintenance logging service
├── report-service/        # Reporting service
├── docker-compose.yml     # Docker Compose configuration
└── package.json           # Root package with scripts
```

## Running the Services

### Quick Start (Local Development)

**Single command to run all services:**
```bash
cd /Users/aimable/Documents/NE\ PRACTICALS/ne_practical/backend/services
./start-all.sh
```

Or manually:
```bash
cd /Users/aimable/Documents/NE\ PRACTICALS/ne_practical/backend/services
pnpm run dev:all
```

### Prerequisites

1. **Start MongoDB:**
   ```bash
   mongod --dbpath ./data
   ```

2. **Configure environment variables:**
   
   Copy `.env.example` files from each service directory to `.env` and configure:
   - MongoDB URI
   - JWT secret
   - Mail configuration
   - Service URLs

### Option 1: Using Docker Compose (Recommended for Production)

1. **Start MongoDB:**
   ```bash
   docker-compose up -d mongodb
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f
   ```

4. **Stop all services:**
   ```bash
   docker-compose down
   ```

## Service Endpoints

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
- `POST /auth/resend-verification` - Resend verification email
- `GET /auth/inspectors` - Get list of inspectors

### Extinguishers (`/api/extinguishers`)
- `GET /api/extinguishers` - Get all extinguishers (paginated)
- `GET /api/extinguishers/:id` - Get extinguisher by ID
- `POST /api/extinguishers` - Create extinguisher (ADMIN/INSPECTOR)
- `PUT /api/extinguishers/:id` - Update extinguisher (ADMIN/INSPECTOR)
- `DELETE /api/extinguishers/:id` - Delete extinguisher (ADMIN)

### Inspections (`/api/inspections`)
- `GET /api/inspections` - Get all inspections (paginated)
- `GET /api/inspections/my` - Get my assigned inspections
- `GET /api/inspections/:id` - Get inspection by ID
- `POST /api/inspections` - Schedule inspection
- `PUT /api/inspections/:id` - Update inspection (ADMIN/INSPECTOR)
- `DELETE /api/inspections/:id` - Delete inspection (ADMIN)

### Maintenance (`/api/maintenance`)
- `GET /api/maintenance` - Get all maintenance records (paginated)
- `GET /api/maintenance/my` - Get my maintenance logs
- `GET /api/maintenance/extinguisher/:id` - Get maintenance by extinguisher
- `GET /api/maintenance/:id` - Get maintenance by ID
- `POST /api/maintenance` - Log maintenance (ADMIN/INSPECTOR)

### Reports (`/api/reports`)
- `GET /api/reports/dashboard` - Get dashboard statistics
- `GET /api/reports/extinguishers?period=daily|monthly|yearly` - Get extinguisher reports
- `GET /api/reports/inspections?period=daily|monthly|yearly` - Get inspection reports
- `GET /api/reports/maintenance` - Get maintenance history
- `GET /api/reports/expired` - Get expired extinguishers
- `GET /api/reports/export?report=...&format=pdf|csv` - Export report (ADMIN/INSPECTOR)

## Environment Variables

Each service requires its own `.env` file. See `.env.example` in each service directory for required variables.

### Common Variables
- `PORT` - Service port
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `FRONTEND_URL` - Frontend application URL

### Auth Service
- `JWT_SECRET` - Secret for JWT token signing
- `MAIL_HOST` - SMTP host
- `MAIL_PORT` - SMTP port
- `MAIL_USER` - SMTP username
- `MAIL_PASS` - SMTP password

### Service URLs
Services need to know each other's URLs for inter-service communication:
- `AUTH_SERVICE_URL`
- `EXTINGUISHER_SERVICE_URL`
- `INSPECTION_SERVICE_URL`
- `MAINTENANCE_SERVICE_URL`
- `REPORT_SERVICE_URL`

## Inter-Service Communication

Services communicate via HTTP requests. For example:
- Inspection Service calls Auth Service to verify inspectors
- Extinguisher Service calls Inspection Service for cascade delete
- Report Service queries all services for aggregated data

## Building for Production

```bash
# Build all services
pnpm run build:all

# Each service will have a dist/ directory with compiled JavaScript
```

## Troubleshooting

### Services not starting
- Ensure MongoDB is running
- Check environment variables are set correctly
- Verify service URLs are correct
- Check logs in `logs/app.log` for each service

### Shared package not found
- Build the shared package first: `pnpm run build:shared`
- Ensure local package dependency is linked correctly

### Port conflicts
- Change ports in `.env` files
- Update docker-compose.yml ports mapping

## Migration from Monolith

The original monolithic backend is preserved in the parent directory. To migrate:

1. Update frontend `VITE_API_BASE_URL` to point to API Gateway (http://localhost:3000/api)
2. No changes needed to frontend API calls - routing is handled by API Gateway
3. Data remains in MongoDB - no database migration needed

## Health Checks

Each service has a health check endpoint:
- `http://localhost:3000/health` - API Gateway
- `http://localhost:3001/health` - Auth Service
- `http://localhost:3002/health` - Extinguisher Service
- `http://localhost:3003/health` - Inspection Service
- `http://localhost:3004/health` - Maintenance Service
- `http://localhost:3005/health` - Report Service
