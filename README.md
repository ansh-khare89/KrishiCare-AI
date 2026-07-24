# KrishiCare AI

KrishiCare AI is a crop disease detection platform for tomato and potato leaves. It uses a MobileNetV2-based deep learning model to identify plant diseases from uploaded images and provides confidence scores, treatment recommendations, weather information, and prediction history.

## Live Demo

- Frontend: https://krishi-care-ai.vercel.app/
- Backend: https://krishicare-ai.onrender.com
- ML Service: https://krishicare-ml.onrender.com

## Tech Stack

| Layer | Technology |
|--------|------------|
| Frontend | React 19, Vite, Tailwind CSS, Axios |
| Backend | Spring Boot 3.3, Spring Security, Spring Data JPA |
| ML Service | FastAPI, TensorFlow, MobileNetV2 |
| Database | PostgreSQL (Neon) |
| Storage | Local Storage / Cloudinary |
| Deployment | Vercel, Render |
| CI/CD | GitHub Actions |

## Features

- Crop disease prediction from leaf images
- Top 3 disease predictions with confidence scores
- Grad-CAM visualization
- Disease severity estimation
- Farming advisory generation
- Batch image prediction
- Prediction history with pagination
- Dashboard analytics
- Disease encyclopedia
- Weather advisory
- PDF diagnosis report generation
- REST APIs with Swagger documentation
- Docker support
- GitHub Actions workflow

## Project Structure

```text
KrishiCare-AI
│
├── frontend/          React application
├── backend/           Spring Boot REST API
├── ml-service/        FastAPI ML microservice
├── docker-compose.yml
└── README.md
```

## Running Locally

Clone the repository.

```bash
git clone https://github.com/ansh-khare89/KrishiCare-AI.git
cd KrishiCare-AI
```

### Using Scripts (Windows)

```powershell
.\scripts\setup.ps1
.\scripts\start.ps1
```

### Manual Setup

Start the ML service.

```bash
cd ml-service
uvicorn src.main:app --reload --port 8000
```

Start the backend.

```bash
cd backend
mvn spring-boot:run
```

Start the frontend.

```bash
cd frontend
npm install
npm run dev
```

Open:

```
http://localhost:5173
```

## Docker

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8080 |
| ML Service | http://localhost:8000 |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/crop/predict` | Predict disease from a single image |
| POST | `/api/crop/predict/batch` | Predict diseases from multiple images |
| GET | `/api/crop/history` | Retrieve prediction history |
| GET | `/api/crop/analytics` | Dashboard statistics |
| GET | `/api/weather` | Weather information |
| GET | `/api/health` | Backend and ML service health status |

## API Documentation

Swagger UI:

```
http://localhost:8080/swagger-ui.html
```

## Environment Variables

### Backend

```properties
DATABASE_URL=
DATABASE_USERNAME=
DATABASE_PASSWORD=

JWT_SECRET=

OPENWEATHER_API_KEY=

ML_SERVICE_URL=
```

### ML Service

```properties
MODEL_PATH=models/krishicare_mobilenetv2.h5
```

## CI/CD

The project includes GitHub Actions workflows for automated build and testing. The frontend is deployed on Vercel, while the backend and ML service are deployed on Render.

## Author

Ansh Khare

- GitHub: https://github.com/ansh-khare89
- LinkedIn: https://www.linkedin.com/in/anshkhare21/
