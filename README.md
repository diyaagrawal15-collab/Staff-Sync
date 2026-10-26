# HRM Enterprise - Human Resource Management System

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) Human Resource Management System with Role-Based Access Control (RBAC), real-time attendance clocking, multi-level leave approvals, training programs, and executive analytics.

---

## 🌐 Live Demo Link

Open your browser and navigate to:
👉 **[http://localhost:5000](http://localhost:5000)**

---

## 🔑 Demo Login Accounts

You can log in manually or click the **1-Click Demo Buttons** on the Login page:

| Role | Email | Password | Access Highlights |
| :--- | :--- | :--- | :--- |
| **HR Director** | `hr@example.com` | `Password123!` | Full workforce directory, compensation, reports, company-wide announcements |
| **Department Manager** | `manager@example.com` | `Password123!` | Team member oversight, review/approve leaves, monitor team attendance |
| **Senior Employee** | `alex@example.com` | `Password123!` | Clock In/Out, apply for leaves, enroll in trainings, update personal profile |

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js, MongoDB & Mongoose, JWT, bcryptjs, Cors, Dotenv
- **Frontend**: React.js 18, Vite, React Router v6, Redux Toolkit, Axios, Lucide Icons
- **Architecture**: RESTful API with Role-Based Access Control (`employee`, `manager`, `hr`)

---

## 📋 Core Modules

1. **Authentication & RBAC**:
   - Secure JWT token handling with automatic Bearer headers
   - Password encryption using bcryptjs (salt rounds: 10)
   - Role-protected API endpoints and protected React routes

2. **Employee Management**:
   - Searchable, filterable workforce directory
   - Onboard new employee profiles (HR only)
   - Designation, department, reporting manager, and salary tracking

3. **Attendance & Time Tracking**:
   - Interactive live clock with 1-click Clock In / Clock Out
   - Automatic workday duration calculation and late arrival detection
   - Personal monthly timecards, Manager team view, and HR organization view

4. **Leave Management Workflow**:
   - Annual, sick, and casual leave quotas
   - Application submission with date range validation
   - Manager and HR review modal (Approve / Reject with comments)
   - Automatic quota balance deduction upon approval

5. **Trainings & Upskilling**:
   - Course catalog with category filters (Technical, Leadership, Compliance)
   - 1-click course enrollment
   - Interactive progress slider with completion certificates and scores

6. **Announcements**:
   - Company-wide and department-specific announcements
   - Pinned bulletin priority display

7. **Reports & Executive Analytics**:
   - Total workforce headcount and active attendance rates
   - Department headcount distributions and leave breakdown
   - Payroll analytics (Total payroll, average salary, minimum/maximum compensation)

---

## 🚀 Running the Project

### Start Backend & Serve Built App:
```bash
cd backend
npm start
```
Runs at `http://localhost:5000`

### Start Frontend in Vite Dev Mode (with Hot Module Replacement):
```bash
cd frontend
npm run dev
```
Runs at `http://localhost:3000` (proxied to backend on `:5000`)

### Run Automated Backend Test Suite:
```bash
cd backend
npm test
```
All 18 automated integration tests will run and report status.
