# EduCircle - Collaborative Study Platform

![EduCircle](https://img.shields.io/badge/EduCircle-Study%20Together-6366f1)
![React](https://img.shields.io/badge/React-18-61dafb)
![Firebase](https://img.shields.io/badge/Firebase-Realtime-orange)

**EduCircle** is a modern collaborative study platform where students can create study rooms, chat in real-time, share and edit notes, create custom flashcards, and track study goals together.

## ✨ Features

- 🔐 **Authentication** - Email/password and Google OAuth
- 🏠 **Study Rooms** - Create and join collaborative study spaces
- 💬 **Real-time Chat** - Live messaging with timestamps and avatars
- 📝 **Manual Notes** - Create, upload (.txt), and edit study notes manually
- 🎴 **Custom Flashcards** - Create and study your own flashcard decks
- 🎯 **Study Goals** - Track progress and milestones with your group
- 🎨 **Modern UI** - Glassmorphism design with smooth animations
- 📱 **Responsive** - Works on desktop, tablet, and mobile

## 🚀 Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Firebase SDK** - Authentication, Firestore, Storage
- **Framer Motion** - Animations
- **React Icons** - Icon library
- **date-fns** - Date formatting
- **react-hot-toast** - Notifications
- **axios** - HTTP client

### Backend
- **Firebase** - Authentication, Firestore, Storage
- **Python Flask** - AI processing server
- **Flask-CORS** - Cross-origin support

### AI (Optional Upgrade)
- **Hugging Face** - Transformers for summarization
- **BART/T5** - Summarization models

## 📁 Project Structure

```
EduCircle/
├── public/                 # Static files
├── src/
│   ├── components/         # React components
│   │   ├── ChatBox.jsx
│   │   ├── Flashcards.jsx
│   │   ├── Navbar.jsx
│   │   ├── NoteUploader.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── StudyGoals.jsx
│   ├── pages/              # Page components
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── Room.jsx
│   │   └── Signup.jsx
│   ├── services/           # Firebase & API services
│   │   ├── auth.js
│   │   ├── chatService.js
│   │   ├── firebase.js
│   │   ├── goalsService.js
│   │   ├── notesService.js
│   │   └── roomService.js
│   ├── styles/             # CSS files
│   │   ├── components.css
│   │   └── index.css
│   ├── App.jsx
│   └── main.jsx
├── backend/                # Python AI backend
│   ├── ai_service.py
│   ├── app.py
│   └── requirements.txt
├── .env.example
├── package.json
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Firebase account

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd EduCircle
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password and Google)
4. Create a Firestore database
5. Create a Storage bucket
6. Copy your Firebase config

### 3. Frontend Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your Firebase config to .env
# VITE_FIREBASE_API_KEY=your_api_key
# VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
# ... etc
```

### 4. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔧 Configuration

### Firebase Security Rules

**Firestore Rules** (`firestore.rules`):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    match /rooms/{roomId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid in resource.data.participants;
    }
    
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    match /notes/{noteId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    match /goals/{goalId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

**Storage Rules** (`storage.rules`):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /notes/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
                   && request.resource.size < 10 * 1024 * 1024;
    }
  }
}
```

## 🎨 Design Features

- **Dark Theme** - Deep purple/blue gradient color scheme
- **Glassmorphism** - Frosted glass effect on cards and modals
- **Smooth Animations** - Fade, slide, and glow effects
- **Responsive Design** - Mobile-first approach
- **Modern Typography** - Inter and JetBrains Mono fonts

## 🚀 Deployment

### Frontend (Firebase Hosting)

```bash
npm run build
firebase deploy --only hosting
```

### Backend (Render/Heroku)

1. Create a new web service
2. Connect your repository
3. Set build command: `pip install -r backend/requirements.txt`
4. Set start command: `cd backend && python app.py`
5. Add environment variables

## 🔮 Future Enhancements

- [ ] Upgrade to Hugging Face AI models
- [ ] Video/audio chat with WebRTC
- [ ] AI chatbot for homework help
- [ ] Gamification and points system
- [ ] Calendar integration
- [ ] Mobile app (React Native)
- [ ] PDF/DOCX support for notes
- [ ] Export flashcards to Anki

## 📝 License

MIT License - feel free to use this project for learning and development!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Made with ❤️ for students everywhere**
