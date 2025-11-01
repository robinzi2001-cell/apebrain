#!/bin/bash
set -e

echo "🚀 Deploying ApeBrain to apebrain.cloud..."

cd /home/apebrain/apebrain.cloud

# Git Pull
echo "📥 Pulling latest code..."
git pull origin mainnew333

# Backend
echo "🐍 Setting up Backend..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate

# Frontend
echo "⚛️ Building Frontend..."
cd ../frontend
yarn install --frozen-lockfile
REACT_APP_BACKEND_URL=https://apebrain.cloud yarn build

# Restart Services
echo "🔄 Restarting services..."
sudo systemctl restart apebrain-backend
sudo systemctl reload nginx

echo "✅ Deployment complete!"
echo "🌐 Website: https://apebrain.cloud"
echo "🔧 Admin: https://apebrain.cloud/shroomsadmin"
echo "🛒 Shop: https://apebrain.cloud/shop"