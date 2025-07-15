# Event Management System

## Table of Contents
- [Introduction](#introduction)
- [Installation](#installation)
- [Configuration](#configuration)
- [Start the Server](#start-the-server)
- [Main APIs](#main-apis)
- [Web Interface (EJS)](#web-interface-ejs)
- [Project Structure (MVC)](#project-structure-mvc)
- [Postman Testing Examples](#postman-testing-examples)

---

## Introduction


## Installation
1. Clone the project to your machine
2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration
Create a `.env` file in the `CongSon_event` directory with the following content:
```
JWT_SECRET=your_secret_key_here
MONGODB_URI=mongodb://localhost:27017/event_management
PORT=3000
```

## Start the Server
```bash
node server.js
```

## Main APIs
### Auth
- **Register:** `POST /api/auth/register`
- **Login:** `POST /api/auth/login`

### Event (admin only for create/update/delete)
- **Create event:** `POST /api/events`
- **Get all events:** `GET /api/events`
- **Get event by ID:** `GET /api/events/:id`
- **Update event:** `PUT /api/events/:id`
- **Delete event:** `DELETE /api/events/:id`

### Registration
- **Student register for event:** `POST /api/registrations`
- **Student view their registrations:** `GET /api/registrations/my-registrations`
- **Student cancel registration:** `DELETE /api/registrations/:id`
- **Admin view all registrations:** `GET /api/registrations/listRegistrations`
- **Admin filter registrations by date:** `GET /api/registrations/getRegistrationsByDate?start=YYYY-MM-DD&end=YYYY-MM-DD`

## Web Interface (EJS)
- **Login:** `/login` (views/login.ejs)
- **Register Event (Student):** `/register-event` (views/registerEvent.ejs)
- **Cancel Registration:** `/cancel-registration/:id` (views/cancelRegistration.ejs)
- **Admin List Registrations:** `/admin/list-registrations` (views/listRegistrations.ejs)
- **Admin Search Registrations:** `/admin/search-registrations` (views/searchRegistrations.ejs)

## Project Structure (MVC)
```
CongSon_event/
  controllers/
    authController.js
    eventController.js
    registrationController.js
  middlewares/
    authMiddlewares.js
  models/
    userModel.js
    eventModel.js
    registrationModel.js
  routes/
    authRoutes.js
    eventRoutes.js
    registrationRoutes.js
  views/
    login.ejs
    registerEvent.ejs
    cancelRegistration.ejs
    listRegistrations.ejs
    searchRegistrations.ejs
  server.js
  package.json
  README.md
```

## Postman Testing Examples
### 1. Register admin
```
POST /api/auth/register
{
  "username": "admin",
  "password": "admin123",
  "role": "admin"
}
```
### 2. Login to get token
```
POST /api/auth/login
{
  "username": "admin",
  "password": "admin123"
}
```
### 3. Create event (use admin token)
```
POST /api/events
Headers: Authorization: Bearer <token>
{
  "name": "Workshop NodeJS",
  "maxCapacity": 30,
  "description": "Learn basic NodeJS",
  "date": "2024-06-15T09:00:00.000Z",
  "location": "Room B201"
}
```
### 4. Register student, login to get token, register for event, view registrations, etc.

## Notes
- Always send the header `Authorization: Bearer <token>` for APIs that require authentication.
- If you change JWT_SECRET, you need to log in again to get a new token.
- If you get a 403 error, check your role and token.
- For web interface, access the corresponding routes in your browser.

---
For any questions, please contact the project admin! 