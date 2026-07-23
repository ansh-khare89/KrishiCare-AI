# KrishiCare AI

AI-powered crop disease detection for **tomato** and **potato** leaves.

Upload a leaf photo → get disease ID, confidence, top-3 predictions, farming advisory, and optional Grad-CAM heatmap.

## Stack

| Layer | Tech | Port |
|-------|------|------|
| Frontend | React 19 + Vite + Tailwind | 5173 |
| Backend | Spring Boot 3.3 + JPA | 8080 |
| ML Service | Python + FastAPI + TensorFlow | 8000 |

## Quick start

```powershell
.\scripts\setup.ps1
.\scripts\start.ps1
```

Open **http://localhost:5173**

## Features

- Leaf upload (single + batch)
- Top-3 disease predictions with confidence bars
- Grad-CAM heatmap (optional)
- Session-scoped history with pagination
- Dashboard analytics
- Disease encyclopedia
- Printable PDF diagnosis report
- Dark mode
- Swagger API docs at `/swagger-ui.html`
- Docker Compose + GitHub Actions CI

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/crop/predict` | Analyze one image (`explain=true` for heatmap) |
| POST | `/api/crop/predict/batch` | Analyze multiple images |
| GET | `/api/crop/history?page=0&size=12` | Paginated session history |
| GET | `/api/crop/analytics` | Dashboard stats |
| GET | `/api/health` | Backend + ML health |

## Manual run

```bash
# ML
cd ml-service && uvicorn src.main:app --reload --port 8000

# Backend
cd backend && mvn spring-boot:run

# Frontend
cd frontend && npm run dev
```

## Docker

```bash
docker compose up --build
```

Frontend: http://localhost:5173 | Backend: http://localhost:8080 | ML: http://localhost:8000
