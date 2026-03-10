# Use Python base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy backend code
COPY backend /app

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose backend port
EXPOSE 8000

# Run backend
CMD ["python", "main.py"]
