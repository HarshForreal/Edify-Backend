# Edify - Backend

Edify is a full-stack online learning platform where users can register as Students or Instructors. Instructors can create and manage online courses, while students can browse and enroll in courses. This repository contains the backend implementation of Edify, built with **Node.js** and **Express.js**.

## Features
- User authentication (Login/Signup) with **JWT** (JSON Web Token)
- Role-based access control (Student & Instructor)
- Instructors can:
  - Create and manage courses
  - Add course content (YouTube video links & rich text explanations)
  - Edit and delete their courses
- Students can:
  - Browse and filter courses by category
  - Enroll in courses
  - Track session progress

## Technologies Used
- **Node.js** - Backend JavaScript runtime environment
- **Express.js** - Web framework for Node.js
- **MongoDB** (or **MySQL**) - Database for storing user and course data
- **JWT** (JSON Web Token) - For secure user authentication
- **Bcrypt** - For password hashing
- **Mongoose** (for MongoDB) - Object data modeling (ODM)
- **CORS** - For handling cross-origin requests
- **dotenv** - For managing environment variables

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/your-username/Edify-backend.git
    cd Edify-backend
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory and add the necessary environment variables:
    ```bash
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    ```

4. Run the server:
    ```bash
    npm start
    ```
    Or, for development (with hot-reloading):
    ```bash
    npm run dev
    ```

   The backend server will now be running at `http://localhost:5000`.

## API Endpoints

- **POST /api/auth/signup** - Register a new user (Student/Instructor)
- **POST /api/auth/login** - User login
- **GET /api/courses** - Get all courses
- **POST /api/courses** - Create a new course (Instructor only)
- **GET /api/courses/:id** - Get a specific course details
- **PUT /api/courses/:id** - Update a course (Instructor only)
- **DELETE /api/courses/:id** - Delete a course (Instructor only)

## Contributing

1. Fork this repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Make your changes.
4. Commit your changes (`git commit -am 'Add new feature'`).
5. Push to the branch (`git push origin feature-name`).
6. Open a pull request.

## Acknowledgements
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [JWT](https://jwt.io/)
- [Mongoose](https://mongoosejs.com/)

