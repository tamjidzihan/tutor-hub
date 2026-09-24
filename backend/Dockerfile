# Python 3.12 Alpine/Slim Image
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY . /app/

# Expose port
EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
