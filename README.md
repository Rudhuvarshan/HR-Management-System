<<<<<<< HEAD
# HRMS MERN Project
A complete Human Resource Management System built with the MERN stack.

## Features
- Role-based Access (Admin, HR, Manager, Employee)
- Employee Directory & Profiles
- Attendance Tracker (Clock in / Clock out)
- Leave Management & Approval Flow
- Performance & Goal Tracking
- Payroll Generator & Payslips
- Expense Claims Submission
- Recruitment & Applicant Tracking

## Technologies Used
**Frontend:** React (Vite), Tailwind CSS, React Router DOM, Axios, Lucide React
**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT Auth, Multer, Cloudinary

## Setup Steps

### 1. Database Setup
1. Install MongoDB locally, or use a MongoDB Atlas URI.
2. In `backend/.env`, set your `MONGO_URI`.

### 2. Environment Variables
Create a `.env` file in the `backend/` directory by referring to `backend/.env.example`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/hrms
JWT_SECRET=super_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_url
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

Create a `.env` file in the `frontend/` directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Start Backend
```bash
cd backend
npm install
npm run dev
```

### 4. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

## Initial Login Setup
Use Postman or create an Admin user via `/api/auth/register`. Once the first Admin is created, you can disable public registration and use the Admin dashboard to add additional employees.

## Deployment Instructions

### MongoDB
Set up a database cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas). Note your connection string.

### Backend (Render / Heroku)
1. Push the `backend` code to GitHub.
2. Connect the repo on Render and choose "Web Service".
3. Set Build Command: `npm install`
4. Set Start Command: `npm start`
5. Add all Environment Variables (`MONGO_URI`, `JWT_SECRET`, etc.).

### Frontend (Vercel / Netlify)
1. Push the `frontend` code to GitHub.
2. Import project to Vercel.
3. Set Environment Variable: `VITE_API_BASE_URL` to your production backend URL.
4. Deploy!
=======
# HR-Management-System
>>>>>>> b0e14e4e78bf1f9c5fc8dff83cdffaf2520bfa48
