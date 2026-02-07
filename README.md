# SmartPark Payroll Management System (EPMS)

This is a MERN-stack application (MySQL, Express, React, Node.js) for managing employees, departments, and salaries.

## Prerequisites
- Node.js installed
- MySQL Server installed and running on port 3306

## Project Structure
- `backend-project`: Express.js API server
- `frontend-project`: React + Vite + Tailwind CSS client

## Setup Instructions

### 1. Database Setup
Ensure your MySQL server is running. The default configuration uses `root` user with clear (empty) password.
Update `backend-project/.env` if your credentials differ.

Run the setup script to create database and tables:
```bash
cd backend-project
node setup_database.js
```

### 2. Backend Setup
```bash
cd backend-project
npm install
npm start
```
Server runs on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd frontend-project
npm install
npm run dev
```
Client runs on `http://localhost:5173`.

## Features
- Login (Default Admin - Username: `admin`, Password: `admin123`)
- Dashboard with summary statistics
- Employee Management (Add, View)
- Department Management (Add, View)
- Salary Management (Add, Edit, Delete, View)
- Monthly Payroll Report
