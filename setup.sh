#!/bin/bash

# EduCircle Setup Script
# This script helps you set up the project quickly

echo "🎓 EduCircle Setup Script"
echo "========================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created!"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your Firebase credentials!"
    echo "   Open .env in your editor and replace the placeholder values."
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Check if backend venv exists
if [ ! -d backend/venv ]; then
    echo "🐍 Setting up Python backend..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
    echo "✅ Python backend ready!"
    echo ""
else
    echo "✅ Python backend already set up"
    echo ""
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
    echo "✅ Frontend dependencies installed!"
    echo ""
else
    echo "✅ Frontend dependencies already installed"
    echo ""
fi

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env and add your Firebase credentials"
echo "2. Start the backend: cd backend && source venv/bin/activate && python app.py"
echo "3. Start the frontend: npm run dev"
echo ""
echo "📚 Read the walkthrough for detailed instructions!"
