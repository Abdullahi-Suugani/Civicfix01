# CivicFix AI

### AI-Powered Community Problem Reporting Platform

CivicFix AI is a full-stack web application that empowers citizens to report public infrastructure issues while enabling local governments to efficiently manage, prioritize, and resolve them.

The platform combines Artificial Intelligence, Geographic Information Systems (GIS), and modern web technologies to improve communication between communities and government agencies.

---

## Problem

Many communities struggle to report public infrastructure problems effectively. Traditional reporting methods such as phone calls, paper forms, and social media often result in:

- Slow response times
- Lost or duplicate reports
- Lack of transparency
- Poor communication between citizens and authorities
- Difficulty identifying high-priority issues

---

## Solution

CivicFix AI provides a centralized digital platform where citizens can report issues with precise locations and photos, while government officials can monitor, analyze, and resolve them through an intelligent administrative dashboard.

---

## Features

### Citizen Portal

- User Registration & Login
- JWT Authentication
- Report Public Issues
- Upload Multiple Images
- Interactive Map Location Picker
- Use Current GPS Location
- View Personal Reports
- Save Favorite Reports
- Comment on Reports
- Report Timeline
- Notifications
- Profile Management

---

### Administrator Dashboard

- Dashboard Analytics
- Manage Reports
- Manage Categories
- Manage Users
- View Resolution Statistics
- Export Reports as CSV
- Interactive Charts
- Report Status Management

---

## AI Features

- AI-generated report summaries
- Automatic issue categorization
- Priority recommendation
- Staff action recommendations
- AI-assisted report writing
- Natural language report search

---

## Technology Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Leaflet
- Recharts
- Axios

### Backend

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT
- bcrypt

### Database

- PostgreSQL
- Supabase

### AI

- OpenAI GPT API

---

## Project Structure

```text
civicfix/
│
├── backend/
│   ├── prisma/
│   ├── src/
│   ├── uploads/
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
└── README.md
```

---

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/civicfix.git

cd civicfix
```

---

### 2. Backend Setup

```bash
cd backend

npm install

cp .env.example .env

npx prisma generate

npx prisma migrate dev --name init

npm run seed

npm run dev
```

Backend runs at:

```
http://localhost:5000
```

---

### 3. Frontend Setup

```bash
cd ../frontend

npm install

npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## Environment Variables

Create a `.env` file inside the **backend** folder.

```env
DATABASE_URL=your_supabase_database_url
DIRECT_URL=your_supabase_direct_url

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

OPENAI_API_KEY=your_openai_api_key

CLIENT_URL=http://localhost:5173
```

---

## API Endpoints

### Authentication

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

---

### Reports

```
GET    /api/reports
POST   /api/reports
GET    /api/reports/:id
PUT    /api/reports/:id
DELETE /api/reports/:id
```

---

### Categories

```
GET
POST
PUT
DELETE
```

---

### Users

```
GET
PUT
DELETE
```

---

### Dashboard

```
GET /api/dashboard/statistics
```

---

## Demo Accounts

### Administrator

```
Email:
admin@civicfix.gov

Password:
Admin123!
```

---

### Citizen

```
Email:
citizen@example.com

Password:
Citizen123!
```

---

## Future Improvements

- Mobile Application
- Push Notifications
- Email Notifications
- Cloudinary Image Storage
- Socket.IO Real-Time Updates
- AI Duplicate Report Detection
- AI Predictive Maintenance
- Government Department Assignment

---

## Why CivicFix AI?

CivicFix AI helps governments build smarter cities by:

- Improving citizen engagement
- Increasing government transparency
- Reducing issue resolution time
- Supporting data-driven decisions
- Using Artificial Intelligence for smarter prioritization

---

## Security

- JWT Authentication
- Password Hashing using bcrypt
- Role-Based Access Control
- Protected API Routes
- Environment Variables
- SQL Injection Protection with Prisma ORM

---

## License

This project was developed for educational purposes and hackathon participation.

---

## Developer

**Abdullahi Aadan Abdi**

Computer Science Student

SIMAD University

---

## Hackathon Submission

**Project Name:** CivicFix AI

**Category:** Smart Cities • GovTech • Artificial Intelligence

**Built With**

- React
- Node.js
- Express
- Prisma
- PostgreSQL
- Supabase
- OpenAI API
- Leaflet
- Tailwind CSS
- Recharts
