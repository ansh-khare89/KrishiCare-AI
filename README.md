# KrishiCare AI

AI-powered crop disease detection for **30+ crops** including tomato, potato, corn, apple, grape, pepper, peach, cherry, strawberry, orange, squash, blueberry, and soybean.

Upload a leaf photo → get disease ID, confidence, top-3 predictions, farming advisory, and optional Grad-CAM heatmap.

## Live Demo

- Frontend: https://krishi-care-ai.vercel.app
- Backend: https://krishicare-ai.onrender.com/api/health
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

Frontend: http://localhost:5173 | Backend: http://localhost:8080 | ML: http://localhost:8000

## Features

- Leaf upload (single + batch)
- **Support for 30+ crops** with 38 disease classes
- Top-3 disease predictions with confidence bars
- Grad-CAM heatmap (optional)
- Session-scoped history with pagination
- Dashboard analytics
- Disease encyclopedia
- Live weather advisory with city search
- Printable PDF diagnosis report
- Dark mode
- Swagger API docs at `/swagger-ui.html`
- Docker Compose + GitHub Actions CI

## Supported Crops

- **Tomato** (10 disease classes): Early blight, Late blight, Bacterial spot, Leaf mold, Septoria leaf spot, Spider mites, Target spot, Yellow leaf curl virus, Mosaic virus
- **Potato** (3 disease classes): Early blight, Late blight
- **Corn/Maize** (4 disease classes): Common rust, Northern leaf blight, Gray leaf spot
- **Apple** (4 disease classes): Apple scab, Black rot, Cedar apple rust
- **Grape** (4 disease classes): Black rot, Esca (Black Measles), Leaf blight
- **Pepper** (2 disease classes): Bacterial spot
- **Peach** (2 disease classes): Bacterial spot
- **Cherry** (2 disease classes): Powdery mildew
- **Strawberry** (2 disease classes): Leaf scorch
- **Orange** (1 disease class): Citrus greening
- **Squash** (1 disease class): Powdery mildew
- **Blueberry** (1 disease class): Healthy
- **Soybean** (1 disease class): Healthy

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/crop/predict` | Analyze one image (`explain=true` for heatmap) |
| POST | `/api/crop/predict/batch` | Analyze multiple images |
| GET | `/api/crop/history?page=0&size=12` | Paginated session history |
| GET | `/api/crop/analytics` | Dashboard stats |
| GET | `/api/health` | Backend + ML health |
| GET | `/api/weather?city=New Delhi` | Weather advisory for a city |

## API Documentation

Swagger UI:

```
http://localhost:8080/swagger-ui.html
```

## Training the Model

The ML service uses an enhanced MobileNetV2 architecture supporting 38 disease classes across 30+ crops.

### Download Dataset

```bash
cd ml-service
python src/download_dataset.py --max-per-class 200
```

This downloads images from the PlantVillage dataset and organizes them into train/val/test splits.

### Train Model

```bash
# Quick training (8 epochs, for testing)
python src/train_model.py --quick

# Full training (30 epochs, for production)
python src/train_model.py
```

The trained model will be saved to `ml-service/models/krishicare_mobilenetv2.h5`.

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Backend
SPRING_PROFILES_ACTIVE=dev
ML_SERVICE_URL=http://localhost:8000

# Weather API (optional - get free key from https://openweathermap.org/api)
WEATHER_API_KEY=your_api_key_here

# Frontend
VITE_API_URL=http://localhost:8080
```

## Deployment

### Render (Recommended for Production)

1. Push code to GitHub
2. Create Render account
3. Use `render.yaml` configuration for automatic deployment
4. Set environment variables in Render dashboard

### Vercel (Frontend)

```bash
cd frontend
npm run build
vercel --prod
```

### Local Development

```powershell
.\scripts\setup.ps1
.\scripts\start.ps1
```

## Troubleshooting

- **API Offline**: Check that backend is running on port 8080, or click "Wake Up" button in service status
- **ML Model Not Trained**: Run `.\scripts\train-model.ps1` or `python src/train_model.py --quick` in ml-service
- **Weather Search Not Working**: Add `WEATHER_API_KEY` to environment variables or use mock data (default)
- **CORS Errors**: Ensure frontend URL is in backend CORS configuration
- **Prediction Failing**: The current model supports only 6 classes (tomato/potato). Retrain with 38 classes using the training script
- **ML Service Waking Up**: Service is starting up or model is loading. Wait a moment and try again, or check ML service logs

## Model Retraining Required

The system has been upgraded to support 38 disease classes across 30+ crops. The existing model file was trained on only 6 classes (tomato and potato diseases). To enable full functionality:

1. **Quick Retraining (for testing)**:
   ```powershell
   .\scripts\train-model.ps1
   # Select option 1 for quick test (50 images per class, 8 epochs)
   ```

2. **Full Retraining (for production)**:
   ```powershell
   .\scripts\train-model.ps1
   # Select option 3 for full dataset (200 images per class, 30 epochs)
   ```

3. **Manual Training**:
   ```bash
   cd ml-service
   python src/download_dataset.py --max-per-class 200
   python src/train_model.py
   ```

After retraining, the new model will support: Tomato, Potato, Corn, Apple, Grape, Pepper, Peach, Cherry, Strawberry, Orange, Squash, Blueberry, and Soybean diseases.

## CI/CD

The project includes GitHub Actions workflows for automated build and testing. The frontend is deployed on Vercel, while the backend and ML service are deployed on Render.

## Author

Ansh Khare

- GitHub: https://github.com/ansh-khare89
- LinkedIn: https://www.linkedin.com/in/anshkhare21/
