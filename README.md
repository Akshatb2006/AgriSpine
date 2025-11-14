# AgriSpine 🌾

An AI-powered precision agriculture platform that empowers farmers with intelligent crop management, yield prediction, and farm planning capabilities.

![AgriSpine Banner](https://img.shields.io/badge/AgriSpine-AI%20Powered%20Agriculture-green)
![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#️-technology-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#️-configuration)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Usage Guide](#-usage-guide)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)
- [Authors](#-authors)
- [Acknowledgments](#-acknowledgments)
- [Support](#-support)
- [Roadmap](#️-roadmap)

## 🌟 Overview

AgriSpine is a full-stack web application built using the MERN stack (MongoDB, Express.js, React, Node.js) with AI integration through Google Gemini and weather data from OpenWeatherMap. The platform helps farmers:

- 📊 Predict crop yields with AI-powered analysis
- 🗺️ Manage multiple fields with different crops
- 📅 Create and track farming plans and tasks
- 🌤️ Get real-time weather data and forecasts
- 🚨 Receive timely alerts for pests, diseases, and irrigation
- 🤖 Get AI-generated recommendations for farming activities

## ✨ Features

### Core Features

- **User Authentication & Onboarding**
  - Secure JWT-based authentication
  - Multi-language support (English, Hindi, Odia)
  - Guided onboarding process for new farmers

- **AI-Powered Farm Initialization**
  - Automatic farm analysis using Google Gemini AI
  - Initial task and alert generation
  - Personalized recommendations based on farm profile

- **Dashboard**
  - Comprehensive farm overview
  - Visual field representation with maps
  - Crop status and yield trends
  - Critical alerts and upcoming tasks

- **Yield Prediction**
  - AI-powered crop yield forecasting
  - Confidence scores and risk assessment
  - Automated follow-up predictions
  - Historical prediction tracking

- **Field Management**
  - Multiple field support
  - Soil data tracking
  - Current crop monitoring
  - Irrigation system management

- **Farming Plans**
  - AI-generated farming plans
  - Task scheduling and tracking
  - Resource requirement planning
  - Progress monitoring

- **Task Management**
  - Standalone and plan-based tasks
  - Priority-based organization
  - Status tracking and completion

- **Alert System**
  - Weather alerts
  - Pest and disease warnings
  - Irrigation reminders
  - Severity-based prioritization

- **Weather Integration**
  - Current weather conditions
  - 5-day weather forecast
  - Location-based data

## 🛠️ Technology Stack

### Frontend
- **React** 19.1.1 - UI library
- **React Router** 7.9.1 - Client-side routing
- **TailwindCSS** 4.1.13 - Styling
- **Axios** 1.12.2 - HTTP client
- **Leaflet** 1.9.4 - Map visualization
- **Lucide React** 0.544.0 - Icons
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime environment
- **Express** 5.1.0 - Web framework
- **MongoDB** 8.19.3 - Database
- **Mongoose** - ODM
- **JWT** (jsonwebtoken 9.0.2) - Authentication
- **bcryptjs** 3.0.3 - Password hashing
- **Google Generative AI** 0.24.1 - AI predictions
- **Axios** 1.13.2 - HTTP client
- **Morgan** 1.10.1 - Request logging
- **Helmet** 8.1.0 - Security headers
- **CORS** 2.8.5 - Cross-origin requests

### External Services
- **Google Gemini 2.5 Flash** - AI predictions and analysis
- **OpenWeatherMap API** - Weather data

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (v9 or higher) - Comes with Node.js
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)

### API Keys Required

You'll need to obtain the following API keys:

1. **Google Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Free tier available

2. **OpenWeatherMap API Key**
   - Visit [OpenWeatherMap](https://openweathermap.org/api)
   - Sign up and get your API key
   - Free tier available (60 calls/minute)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/agrispine.git
cd agrispine
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../client
npm install
```

## ⚙️ Configuration

### Backend Configuration

1. Create a `.env` file in the `server` directory:

```bash
cd server
touch .env
```

2. Add the following environment variables to `server/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/agrispine
# For MongoDB Atlas, use:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agrispine

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Google Gemini AI
GEMINI_API_KEY=your_google_gemini_api_key_here

# OpenWeatherMap API
WEATHER_API_KEY=your_openweathermap_api_key_here
```

### Frontend Configuration

1. Create a `.env` file in the `client` directory:

```bash
cd ../client
touch .env
```

2. Add the following environment variables to `client/.env`:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Environment
VITE_ENV=development
```

## 🏃 Running the Application

### Option 1: Run Backend and Frontend Separately

#### Start the Backend Server

```bash
cd server
npm start
```

The backend server will start on `http://localhost:5000`

#### Start the Frontend Development Server

Open a new terminal:

```bash
cd client
npm run dev
```

The frontend will start on `http://localhost:5173`

### Option 2: Run Both Concurrently (Recommended)

From the root directory, you can set up a script to run both:

```bash
# Install concurrently globally (one-time setup)
npm install -g concurrently

# Run both servers
concurrently "cd server && npm start" "cd client && npm run dev"
```

### Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## 📁 Project Structure

```
agrispine/
├── client/                      # Frontend React application
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── auth/           # Authentication components
│   │   │   ├── dashboard/      # Dashboard widgets
│   │   │   ├── initialization/ # Onboarding components
│   │   │   ├── layout/         # Layout components
│   │   │   ├── onboarding/     # Onboarding flow
│   │   │   └── pages/          # Page components
│   │   ├── contexts/           # React contexts
│   │   │   ├── ThemeContext.jsx
│   │   │   └── FieldContext.jsx
│   │   ├── services/           # API services
│   │   │   └── api.js
│   │   ├── App.jsx             # Main app component
│   │   └── main.jsx            # Entry point
│   ├── .env                    # Environment variables
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                      # Backend Node.js application
│   ├── config/
│   │   └── db.js               # Database configuration
│   ├── controllers/            # Route controllers
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── predictionsController.js
│   │   ├── plansController.js
│   │   ├── tasksController.js
│   │   ├── alertsController.js
│   │   ├── fieldsController.js
│   │   └── initializationController.js
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT authentication
│   ├── models/                 # Mongoose models
│   │   ├── User.js
│   │   ├── Field.js
│   │   ├── Prediction.js
│   │   ├── Plan.js
│   │   ├── Task.js
│   │   └── Alert.js
│   ├── routers/                # Express routers
│   │   ├── authRouter.js
│   │   ├── dashboardRouter.js
│   │   ├── predictionsRouter.js
│   │   ├── plansRouter.js
│   │   ├── tasksRouter.js
│   │   ├── alertsRouter.js
│   │   └── fieldsRouter.js
│   ├── services/               # External services
│   │   ├── geminiService.js    # Google Gemini AI
│   │   └── weatherService.js   # OpenWeatherMap
│   ├── .env                    # Environment variables
│   ├── index.js                # Server entry point
│   └── package.json
│
├── design.md                   # Technical design document
├── requirements.md             # Product requirements (PRD)
├── tasks.md                    # Implementation tasks
├── .gitignore
└── README.md                   # This file
```

## 📚 API Documentation

### Authentication Endpoints

```
POST   /api/auth/signup              # Create new user account
POST   /api/auth/login               # Authenticate and get JWT token
POST   /api/auth/complete-onboarding # Complete onboarding process
PUT    /api/auth/profile             # Update user profile
GET    /api/auth/profile             # Get user profile
POST   /api/auth/initialize-farm     # Start AI initialization
GET    /api/auth/initialization/:jobId # Get initialization status
```

### Dashboard Endpoints

```
GET    /api/dashboard/overview       # Get dashboard summary
```

### Prediction Endpoints

```
POST   /api/predictions/yield        # Create yield prediction
GET    /api/predictions/:id          # Get prediction by ID
GET    /api/predictions/history      # Get prediction history
GET    /api/predictions              # Get all predictions
```

### Plan Endpoints

```
GET    /api/plans                    # Get all plans
POST   /api/plans                    # Create new plan
GET    /api/plans/:id                # Get plan by ID
PUT    /api/plans/:id                # Update plan
DELETE /api/plans/:id                # Delete plan
PUT    /api/plans/:id/status         # Update plan status
PUT    /api/plans/:id/tasks/:taskId  # Update task in plan
```

### Field Endpoints

```
GET    /api/fields                   # Get all fields
POST   /api/fields                   # Create new field
GET    /api/fields/:id               # Get field by ID
PUT    /api/fields/:id               # Update field
DELETE /api/fields/:id               # Delete field
```

### Task Endpoints

```
GET    /api/tasks                    # Get all tasks
POST   /api/tasks                    # Create new task
PUT    /api/tasks/:id/status         # Update task status
```

### Alert Endpoints

```
GET    /api/alerts                   # Get all alerts
PUT    /api/alerts/:id/read          # Mark alert as read
```

## 📖 Usage Guide

### 1. User Registration

1. Navigate to the application
2. Click "Sign Up"
3. Fill in your details (name, email, phone, language preference, password)
4. Submit the form

### 2. Onboarding

After registration, you'll be guided through onboarding:

1. **Location Information**: Enter your state, district, village, and coordinates
2. **Farm Profile**: Provide farming experience, farm size, and primary crops
3. **Field Details**: Add your fields with name, area, soil type, current crop, and irrigation system
4. **Submit**: Complete onboarding to trigger AI initialization

### 3. AI Initialization

The system will automatically:
- Analyze your fields
- Generate personalized recommendations
- Create initial tasks
- Set up alerts
- Generate baseline predictions

This process takes 30-60 seconds. You'll see a progress indicator.

### 4. Dashboard

Once initialized, you'll see:
- Farm overview with total area and active fields
- Visual field map
- Crop status summary
- Yield trends
- Critical alerts
- Upcoming tasks

### 5. Creating Yield Predictions

1. Navigate to "Predictions" → "New Prediction"
2. Select a field
3. Fill in crop details (type, variety, planting date)
4. Provide soil and irrigation information
5. Submit for AI analysis
6. View results with predicted yield, confidence, and recommendations

### 6. Creating Farming Plans

1. Navigate to "Planning" → "Create Plan"
2. Select field and plan type (irrigation, fertilizer, pest control, etc.)
3. Set start and end dates
4. Define objectives
5. Choose "Generate AI Plan" or create manually
6. Review and edit generated tasks
7. Save the plan

### 7. Managing Tasks

- View all tasks on the dashboard or in the Tasks section
- Update task status (pending → in-progress → completed)
- Add new standalone tasks
- Filter by field or status

### 8. Viewing Alerts

- Check the dashboard for critical alerts
- Navigate to Alerts section for all notifications
- Mark alerts as read
- Take action based on recommendations

## 🔧 Troubleshooting

### Common Issues

**MongoDB Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
Solution: Ensure MongoDB is running. Start it with:
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

**API Key Errors**
```
Error: Invalid API key
```
Solution: Verify your API keys in the `.env` file are correct and active.

**Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::5000
```
Solution: Change the PORT in `server/.env` or kill the process using that port.

**CORS Errors**
Solution: Ensure `VITE_API_URL` in `client/.env` matches your backend URL.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Google Gemini AI for intelligent predictions
- OpenWeatherMap for weather data
- The MERN stack community
- All contributors and farmers who provide feedback

## 📞 Support

For support, email support@agrispine.com or open an issue in the GitHub repository.

## 🗺️ Roadmap

- [ ] Mobile applications (iOS & Android)
- [ ] Real-time notifications via WebSocket
- [ ] IoT sensor integration
- [ ] Market price integration
- [ ] Community features and expert consultation
- [ ] Advanced analytics and ROI calculations
- [ ] Multi-farm management for agricultural advisors

---

Made with ❤️ for farmers worldwide
