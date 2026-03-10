# Use Python base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy backend code
COPY backend/ ./backend

# Install dependencies
RUN pip install --no-cache-dir -r backend/requirements.txt

# Expose backend port
EXPOSE 8000

# Run backend
CMD ["python", "backend/app.py"]
