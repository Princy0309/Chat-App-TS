# Chat-App-TS

A real-time chat application built with TypeScript, Node.js, Express, Native WebSockets (`ws`), and MongoDB Atlas.

## Live Link
https://chat-app-ts-30sb.onrender.com

## Features
- Real-time messaging using native WebSockets (`ws`)
- JWT user authentication
- Password validation using Regex (8-10 chars, uppercase, lowercase, number)
- Show/hide password eye button
- 300-character message limit with live counter
- Read receipts (✓ sent, ✓✓ read)
- Live online user count

## Setup and Run Locally

1. Clone the repo:
   git clone https://github.com/Princy0309/Chat-App-TS.git
   cd Chat-App-TS

2. Install dependencies:
   npm install

3. Create .env file:
   PORT=5000
   MONGO_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_jwt_secret

4. Start the server:
   npm run dev

Open http://localhost:5000 in your browser.

## API Endpoints

### 1. Register User
POST /auth/register

Request Body:
{
  "username": "Princy",
  "email": "princy@gmail.com",
  "password": "Password1"
}

Success Response (201):
{
  "message": "User registered successfully"
}

Error Response (400):
{
  "message": "Password must be between 8 and 10 characters long and contain at least one uppercase letter, one lowercase letter, and one number."
}

### 2. Login User
POST /auth/login

Request Body:
{
  "email": "princy@gmail.com",
  "password": "Password1"
}

Success Response (200):
{
  "message": "Login successful",
  "token": "eyJhbGciOi...",
  "user": {
    "id": "66f012...",
    "username": "Princy",
    "email": "princy@gmail.com"
  }
}

Error Response (400):
{
  "message": "Invalid email or password"
}
