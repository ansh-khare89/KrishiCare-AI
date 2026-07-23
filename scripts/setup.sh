#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo ""
echo "=== KrishiCare AI Setup ==="
echo ""

echo "[1/3] Setting up ML service..."
cd "$ROOT/ml-service"
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt -q

if [ ! -d "dataset/train/Tomato___healthy" ] || [ -z "$(ls -A dataset/train/Tomato___healthy 2>/dev/null)" ]; then
  echo "Downloading PlantVillage dataset subset..."
  python src/download_dataset.py --max-per-class 200
fi

if [ ! -f "models/krishicare_mobilenetv2.h5" ]; then
  echo "Training model (quick mode)..."
  python src/train_model.py --quick
fi

echo ""
echo "[2/3] Setting up frontend..."
cd "$ROOT/frontend"
npm install

echo ""
echo "[3/3] Compiling backend..."
cd "$ROOT/backend"
mvn -q compile -DskipTests

echo ""
echo "=== Setup complete! ==="
echo "Start services:"
echo "  ML:       cd ml-service && source venv/bin/activate && uvicorn src.main:app --reload --port 8000"
echo "  Backend:  cd backend && mvn spring-boot:run"
echo "  Frontend: cd frontend && npm run dev"
echo ""
