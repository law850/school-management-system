# 🎓 TIA BIDII School Management System

![Django](https://img.shields.io/badge/Backend-Django-092E20?style=for-the-badge&logo=django)
![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql)
![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel)

A powerful, full-stack, enterprise-grade School Management System. This application handles the core operations of a school, including student enrollment, staff management, attendance tracking, academic grading, and automated PDF report card generation.

## 🌐 Live Demo

Experience the application live in your browser!

- **Frontend (Vercel):** [https://school-management-system-nine-gray.vercel.app](https://school-management-system-nine-gray.vercel.app)
- **Backend API (Render):** [https://school-management-system-wpb9.onrender.com/api/](https://school-management-system-wpb9.onrender.com/api/)

**Test Credentials:**
- **Username:** `Law12`
- **Password:** `law123`

*(Note: Because the backend is hosted on Render's free tier, the very first request might take 50 seconds to "wake up" the server. Be patient, it will load!)*

---

## ✨ Features

- **Secure Authentication:** JWT (JSON Web Token) authentication protects the API and restricts access to logged-in administrators.
- **Analytics Dashboard:** A real-time overview showing total students, total teachers, classrooms, and today's attendance rate.
- **Student Management:** Full CRUD (Create, Read, Update, Delete) capabilities. Admission numbers are automatically generated and auto-increment (e.g., ADM001).
- **Teacher & Classroom Management:** Easily add, edit, or remove teaching staff and assign classrooms.
- **Attendance Module:** Track daily attendance with statuses (Present, Absent, Late) and color-coded UI badges.
- **Grades & Subjects:** Record exam scores and assign subjects. The system automatically calculates the letter grade (A, B, C, D, F) based on the score.
- **Automated PDF Reports:** Generate and download beautifully formatted, branded PDF report cards for individual students, complete with their grades and attendance summary.
- **Modern UI/UX:** A stunning, responsive dark-mode interface built with Tailwind CSS.

---

## 🛠️ Tech Stack

- **Backend:** Python, Django, Django REST Framework (DRF)
- **Database:** PostgreSQL (Hosted on Neon)
- **Frontend:** React (Vite), JavaScript
- **Styling:** Tailwind CSS
- **Authentication:** SimpleJWT
- **PDF Generation:** ReportLab
- **Deployment:** Vercel (Frontend), Render (Backend), Neon (Database)

---

## 📂 Architecture & Project Structure

```text
school_management_system/
│
├── api/                  # Django App (Models, Serializers, Views)
├── core/                 # Django Project Settings
├── frontend/             # React + Vite Frontend Application
│   ├── src/              # React Components & Styles
│   └── ...
├── venv/                 # Python Virtual Environment (ignored in Git)
├── manage.py             # Django Management Script
├── requirements.txt      # Python Dependencies
├── build.sh              # Render Build Script
└── README.md

