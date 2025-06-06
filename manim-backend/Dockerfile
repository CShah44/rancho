FROM python:3.10-slim

# Install only essential system dependencies for Manim
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libcairo2-dev \
    libpango1.0-dev \
    libgdk-pixbuf2.0-dev \
    libffi-dev \
    build-essential \
    pkg-config \
    espeak \
    espeak-data \
    libespeak1 \
    libespeak-dev \
    texlive-latex-base \
    texlive-fonts-recommended \
    dvipng \
    dvisvgm \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p /tmp/manim_temp

# Expose port
EXPOSE 8000

# Use a startup script to handle PORT variable
CMD ["sh", "-c", "uvicorn index:app --host 0.0.0.0 --port ${PORT:-8000}"]
