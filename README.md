# AI-Based Smart Complaint Management System

## Overview

This is a MERN Stack application that allows users to register complaints online. The system uses Google Gemini AI to classify complaint priority, generate automated responses, recommend the concerned department, and summarize the complaint.

## Project Structure

- `/frontend` - React.js with Vite, Tailwind CSS v4, React Router
- `/backend` - Node.js, Express, MongoDB, JWT Authentication, Google Generative AI

## Features

1. **Complaint Registration & Tracking**: Submit complaints with detailed info.
2. **AI Complaint Analysis**: Automatically detect urgency, suggest department, and generate responses using Gemini AI.
3. **Secure Authentication**: JWT-based login and register with bcrypt password hashing.
4. **Dashboard**: View all complaints, filter by category, and search by location.
5. **Modern UI/UX**: Built with Tailwind CSS featuring a clean, responsive design.

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas)
- Google Gemini API Key

### Backend Setup

1. \`cd backend\`
2. \`npm install\`
3. Create a \`.env\` file in the \`backend\` directory with:
   \`\`\`env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/complaints_db
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_google_gemini_api_key
   \`\`\`
4. \`npm start\` (or \`node server.js\`)

### Frontend Setup

1. \`cd frontend\`
2. \`npm install\`
3. \`npm run dev\`
4. Open the browser to \`http://localhost:5173\`

## Deployment to Render

- **Backend**: Can be deployed as a Web Service on Render using the \`backend\` directory.
- **Frontend**: Can be deployed as a Static Site on Render using the \`frontend\` directory (build command: \`npm run build\`, publish dir: \`dist\`).
- **Database**: Use MongoDB Atlas for cloud database hosting and update the \`MONGO_URI\` in the Render environment variables.
