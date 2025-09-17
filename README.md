# Event Management System

A full-stack event management system built with React.js, Tailwind CSS, FastAPI, and PostgreSQL.

## Features

- User authentication (Signup/Login) with JWT
- Role-based access control (Admin/Normal User)
- View all events (for all users)
- Create, update, and delete events (Admin only)
- Responsive UI with Tailwind CSS

## Prerequisites

- Node.js (v14 or later)
- Python (3.8 or later)
- PostgreSQL (v12 or later)
- npm or yarn

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your database credentials.

5. Run database migrations:
   ```bash
   alembic upgrade head
   ```

6. Start the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

## API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/events` - Get all events
- `POST /api/events` - Create a new event (Admin only)
- `PUT /api/events/{id}` - Update an event (Admin only)
- `DELETE /api/events/{id}` - Delete an event (Admin only)

## Project Structure

```
event-management-system/
├── backend/               # FastAPI backend
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── core/         # Core configurations
│   │   ├── db/           # Database models and session
│   │   ├── models/       # Pydantic models
│   │   └── schemas/      # Database schemas
│   ├── alembic/          # Database migrations
│   ├── .env              # Environment variables
│   ├── requirements.txt  # Python dependencies
│   └── main.py           # Application entry point
│
└── frontend/             # React frontend
    ├── public/           # Static files
    └── src/
        ├── components/   # Reusable components
        ├── pages/        # Page components
        ├── services/     # API services
        ├── utils/        # Utility functions
        └── App.js        # Main App component
```

## License

MIT
