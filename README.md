# Server Backend for Portfolio Project

## Overview

This package provides a basic backend setup for user authentication, including login, email verification with OTP generation and verification, and secure user management. It is designed to be a starting point for web applications requiring secure authentication and user management features.

## Main Aim

The main aim of this package is to offer a secure, modular, and easy-to-use backend for handling user authentication, registration, and email verification, following best practices for Node.js and Express applications.

## Features

- User registration and login
- Email verification with OTP (One-Time Password)
- Secure password hashing using bcryptjs
- JWT-based authentication
- Input validation using Joi
- Email sending via nodemailer
- Security headers with Helmet
- CORS support
- Centralized error handling
- Logging with Winston
- MongoDB integration via Mongoose

## Folder Structure

```
server/
  combined.log
  error.log
  package.json
  server.js
  config/
    db.js
  controller/
    authController.js
  middleware/
    authMiddleware.js
    errorMiddleware.js
    validateMiddleware.js
  model/
    RefreshToken.js
    User.js
  routes/
    authRoutes.js
  utils/
    email.js
    logger.js
```

## Dependencies

- express
- mongoose
- dotenv
- bcryptjs
- jsonwebtoken
- joi
- nodemailer
- helmet
- cors
- winston
- nodemon (for development)

## Getting Started

### 1. Clone the Repository

```
git clone <your-repo-url>
cd server
```

### 2. Install Dependencies

```
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

### 4. Run the Server

For development (with auto-reload):

```
npm run dev
```

Or, to run normally:

```
npm start
```

### 5. API Endpoints

- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login user
- `POST /api/auth/verify-email` — Verify email with OTP

## Usage

Integrate this backend with your frontend client. Use the provided API endpoints for authentication and user management.

## License

MIT

## Author

Sanjai-913122205083-VCET-IT
