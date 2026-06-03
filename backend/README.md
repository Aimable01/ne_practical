# Fire Extinguisher Management System - Backend

A comprehensive Node.js/Express backend API for managing fire extinguishers, inspections, and maintenance activities with MongoDB, JWT authentication, and role-based access control.

## Features

### User Management
- User registration with role assignment (ADMIN, INSPECTOR, USER)
- JWT-based authentication
- Role-based authorization
- Secure password hashing with bcrypt

### Fire Extinguisher Management
- CRUD operations for fire extinguishers
- Track serial number, location, type, size, installation date, expiry date, and status
- Pagination support for listing all extinguishers
- Role-based access control (ADMIN/INSPECTOR can create/update, ADMIN can delete)

### Inspection Scheduling
- Schedule inspections for specific extinguishers
- Assign inspectors to inspections
- Email notifications to inspectors using Nodemailer
- Track inspection status (SCHEDULED, COMPLETED, CANCELLED, FAILED)
- View assigned inspections

### Maintenance Logging
- Log maintenance activities with actions taken, date, and conditions
- Track maintenance history per extinguisher
- View personal maintenance logs

### Reporting Services
- Real-time dashboard statistics
- Daily, monthly, and yearly reports
- Extinguisher status reports
- Inspection status reports
- Maintenance history reports
- Expired extinguishers tracking

### Security
- Helmet for security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes)
- JWT token authentication
- Role-based access control
- Input validation with express-validator
- Comprehensive error handling

### Documentation
- Swagger/OpenAPI documentation at `/api-docs`
- Comprehensive API documentation with examples

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5.2.1
- **Database**: MongoDB with Mongoose 9.6.3
- **Authentication**: JWT (jsonwebtoken 9.0.3)
- **Password Hashing**: bcryptjs 3.0.3
- **Validation**: express-validator 7.3.2
- **Email**: Nodemailer 8.0.10
- **Security**: Helmet 8.2.0, CORS 2.8.6, express-rate-limit 8.5.2
- **Logging**: Morgan 1.10.1 + custom file-based logger
- **Documentation**: Swagger-jsdoc 6.3.0, Swagger-ui-express 5.0.1
- **Package Manager**: pnpm

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.ts              # MongoDB connection
│   │   ├── mailer.ts          # Nodemailer configuration
│   │   └── swagger.ts         # Swagger documentation config
│   ├── controllers/
│   │   ├── authController.ts          # Authentication controllers
│   │   ├── extinguisherController.ts  # Extinguisher CRUD controllers
│   │   ├── inspectionController.ts    # Inspection controllers
│   │   ├── maintenanceController.ts   # Maintenance controllers
│   │   └── reportController.ts       # Reporting controllers
│   ├── middleware/
│   │   ├── auth.ts            # JWT authentication & role-based authorization
│   │   ├── errorHandler.ts    # Error handling middleware
│   │   └── validationHandler.ts # Validation error handler
│   ├── models/
│   │   ├── User.ts            # User model with roles
│   │   ├── Extinguisher.ts    # Extinguisher model
│   │   ├── Inspection.ts      # Inspection model
│   │   └── Maintenance.ts     # Maintenance model
│   ├── routes/
│   │   ├── authRoutes.ts      # Authentication routes
│   │   ├── extinguisherRoutes.ts  # Extinguisher routes
│   │   ├── inspectionRoutes.ts    # Inspection routes
│   │   ├── maintenanceRoutes.ts   # Maintenance routes
│   │   └── reportRoutes.ts       # Reporting routes
│   ├── utils/
│   │   └── logger.ts          # File-based logging utility
│   ├── validators/
│   │   ├── authValidator.ts           # Auth validation rules
│   │   ├── extinguisherValidator.ts  # Extinguisher validation rules
│   │   ├── inspectionValidator.ts    # Inspection validation rules
│   │   └── maintenanceValidator.ts   # Maintenance validation rules
│   ├── app.ts                 # Express app configuration
│   └── index.ts               # Application entry point
├── logs/                      # Application logs (gitignored)
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## Installation

1. **Install dependencies** (using pnpm as specified in package.json):
```bash
pnpm install
```

2. **Configure environment variables**:
   Copy `.env.example` to `.env` and update with your configuration:
```bash
cp .env.example .env
```

   Update the following variables in `.env`:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure secret key for JWT tokens
   - `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`: Your email configuration
   - `FRONTEND_URL`: Your frontend URL for CORS

3. **Ensure MongoDB is running**:
   Make sure your MongoDB server is running and accessible at the specified URI.

## Running the Application

### Development Mode
```bash
pnpm run dev
```
This will start the server with nodemon for auto-reloading on changes.

### Production Mode
```bash
pnpm run build
pnpm start
```

The server will start on port 3000 (or the port specified in `.env`).

## API Endpoints

### Base URL
- Development: `http://localhost:3000`
- API Documentation: `http://localhost:3000/api-docs`
- Health Check: `http://localhost:3000/health`

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile

### Extinguisher Endpoints
- `GET /api/extinguishers` - Get all extinguishers (paginated)
- `GET /api/extinguishers/:id` - Get extinguisher by ID
- `POST /api/extinguishers` - Create new extinguisher (ADMIN/INSPECTOR)
- `PUT /api/extinguishers/:id` - Update extinguisher (ADMIN/INSPECTOR)
- `DELETE /api/extinguishers/:id` - Delete extinguisher (ADMIN)

### Inspection Endpoints
- `GET /api/inspections` - Get all inspections (paginated)
- `GET /api/inspections/my` - Get my assigned inspections
- `GET /api/inspections/:id` - Get inspection by ID
- `POST /api/inspections` - Schedule new inspection
- `PUT /api/inspections/:id` - Update inspection (ADMIN/INSPECTOR)
- `DELETE /api/inspections/:id` - Delete inspection (ADMIN)

### Maintenance Endpoints
- `GET /api/maintenance` - Get all maintenance records (paginated)
- `GET /api/maintenance/my` - Get my maintenance logs
- `GET /api/maintenance/extinguisher/:extinguisherId` - Get maintenance by extinguisher
- `GET /api/maintenance/:id` - Get maintenance record by ID
- `POST /api/maintenance` - Log maintenance activity (ADMIN/INSPECTOR)

### Reporting Endpoints
- `GET /api/reports/dashboard` - Get dashboard statistics
- `GET /api/reports/extinguishers?period=daily|monthly|yearly` - Get extinguisher reports
- `GET /api/reports/inspections?period=daily|monthly|yearly` - Get inspection reports
- `GET /api/reports/maintenance` - Get maintenance history
- `GET /api/reports/expired` - Get expired extinguishers

## User Roles

### ADMIN
- Full access to all features
- Can create, update, and delete extinguishers
- Can manage inspections and maintenance
- Can access all reports

### INSPECTOR
- Can create and update extinguishers
- Can schedule and complete inspections
- Can log maintenance activities
- Can view assigned inspections and personal maintenance logs

### USER
- Can view extinguisher status
- Can schedule inspections
- Can view inspection status
- Can access basic reports

## Security Features

1. **JWT Authentication**: All protected routes require a valid JWT token
2. **Role-Based Authorization**: Different access levels based on user roles
3. **Rate Limiting**: 100 requests per 15 minutes per IP
4. **CORS Protection**: Configured to allow requests from specified frontend URL
5. **Security Headers**: Helmet middleware for security headers
6. **Input Validation**: All inputs validated using express-validator
7. **Password Hashing**: Passwords hashed using bcrypt
8. **Error Handling**: Comprehensive error handling with proper HTTP status codes

## Logging

Logs are saved to the `logs/app.log` file with the following levels:
- INFO: General information
- WARN: Warning messages
- ERROR: Error messages
- DEBUG: Debug information

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| PORT | Server port | No | 3000 |
| NODE_ENV | Environment | No | development |
| MONGODB_URI | MongoDB connection string | Yes | - |
| JWT_SECRET | JWT secret key | Yes | - |
| MAIL_HOST | SMTP host | Yes | - |
| MAIL_PORT | SMTP port | Yes | - |
| MAIL_USER | SMTP username | Yes | - |
| MAIL_PASS | SMTP password | Yes | - |
| FRONTEND_URL | Frontend URL for CORS | No | http://localhost:5173 |

## Testing the API

1. Start the server: `pnpm run dev`
2. Visit `http://localhost:3000/api-docs` for interactive API documentation
3. Use Swagger UI to test all endpoints

## Notes

- All packages are already installed as per package.json
- No additional package installation required
- Ensure MongoDB is running before starting the server
- Configure email settings in `.env` for inspection notifications to work
- JWT_SECRET should be changed in production
- Use strong passwords for email configuration
