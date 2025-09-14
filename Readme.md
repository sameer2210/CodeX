# CodeX - Collaborative AI-Powered Code Editor

## 🚀 Project Overview

CodeX is a real-time collaborative code editor with AI-powered code review capabilities. It allows multiple developers to work together on the same codebase simultaneously, with features like live chat, real-time code synchronization, and intelligent code analysis using Google's Gemini AI.

## 🏗️ Project Architecture

```
CodeX/
├── Backend/                  # Node.js + Express server
│   ├── package.json
│   ├── server.js
│   └── src/
│       ├── app.js
│       ├── config/
│       │   └── config.js
│       ├── controllers/
│       │   ├── auth.controllers.js
│       │   └── project.controllers.js
│       ├── db/
│       │   └── db.js
│       ├── middlewares/
│       │   └── authMiddleware.js
│       ├── models/
│       │   ├── message.model.js
│       │   ├── project.model.js
│       │   └── team.model.js
│       ├── routes/
│       │   ├── auth.routes.js
│       │   └── project.routes.js
│       └── services/
│           ├── ai.service.js
│           ├── auth.service.js
│           └── project.service.js
├── Frontend/                 # React + Vite application
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── eslint.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── api/
│       │   └── config.jsx
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Navigation.jsx
│       │   │   ├── Layout.jsx
│       │   │   └── Sidebar.jsx
│       ├── routes/
│       │   └── Routes.jsx
│       └── views/
│           ├── NotFound.jsx
│           ├── auth/
│           │   ├── Login.jsx
│           │   └── Register.jsx
│           ├── create-project/
│           │   └── CreateProject.jsx
│           |── home/
│           |   ├── Home.jsx
│           |   └── project/
│           |        └── Project.jsx
│           ├── Dashboard.jsx
│           ├── Landing.jsx


```

## 🛠️ Technology Stack

### Backend Technologies

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **Socket.io** - Real-time bidirectional communication
- **MongoDB** - NoSQL database with Mongoose ODM
- **Google Gemini AI** - AI-powered code review service
- **CORS** - Cross-origin resource sharing

### Frontend Technologies

- **React 19** - Modern React with latest features
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Monaco Editor** - Professional code editor (VS Code-like)
- **Socket.io Client** - Real-time communication
- **React Router DOM** - Client-side routing

## 🔄 How It Works

### 1. Project Creation Flow

```
User → Create Project → Backend API → MongoDB → Project Created
```

### 2. Real-time Collaboration Flow

```
Developer A writes code → Socket.io → Developer B sees changes instantly
Developer B sends message → Socket.io → Developer A receives message
```

### 3. AI Code Review Flow

```
Developer requests review → AI Service → Gemini AI → Code analysis → Review displayed
```

## 🛣️ API Routes & Endpoints

### Backend Routes (`/projects`)

- **POST** `/create` - Create a new project
- **GET** `/get-all` - Retrieve all projects

### Socket.io Events

- `chat-history` - Get chat messages for a project
- `chat-message` - Send/receive chat messages
- `code-change` - Sync code changes across users
- `get-project-code` - Retrieve project code
- `get-review` - Request AI code review

## 📱 Frontend Routes

### React Router Configuration

- `/` - Home page (project list)
- `/create-project` - Create new project form
- `/project/:id` - Individual project workspace
- `/login` - User login
- `/register` - User registration
- `*` - NotFound page

## 🔌 Database Models

### Project Model

```javascript
{
  name: String (required),
  code: String (default: ""),
  review: String (default: ""),
  timestamps: true
}
```

### Message Model

```javascript
{
  project: ObjectId (reference to project),
  text: String (message content),
  timestamps: true
}
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB database
- Google Gemini AI API key

### Backend Setup

```bash
cd Backend
npm install
# Create .env file with GOOGLE_API_KEY
npm start
```

### Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

### Environment Variables

Create a `.env` file in the Backend directory:

```env
GOOGLE_API_KEY=your_gemini_api_key_here
MONGODB_URI=your_mongodb_connection_string
```

## 💡 Key Features

### 1. Real-time Collaboration

- **Live Code Sync**: Multiple developers can edit code simultaneously
- **Instant Updates**: Changes appear in real-time across all connected users
- **Project Rooms**: Each project has its own isolated collaboration space

### 2. AI-Powered Code Review

- **Intelligent Analysis**: Google Gemini AI analyzes code quality
- **Best Practices**: Suggests improvements and best practices
- **Code Optimization**: Identifies potential issues and optimizations

### 3. Professional Code Editor

- **Monaco Editor**: Industry-standard code editor (same as VS Code)
- **Syntax Highlighting**: Support for multiple programming languages
- **Auto-completion**: Intelligent code suggestions

### 4. Team Communication

- **Live Chat**: Real-time messaging within projects
- **Message History**: Persistent chat logs for each project
- **User Presence**: See who's currently working on the project

## 🔧 Development Workflow

### 1. Project Creation

1. User navigates to `/create-project`
2. Enters project name
3. Backend creates MongoDB document
4. User is redirected to project workspace

### 2. Collaborative Coding

1. Multiple users join the same project
2. Each user connects via Socket.io
3. Code changes are broadcasted to all users
4. Chat messages are synchronized in real-time

### 3. AI Code Review

1. Developer clicks "Get Review" button
2. Current code is sent to Gemini AI service
3. AI analyzes code and provides feedback
4. Review is displayed in markdown format

## 🌟 Why Choose This Architecture?

### 1. **Scalability**

- Microservices architecture with separate frontend/backend
- MongoDB for flexible data storage
- Socket.io for efficient real-time communication

### 2. **Developer Experience**

- Modern React with latest features
- Hot reloading with Vite
- Professional code editor experience
- Real-time collaboration without page refreshes

### 3. **AI Integration**

- Google Gemini AI for intelligent code analysis
- Structured feedback with actionable improvements
- Professional-grade code review capabilities

### 4. **Real-time Capabilities**

- Instant code synchronization
- Live chat functionality
- Real-time user presence
- Efficient WebSocket communication

## 🚀 Deployment

### Backend Deployment

- Deploy to platforms like Render, Heroku, or AWS
- Set environment variables for production
- Ensure MongoDB connection is accessible

### Frontend Deployment

- Build with `npm run build`
- Deploy static files to Vercel, Netlify, or any static hosting
- Configure API endpoints for production backend

## 🔒 Security Considerations

- CORS configuration for cross-origin requests
- Input validation on backend APIs
- Secure API key storage in environment variables
- MongoDB injection protection with Mongoose

## 📈 Future Enhancements

- User authentication and authorization
- Project sharing and permissions
- Multiple programming language support
- Git integration for version control
- Advanced AI features (code generation, debugging)
- Team management and collaboration tools

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For questions or issues:

- Check the documentation
- Review the code structure
- Open an issue on GitHub

---

**Happy Coding with CodeX! 🚀💻**
