# Hospital Emergency Priority System 🏥⚡

A modern, production-grade full-stack web application for administrative hospital emergency queue prioritization, doctor allocation, treatment tracking, and operational analytics.

> **Medical Safety Disclaimer**: This software is strictly for administrative emergency queue prioritization, educational, and demonstration purposes. It does not perform clinical diagnosis or replace certified medical decision-support systems. Authorized medical staff retain full authority to review and manually override priority assignments at any time with audit logging.

---

## 🌟 Architecture & Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript & Vite
- **UI & Styling**: Tailwind CSS, shadcn/ui primitives, Framer Motion animations, Lucide icons
- **Data & State**: TanStack Query (React Query v5), Axios, React Hook Form, Zod validation
- **Visualization**: Recharts for hospital analytics and queue distribution
- **Real-Time**: STOMP over WebSocket for instant queue updates

### Backend
- **Framework**: Java 21, Spring Boot 3.3.x
- **Security**: Spring Security 6 with JWT authentication & BCrypt password hashing
- **Data Structures & Algorithms**:
  - **Min-Heap Priority Queue** (`java.util.PriorityQueue`) with custom comparator
  - Priority weight calculation: $Score = LevelWeight + Score + ArrivalTimeTieBreaker$
  - Multi-factor Doctor Allocation algorithm based on workload, availability, and specialization
- **Database**: MongoDB Atlas with multi-field indexing and server-side pagination
- **Real-Time Messaging**: Spring WebSocket + STOMP broker (`/topic/queue-updates`)

---

## 📁 Repository Structure

```
hospital-emergency-priority-system/
├── frontend/               # React + TypeScript + Vite web app
├── backend/                # Java 21 + Spring Boot REST API & WebSocket service
├── docs/                   # System Architecture, API Specifications, & DB Schema
├── .env.example            # Template for environment variables
└── README.md               # Project overview and instructions
```

---

## 🚀 Local Quickstart Guide

### Prerequisites
- **Node.js**: v18+ (v24 recommended)
- **Java JDK**: 21 LTS
- **MongoDB**: MongoDB Atlas URI or local MongoDB instance

### 1. Backend Setup
1. Navigate to backend:
   ```bash
   cd backend
   ```
2. Configure environment variables in `.env` or set system env vars:
   ```env
   PORT=8080
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/hospital_emergency_db
   JWT_SECRET=your_jwt_secret_key_minimum_256_bits
   FRONTEND_URL=http://localhost:5173
   DEV_SEED_ENABLED=true
   ```
3. Build & Run:
   ```bash
   ./mvnw spring-boot:run
   ```

### 2. Frontend Setup
1. Navigate to frontend:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm.cmd install
   ```
3. Start dev server:
   ```bash
   npm.cmd run dev
   ```
4. Access the command center at `http://localhost:5173`.

---

## 🔑 Demo Access Credentials (Auto-Seeded)

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@hospital.org` | `Admin123!` | System configuration, user management, audit logs, analytics |
| **Doctor** | `doctor.smith@hospital.org` | `Doctor123!` | Assigned cases, treatment notes, case completion |
| **Nurse** | `nurse.joy@hospital.org` | `Nurse123!` | Patient intake, emergency case creation, priority overrides |
| **Receptionist** | `receptionist@hospital.org` | `Recept123!` | Patient registration, queue lookup, search |

---

## 📜 Documentation

- [System Architecture](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)
- [Database Schemas](docs/DATABASE.md)
