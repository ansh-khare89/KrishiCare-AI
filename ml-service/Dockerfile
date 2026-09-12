FROM python:3.11-slim
WORKDIR /app
COPY requirements-base.txt .
RUN pip install --no-cache-dir -r requirements-base.txt tensorflow-cpu==2.16.2 || pip install --no-cache-dir -r requirements-base.txt tensorflow
COPY src/ src/
COPY models/ models/
EXPOSE 8000
CMD ["sh", "-c", "uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

