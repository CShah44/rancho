FROM python:3.10-slim

# Install essential system dependencies for Manim with proper LaTeX support
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
    texlive-latex-recommended \
    texlive-fonts-recommended \
    texlive-latex-extra \
    dvipng \
    dvisvgm \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies with no cache to save space
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories with proper permissions
RUN mkdir -p /tmp/manim_temp && \
    chmod 755 /tmp/manim_temp

# Set environment variables for better performance
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Expose port
EXPOSE 8000

# Use a startup script to handle PORT variable
CMD ["sh", "-c", "uvicorn index:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1 --timeout-keep-alive 300"]
