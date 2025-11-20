# Use a lightweight base image
FROM python:3.11-slim

# Set work directory
WORKDIR /app

# Install system dependencies (needed for psycopg2)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy Python dependencies first (better caching)
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy the app code
COPY . .

# Expose the port your app runs on
EXPOSE 5000

# Run using Gunicorn (production WSGI server)
# "app:app" refers to:
#   app/__init__.py -> variable "app"
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]